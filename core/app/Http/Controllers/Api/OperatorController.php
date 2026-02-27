<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Operator;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OperatorController extends Controller
{
    /**
     * List all operators with stats (admin only)
     */
    public function index(Request $request)
    {
        $operators = Operator::with(['wallet', 'vehicles'])->get();

        $result = $operators->map(function ($op) {
            $plates = $op->vehicles->pluck('plate_number');
            $tripCount = Trip::whereIn('plate_number', $plates)->count();
            $paidCount = Trip::whereIn('plate_number', $plates)->where('status', 'EXIT_PAID')->count();
            $totalCollected = Trip::whereIn('plate_number', $plates)->where('status', 'EXIT_PAID')->sum('fee_minor');

            return [
                'id' => $op->id,
                'name' => $op->name,
                'email' => $op->email,
                'contact_number' => $op->contact_number,
                'wallet_id' => $op->wallet?->id,
                'balance_minor' => $op->wallet?->balance_minor ?? 0,
                'balance_display' => '₱' . number_format(($op->wallet?->balance_minor ?? 0) / 100, 2),
                'vehicle_count' => $op->vehicles->count(),
                'trip_count' => $tripCount,
                'paid_trip_count' => $paidCount,
                'total_collected_minor' => $totalCollected,
                'total_collected_display' => '₱' . number_format($totalCollected / 100, 2),
                'status' => ($op->wallet?->balance_minor ?? 0) < 5000 ? 'LOW_BALANCE' : 'ACTIVE',
                'created_at' => $op->created_at,
            ];
        });

        return response()->json([
            'total' => $result->count(),
            'operators' => $result,
        ]);
    }

    /**
     * Show single operator with full detail
     */
    public function show($id)
    {
        $op = Operator::with(['wallet', 'vehicles'])->findOrFail($id);
        $plates = $op->vehicles->pluck('plate_number');

        $trips = Trip::whereIn('plate_number', $plates)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $ledgerTotal = Trip::whereIn('plate_number', $plates)
            ->where('status', 'EXIT_PAID')
            ->sum('fee_minor');

        return response()->json([
            'operator' => $op,
            'wallet' => $op->wallet,
            'vehicles' => $op->vehicles,
            'recent_trips' => $trips,
            'stats' => [
                'total_trips' => $trips->count(),
                'paid_trips' => $trips->where('status', 'EXIT_PAID')->count(),
                'total_collected' => '₱' . number_format($ledgerTotal / 100, 2),
                'balance' => '₱' . number_format(($op->wallet?->balance_minor ?? 0) / 100, 2),
            ]
        ]);
    }

    /**
     * Create a new operator (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3',
            'email' => 'required|email|unique:operators,email',
            'contact_number' => 'required|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $operator = Operator::create($validated);
            // Auto-create wallet with 0 balance
            $operator->wallet()->create(['balance_minor' => 0]);

            return response()->json([
                'message' => 'Operator created successfully.',
                'operator' => $operator->load('wallet'),
            ], 201);
        });
    }

    /**
     * Update operator details
     */
    public function update(Request $request, $id)
    {
        $op = Operator::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|min:3',
            'email' => "sometimes|email|unique:operators,email,{$id}",
            'contact_number' => 'sometimes|string',
        ]);

        $op->update($validated);

        return response()->json([
            'message' => 'Operator updated.',
            'operator' => $op,
        ]);
    }

    /**
     * Admin top-up for a specific operator wallet
     */
    public function topup(Request $request, $id)
    {
        $op = Operator::with('wallet')->findOrFail($id);

        $request->validate([
            'amount_minor' => 'required|integer|min:100',
            'note' => 'nullable|string',
        ]);

        $wallet = $op->wallet;
        if (!$wallet) {
            $wallet = $op->wallet()->create(['balance_minor' => 0]);
        }

        $wallet->balance_minor += $request->amount_minor;
        $wallet->save();

        // Ledger Entry
        \App\Models\LedgerTransaction::create([
            'wallet_id' => $wallet->id,
            'type' => 'CREDIT',
            'category' => 'WALLET_TOPUP',
            'amount_minor' => $request->amount_minor,
            'ref_type' => 'manual_topup',
            'ref_id' => $op->id,
            'idempotency_key' => (string) \Illuminate\Support\Str::uuid(),
        ]);

        return response()->json([
            'message' => 'Top-up successful.',
            'balance_after_minor' => $wallet->balance_minor,
            'balance_after_display' => '₱' . number_format($wallet->balance_minor / 100, 2),
        ]);
    }
}
