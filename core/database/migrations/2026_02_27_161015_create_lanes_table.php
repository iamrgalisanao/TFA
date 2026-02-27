<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lanes', function (Blueprint $table) {
            $table->string('id')->primary(); // LANE-01, etc.
            $table->string('name');
            $table->enum('type', ['ENTRY', 'EXIT']);
            $table->enum('status', ['ACTIVE', 'MAINTENANCE', 'DISABLED'])->default('ACTIVE');
            $table->enum('barrier_status', ['OPEN', 'CLOSED'])->default('CLOSED');
            $table->string('ip_address')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });

        Schema::create('lane_overrides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('lane_id');
            $table->uuid('user_id');
            $table->enum('action', ['FORCE_OPEN', 'FORCE_CLOSE', 'LOCK', 'RELEASE']);
            $table->string('reason');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('lane_id')->references('id')->on('lanes');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lane_overrides');
        Schema::dropIfExists('lanes');
    }
};
