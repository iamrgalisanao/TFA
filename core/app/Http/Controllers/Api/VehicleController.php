<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Operator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    public function index()
    {
        // For now, return all vehicles with operator info
        return response()->json(Vehicle::with('operator')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plate_number' => 'required|string|unique:vehicles,plate_number',
            'vehicle_type' => 'required|string',
            'operator_name' => 'nullable|string' // If not provided, we use the first operator for mock
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Mock: Find or create a default operator if none exists
        $operator = Operator::first() ?: Operator::create([
            'name' => 'Default Operator',
            'email' => 'default@pitx.com.ph'
        ]);

        $vehicle = Vehicle::create([
            'operator_id' => $operator->id,
            'plate_number' => strtoupper($request->plate_number),
            'vehicle_type' => $request->vehicle_type,
        ]);

        return response()->json([
            'message' => 'Vehicle registered successfully',
            'vehicle' => $vehicle->load('operator')
        ], 201);
    }
}
