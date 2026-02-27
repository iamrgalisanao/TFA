<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Mock "profile" endpoint for testing RBAC without full login.
     * In real system, this would return Auth::user().
     */
    public function me(Request $request)
    {
        $role = $request->query('mock_role', 'admin');
        $user = User::where('role', $role)->with('operator')->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'user' => $user,
            'role' => $user->role,
            'permissions' => $this->getPermissionsForRole($user->role)
        ]);
    }

    private function getPermissionsForRole($role)
    {
        return match ($role) {
            'admin' => ['view_dashboard', 'manage_operators', 'manage_vehicles', 'view_remittances', 'view_audit_logs'],
            'staff' => ['view_dashboard', 'monitor_lanes', 'manual_overrides'],
            'operator' => ['view_dashboard', 'manage_own_vehicles', 'manage_wallet', 'view_own_transactions'],
            default => [],
        };
    }
}
