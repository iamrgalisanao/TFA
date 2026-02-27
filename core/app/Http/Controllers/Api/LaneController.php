<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lane;
use App\Models\LaneEvent;
use App\Models\LaneOverride;
use App\Models\User;
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

    // --- Lane Events (Traffic Feed) ---
    public function events(Request $request)
    {
        return response()->json(LaneEvent::orderBy('created_at', 'desc')->limit(50)->get());
    }

    public function ingest(Request $request)
    {
        $validated = $request->validate([
            'event_uuid' => 'required|uuid|unique:lane_events',
            'camera_event_id' => 'required|string',
            'plate_number' => 'required|string',
            'lane_id' => 'required|exists:lanes,id',
            'direction' => 'required|in:entry,exit',
            'timestamp' => 'required|date',
            'signature' => 'required|string'
        ]);

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

        return response()->json(['status' => 'success', 'core_event_id' => $event->id], 201);
    }
}
