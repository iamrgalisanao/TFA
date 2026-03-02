<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Dispute;

class DisputeManagementController extends Controller
{
    public function index(Request $request)
    {
        $disputes = Dispute::with(['operator', 'ledgerTransaction'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($disputes);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:OPEN,INVESTIGATING,RESOLVED,CLOSED',
            'resolution_notes' => 'nullable|string'
        ]);

        $dispute = Dispute::findOrFail($id);

        $dispute->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? $dispute->resolution_notes
        ]);

        return response()->json([
            'message' => 'Dispute updated successfully',
            'dispute' => $dispute->load('operator')
        ]);
    }
}
