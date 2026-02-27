<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Operator;
use App\Models\LedgerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('mock_role');

        if ($role === 'operator') {
            // Find the user with role operator and their associated operator_id
            $user = \App\Models\User::where('role', 'operator')->first();
            $operator = $user->operator;
        } else {
            // Fallback for admin/testing
            $operator = Operator::first();
        }

        if (!$operator)
            return response()->json(['error' => 'No operator found'], 404);

        $wallet = $operator->wallet()->first();
        if (!$wallet) {
            $wallet = $operator->wallet()->create(['balance_minor' => 0]);
        }

        $transactions = LedgerTransaction::where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate Monthly Stats
        $startOfMonth = now()->startOfMonth();
        $usageMonthly = LedgerTransaction::where('wallet_id', $wallet->id)
            ->where('type', 'DEBIT')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount_minor');

        $topupsMonthly = LedgerTransaction::where('wallet_id', $wallet->id)
            ->where('type', 'CREDIT')
            ->where('category', 'TOPUP')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount_minor');

        return response()->json([
            'balance_minor' => $wallet->balance_minor,
            'operator' => $operator->name,
            'transactions' => $transactions,
            'stats' => [
                'usage_monthly_minor' => (int) $usageMonthly,
                'topups_monthly_minor' => (int) $topupsMonthly
            ]
        ]);
    }

    public function topup(Request $request)
    {
        $request->validate([
            'amount_minor' => 'required|integer|min:100'
        ]);

        $role = $request->query('mock_role');
        if ($role === 'operator') {
            $user = \App\Models\User::where('role', 'operator')->first();
            $operator = $user->operator;
        } else {
            $operator = Operator::first();
        }

        $wallet = $operator->wallet;
        $amount = $request->input('amount_minor');

        return DB::transaction(function () use ($wallet, $amount) {
            // Reload wallet
            $wallet->increment('balance_minor', $amount);

            // Record in ledger
            LedgerTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'CREDIT',
                'category' => 'TOPUP',
                'amount_minor' => $amount,
                'ref_type' => 'topup',
                'ref_id' => (string) Str::uuid(), // In prod this would be the payment ref
                'idempotency_key' => 'TP-' . strtoupper(Str::random(10))
            ]);

            return response()->json([
                'message' => 'Top-up successful',
                'new_balance_minor' => $wallet->fresh()->balance_minor
            ]);
        });
    }
}
