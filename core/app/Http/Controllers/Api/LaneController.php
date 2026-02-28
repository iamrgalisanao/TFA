<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lane;
use App\Models\LaneEvent;
use App\Models\LaneOverride;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Wallet;
use App\Models\LedgerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LaneController extends Controller
{
    // --- Lane Management ---
    public function index()
    {
        return response()->json(Lane::all());
    }

    public function show($id)
    {
        $lane = Lane::find($id);
        if (!$lane)
            return response()->json(['error' => 'Lane not found'], 404);
        return response()->json($lane);
    }

    public function override(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:FORCE_OPEN,FORCE_CLOSE,LOCK,RELEASE',
            'reason' => 'required|string|min:5',
            'mock_role' => 'nullable|string'
        ]);

        $lane = Lane::find($id);
        if (!$lane)
            return response()->json(['error' => 'Lane not found'], 404);

        $role = $request->input('mock_role', 'staff');
        if (!in_array($role, ['admin', 'staff'])) {
            return response()->json(['error' => 'Unauthorized override attempt recorded.'], 403);
        }

        return DB::transaction(function () use ($lane, $request) {
            $user = User::where('role', $request->input('mock_role', 'staff'))->first();

            LaneOverride::create([
                'lane_id' => $lane->id,
                'user_id' => $user->id,
                'action' => $request->action,
                'reason' => $request->reason,
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]
            ]);

            if ($request->action === 'FORCE_OPEN') {
                $lane->barrier_status = 'OPEN';
            } elseif ($request->action === 'FORCE_CLOSE') {
                $lane->barrier_status = 'CLOSED';
            } elseif ($request->action === 'LOCK') {
                $lane->status = 'DISABLED';
                $lane->barrier_status = 'CLOSED';
            } elseif ($request->action === 'RELEASE') {
                $lane->status = 'ACTIVE';
            }

            $lane->save();

            return response()->json([
                'message' => "Lane {$lane->id} instruction '{$request->action}' sent to Edge successfully.",
                'lane' => $lane
            ]);
        });
    }

    // --- Demo / Simulator Integration ---
    public function triggerCameraSimulator(Request $request)
    {
        // The script is in the global tools folder, one level up from the core logic
        $scriptPath = base_path('../tools/usb_camera_simulator.py');

        // Launch asynchronously on the host machine so PHP doesn't block
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $toolsDir = realpath(base_path('../tools'));
            // The shell launched by PHP might not have the same python path/envs as your manual terminal.
            // We run a quick pip install to ensure cv2 and other requirements are present in this environment before launching.
            $cmd = "start \"Edge Simulator\" cmd.exe /k \"cd /d {$toolsDir} && pip install opencv-python pytesseract requests Pillow numpy && python usb_camera_simulator.py\"";
            pclose(popen($cmd, "r"));
        } else {
            exec("python \"$scriptPath\" > /dev/null 2>&1 &");
        }

        return response()->json([
            'message' => 'Edge Camera Simulator activated. Check your host machine.'
        ]);
    }

    // --- Lane Events (Traffic Feed & Decision Engine) ---
    public function events(Request $request)
    {
        // Exclude raw_payload to prevent massive JSON serialization overhead on polling
        return response()->json(
            LaneEvent::select('id', 'event_uuid', 'camera_event_id', 'plate_number', 'lane_id', 'direction', 'event_timestamp', 'image_url', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
        );
    }

    public function ingest(Request $request)
    {
        // 1. Validation & Fast Ingest
        $validated = $request->validate([
            'event_uuid' => 'required|uuid|unique:lane_events',
            'camera_event_id' => 'required|string',
            'plate_number' => 'required|string',
            'lane_id' => 'required|exists:lanes,id',
            'direction' => 'required|in:entry,exit',
            'timestamp' => 'required|date',
            'signature' => 'required|string'
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Persist Event
            $event = LaneEvent::create([
                'id' => (string) Str::uuid(),
                'event_uuid' => $validated['event_uuid'],
                'camera_event_id' => $validated['camera_event_id'],
                'plate_number' => $validated['plate_number'],
                'lane_id' => $validated['lane_id'],
                'direction' => $validated['direction'],
                'event_timestamp' => $validated['timestamp'],
                'signature' => $validated['signature'],
                'raw_payload' => $request->all()
            ]);

            $decision = [
                'core_event_id' => $event->id,
                'lane_id' => $event->lane_id,
                'action' => 'hold',
                'reason' => 'pending_logic',
                'exception_flag' => false
            ];

            // 2. Decision Logic
            $plate = strtoupper($validated['plate_number']);
            $vehicle = Vehicle::where('plate_number', $plate)->first();

            if ($validated['direction'] === 'entry') {
                // Trip Start
                $trip = Trip::create([
                    'plate_number' => $plate,
                    'status' => 'ENTRY_RECORDED',
                    'entry_event_id' => $event->id,
                    'entry_time' => $validated['timestamp']
                ]);

                $decision['action'] = 'open';
                $decision['trip_id'] = $trip->id;
                $decision['reason'] = 'entry_recorded';
            } else {
                // Trip End & Payment Deduction
                $trip = Trip::where('plate_number', $plate)
                    ->whereIn('status', ['ENTRY_RECORDED', 'HELD_INSUFFICIENT_FUNDS'])
                    ->orderBy('created_at', 'desc')
                    ->first();

                if (!$trip) {
                    $decision['action'] = 'hold';
                    $decision['reason'] = 'no_active_entry_record';
                    $decision['exception_flag'] = true;
                } else {
                    $fee_minor = 5000; // Flat 50.00 PHP for simulation
                    $wallet = $vehicle ? Wallet::where('operator_id', $vehicle->operator_id)->first() : null;

                    if ($wallet && $wallet->balance_minor >= $fee_minor) {
                        // Deduct
                        $wallet->balance_minor -= $fee_minor;
                        $wallet->save();

                        // Ledger
                        LedgerTransaction::create([
                            'wallet_id' => $wallet->id,
                            'type' => 'DEBIT',
                            'category' => 'TRIP_FEE',
                            'amount_minor' => $fee_minor,
                            'ref_type' => 'trip',
                            'ref_id' => $trip->id,
                            'idempotency_key' => $event->event_uuid
                        ]);

                        $trip->update([
                            'status' => 'EXIT_PAID',
                            'exit_event_id' => $event->id,
                            'exit_time' => $validated['timestamp'],
                            'fee_minor' => $fee_minor
                        ]);

                        $decision['action'] = 'open';
                        $decision['trip_id'] = $trip->id;
                        $decision['reason'] = 'fee_deducted';
                        $decision['wallet_balance_after_minor'] = $wallet->balance_minor;
                    } else {
                        $trip->update(['status' => 'HELD_INSUFFICIENT_FUNDS']);
                        $decision['action'] = 'hold';
                        $decision['reason'] = 'insufficient_funds';
                        $decision['exception_flag'] = true;
                    }
                }
            }

            // Sync Lane Barrier Status (Mock instruction to hardware)
            if ($decision['action'] === 'open') {
                Lane::where('id', $event->lane_id)->update(['barrier_status' => 'OPEN']);
            }

            return response()->json($decision, 201);
        });
    }
}
