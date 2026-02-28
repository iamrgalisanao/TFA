<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\LaneController;
use App\Http\Controllers\Api\OperatorController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\KioskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    // Lanes & Overrides
    Route::get('/lanes', [LaneController::class, 'index']);
    Route::post('/lanes/{id}/override', [LaneController::class, 'override']);

    // Traffic Feed (Events)
    Route::post('/lane/event', [LaneController::class, 'ingest']);
    Route::post('/lane/trigger-camera', [LaneController::class, 'triggerCameraSimulator']);
    Route::get('/lane/events', [LaneController::class, 'events']);
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::post('/wallet/topup', [WalletController::class, 'topup']);

    // Trips & Audit
    Route::get('/trips', [TripController::class, 'index']);
    Route::get('/trips/{id}', [TripController::class, 'show']);

    // Operators (Admin)
    Route::get('/operators', [OperatorController::class, 'index']);
    Route::post('/operators', [OperatorController::class, 'store']);
    Route::get('/operators/{id}', [OperatorController::class, 'show']);
    Route::put('/operators/{id}', [OperatorController::class, 'update']);
    Route::post('/operators/{id}/topup', [OperatorController::class, 'topup']);

    // Audit Logs (Admin)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    // Dedicated Kiosk Routes
    Route::prefix('kiosk')->group(function () {
        Route::get('/lookup-wallet', [KioskController::class, 'lookupWallet']);
        Route::post('/generate-qr', [KioskController::class, 'generateQr']);
        Route::get('/tx-status/{txId}', [KioskController::class, 'txStatus']);
        Route::post('/cash-deposit', [KioskController::class, 'cashDeposit']);
    });
});
