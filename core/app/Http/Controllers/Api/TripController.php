<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\Wallet;
use App\Models\LedgerTransaction;
use Illuminate\Http\Request;

class TripController extends Controller
{
    /**
     * Full Audit Transaction List
     * - Admin: All trips across all operators
     * - Operator: Only trips for their registered vehicles
     */
    public function index(Request $request)
    {
        $role = $request->input('mock_role', 'admin');

        $query = Trip::with([
            'entryEvent:id,lane_id,event_timestamp,image_url',
            'exitEvent:id,lane_id,event_timestamp,image_url',
        ])->orderBy('created_at', 'desc');

        // For operator, filter by plates belonging to their vehicles
        if ($role === 'operator') {
            $operator = \App\Models\Operator::first(); // mock: first operator
            $plates = Vehicle::where('operator_id', $operator->id)->pluck('plate_number');
            $query->whereIn('plate_number', $plates);
        }

        $trips = $query->limit(100)->get();

        // Attach ledger entries and compute display values
        $result = $trips->map(function ($trip) {
            $ledger = LedgerTransaction::where('ref_id', $trip->id)->first();
            $vehicle = Vehicle::where('plate_number', $trip->plate_number)->first();

            return [
                'id' => $trip->id,
                'plate_number' => $trip->plate_number,
                'vehicle_type' => $vehicle->vehicle_type ?? 'Unknown',
                'status' => $trip->status,
                'entry_lane' => $trip->entryEvent?->lane_id,
                'exit_lane' => $trip->exitEvent?->lane_id,
                'entry_time' => $trip->entryEvent?->event_timestamp,
                'exit_time' => $trip->exitEvent?->event_timestamp,
                'fee_minor' => $trip->fee_minor ?? 0,
                'fee_display' => $trip->fee_minor ? '₱' . number_format($trip->fee_minor / 100, 2) : '—',
                'ledger_id' => $ledger?->id,
                'idempotency_key' => $ledger?->idempotency_key,
                'debit_confirmed' => $ledger !== null,
                'duration_seconds' => ($trip->entryEvent && $trip->exitEvent)
                    ? $trip->exitEvent->event_timestamp->diffInSeconds($trip->entryEvent->event_timestamp)
                    : null,
            ];
        });

        return response()->json([
            'total' => $result->count(),
            'trips' => $result,
        ]);
    }

    /**
     * Single trip full audit trail
     */
    public function show($id)
    {
        $trip = Trip::with(['entryEvent', 'exitEvent'])->findOrFail($id);
        $ledger = LedgerTransaction::where('ref_id', $trip->id)->first();
        $vehicle = Vehicle::where('plate_number', $trip->plate_number)->first();

        return response()->json([
            'trip' => $trip,
            'vehicle' => $vehicle,
            'ledger' => $ledger,
        ]);
    }
}
