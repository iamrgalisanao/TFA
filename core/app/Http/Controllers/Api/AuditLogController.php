<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaneOverride;
use App\Models\LedgerTransaction;
use App\Models\LaneEvent;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Unified audit log — merges lane overrides, ledger entries, and lane events.
     * Sorted chronologically descending. Admin only.
     */
    public function index(Request $request)
    {
        $category = $request->input('category', 'ALL');
        $limit = min((int) $request->input('limit', 100), 500);

        $entries = collect();

        // 1. Lane Override Events (manual barrier actions by staff/admin)
        if (in_array($category, ['ALL', 'OVERRIDE'])) {
            $overrides = LaneOverride::with(['lane', 'user'])->orderBy('created_at', 'desc')->limit($limit)->get();
            foreach ($overrides as $o) {
                $userName = $o->user?->name ?? 'Unknown';
                $userRole = $o->user?->role ?? 'unknown';
                $entries->push([
                    'id' => $o->id,
                    'category' => 'OVERRIDE',
                    'severity' => 'WARNING',
                    'icon' => 'shield',
                    'title' => "Manual Override: {$o->action}",
                    'description' => "Lane {$o->lane_id} forced {$o->action} by {$userName}. Reason: {$o->reason}",
                    'actor' => $userName,
                    'actor_role' => $userRole,
                    'ref_id' => $o->lane_id,
                    'ref_type' => 'lane',
                    'metadata' => $o->metadata,
                    'timestamp' => $o->created_at,
                ]);
            }
        }

        // 2. Ledger Transactions (all financial events)
        if (in_array($category, ['ALL', 'LEDGER'])) {
            $ledger = LedgerTransaction::with('wallet.operator')->orderBy('created_at', 'desc')->limit($limit)->get();
            foreach ($ledger as $l) {
                $operatorName = $l->wallet?->operator?->name ?? 'Unknown Operator';
                $amtDisplay = '₱' . number_format($l->amount_minor / 100, 2);
                $lType = $l->type;
                $lCategory = $l->category;
                $lRefType = $l->ref_type;
                $lRefId = $l->ref_id;
                $entries->push([
                    'id' => $l->id,
                    'category' => 'LEDGER',
                    'severity' => $l->type === 'DEBIT' ? 'INFO' : 'SUCCESS',
                    'icon' => 'landmark',
                    'title' => "{$lType}: {$lCategory} ({$amtDisplay})",
                    'description' => "{$lType} of {$amtDisplay} on wallet of {$operatorName}. Ref: {$lRefType}/{$lRefId}",
                    'actor' => $operatorName,
                    'actor_role' => 'operator',
                    'ref_id' => $l->ref_id,
                    'ref_type' => $l->ref_type,
                    'metadata' => ['idempotency_key' => $l->idempotency_key, 'wallet_id' => $l->wallet_id],
                    'timestamp' => $l->created_at,
                ]);
            }
        }

        // 3. Traffic Events (ANPR lane events)
        if (in_array($category, ['ALL', 'TRAFFIC'])) {
            $events = LaneEvent::orderBy('created_at', 'desc')->limit($limit)->get();
            foreach ($events as $e) {
                $entries->push([
                    'id' => $e->id,
                    'category' => 'TRAFFIC',
                    'severity' => 'INFO',
                    'icon' => 'camera',
                    'title' => strtoupper($e->direction) . " detected: {$e->plate_number}",
                    'description' => "Plate {$e->plate_number} scanned at lane {$e->lane_id} ({$e->direction}). EventUUID: {$e->event_uuid}",
                    'actor' => "Camera / {$e->lane_id}",
                    'actor_role' => 'system',
                    'ref_id' => $e->id,
                    'ref_type' => 'lane_event',
                    'metadata' => ['event_uuid' => $e->event_uuid, 'camera_event_id' => $e->camera_event_id],
                    'timestamp' => $e->created_at,
                ]);
            }
        }

        // Sort all merged entries chronologically descending and paginate
        $sorted = $entries->sortByDesc('timestamp')->values()->take($limit);

        return response()->json([
            'total' => $sorted->count(),
            'entries' => $sorted,
        ]);
    }
}
