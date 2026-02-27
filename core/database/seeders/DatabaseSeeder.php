<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // 1. Admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@pitx.com.ph',
            'role' => 'admin',
        ]);

        // 2. Terminal Staff
        User::factory()->create([
            'name' => 'Lane Staff',
            'email' => 'staff@pitx.com.ph',
            'role' => 'staff',
        ]);

        // 3. Operator
        $operator = \App\Models\Operator::create([
            'name' => 'PITX Transport Services',
            'email' => 'ops@pitx.com.ph',
            'contact_number' => '09123456789'
        ]);

        User::factory()->create([
            'name' => 'Operator User',
            'email' => 'operator@pitx.com.ph',
            'role' => 'operator',
            'operator_id' => $operator->id,
        ]);

        $operator->wallet()->create([
            'balance_minor' => 200000 // 2,000.00 PHP
        ]);

        $operator->vehicles()->create([
            'plate_number' => 'ABC1234',
            'vehicle_type' => 'Bus'
        ]);
        // Create Lanes
        \App\Models\Lane::updateOrCreate(['id' => 'LANE-01'], [
            'name' => 'Main Entry A',
            'type' => 'ENTRY',
            'status' => 'ACTIVE',
            'barrier_status' => 'CLOSED',
            'ip_address' => '192.168.1.101',
            'last_active_at' => now()
        ]);

        \App\Models\Lane::updateOrCreate(['id' => 'LANE-02'], [
            'name' => 'Main Entry B',
            'type' => 'ENTRY',
            'status' => 'ACTIVE',
            'barrier_status' => 'CLOSED',
            'ip_address' => '192.168.1.102',
            'last_active_at' => now()
        ]);

        \App\Models\Lane::updateOrCreate(['id' => 'EXIT-01'], [
            'name' => 'Main Exit Lane',
            'type' => 'EXIT',
            'status' => 'ACTIVE',
            'barrier_status' => 'CLOSED',
            'ip_address' => '192.168.1.201',
            'last_active_at' => now()
        ]);
    }
}
