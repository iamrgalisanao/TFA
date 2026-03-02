<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Dispute;
use App\Models\Operator;

class DisputeController extends Controller
{
    public function index(Request $request)
    {
        // Mock authentication: Get the first operator
        $operator = Operator::first();

        if (!$operator) {
            return response()->json([], 200);
        }

        $disputes = Dispute::where('operator_id', $operator->id)
            ->with(['ledgerTransaction', 'wallet'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($disputes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:INCORRECT_DEDUCTION,MISSING_TOPUP,OTHER',
            'description' => 'required|string|min:10|max:1000',
            'ledger_transaction_id' => 'nullable|exists:ledger_transactions,id'
        ]);

        $operator = Operator::first();
        if (!$operator || !$operator->wallet) {
            return response()->json(['error' => 'Operator or Wallet not found'], 404);
        }

        // Generate a random reference code e.g. DSP-2026-XXXX
        $refCode = 'DSP-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4));

        $dispute = Dispute::create([
            'operator_id' => $operator->id,
            'wallet_id' => $operator->wallet->id,
            'ledger_transaction_id' => $validated['ledger_transaction_id'] ?? null,
            'reference_code' => $refCode,
            'type' => $validated['type'],
            'status' => 'OPEN',
            'description' => $validated['description']
        ]);

        return response()->json([
            'message' => 'Dispute submitted successfully',
            'dispute' => $dispute
        ], 201);
    }

    public function show($id)
    {
        $operator = Operator::first();
        $dispute = Dispute::where('id', $id)->where('operator_id', $operator->id)->with('ledgerTransaction')->firstOrFail();
        return response()->json($dispute);
    }
}
