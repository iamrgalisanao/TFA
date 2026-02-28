<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Wallet;
use App\Models\LedgerTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KioskController extends Controller
{
    // 1. Identify wallet by Plate Number
    public function lookupWallet(Request $request)
    {
        $request->validate(['plate' => 'required|string']);

        $vehicle = Vehicle::where('plate_number', strtoupper($request->plate))->first();
        if (!$vehicle || !$vehicle->operator || !$vehicle->operator->wallet) {
            return response()->json(['success' => false, 'message' => 'Vehicle or linked wallet not found.'], 404);
        }

        $wallet = $vehicle->operator->wallet;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $wallet->id,
                'balance' => $wallet->balance_minor,
                'operator' => $vehicle->operator->name
            ]
        ]);
    }

    // 2. Generate E-Wallet / QRPh code
    public function generateQr(Request $request)
    {
        $request->validate([
            'wallet_id' => 'required|string',
            'method' => 'required|string',
            'plate' => 'required|string'
        ]);

        $wallet = Wallet::findOrFail($request->wallet_id);

        // Generate a mock transaction ID
        $txId = 'KIOSK-QR-' . strtoupper(Str::random(8));

        // In a real scenario, this is where we call GCash/PayMongo to get a payment URL or QR Code.
        // For the simulation, we'll just return a mock URL
        $mockUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode("PAY-{$txId}-{$request->plate}");

        return response()->json([
            'success' => true,
            'transaction_id' => $txId,
            'qr_url' => $mockUrl,
            'message' => 'QR Code generated.'
        ]);
    }

    // 3. Status Poller (Mock)
    public function txStatus($txId)
    {
        // Mock success chance after a few polls
        // For the MVP, we just assume it succeeds after standard generation.
        // Real implementation would check the DB for webhook completion or query payment aggregator API
        return response()->json([
            'success' => true,
            'status' => 'success'
        ]);
    }

    // 4. Accept physical cash deposit
    public function cashDeposit(Request $request)
    {
        $request->validate([
            'wallet_id' => 'required|string',
            'amount_minor' => 'required|integer|min:100', // Cannot be zero
            'plate' => 'required|string'
        ]);

        $wallet = Wallet::findOrFail($request->wallet_id);

        DB::transaction(function () use ($wallet, $request) {
            $amount = $request->amount_minor;

            // Log Transaction (Model is named LedgerTransaction)
            LedgerTransaction::create([
                'wallet_id' => $wallet->id,
                'amount_minor' => $amount,
                'type' => 'CREDIT',
                'category' => 'TOPUP_CASH_KIOSK',
                'idempotency_key' => 'KIOSK-CASH-' . Str::uuid(),
                'ref_type' => 'KIOSK_PAYMENT',
                'ref_id' => 'PLATE-' . $request->plate
            ]);

            // Credit the account
            $wallet->balance_minor += $amount;
            $wallet->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Cash deposit successful.'
        ]);
    }
}
