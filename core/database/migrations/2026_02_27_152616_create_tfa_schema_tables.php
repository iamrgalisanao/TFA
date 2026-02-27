<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Operators
        Schema::create('operators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('contact_number')->nullable();
            $table->timestamps();
        });

        // 2. Vehicles
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('operator_id');
            $table->string('plate_number')->unique();
            $table->string('vehicle_type')->default('standard');
            $table->timestamps();

            $table->foreign('operator_id')->references('id')->on('operators')->onDelete('cascade');
        });

        // 3. Wallets
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('operator_id');
            $table->bigInteger('balance_minor')->default(0); // Integer minor units
            $table->timestamps();

            $table->foreign('operator_id')->references('id')->on('operators')->onDelete('cascade');
        });

        // 4. Lane Events (Ingest Log)
        Schema::create('lane_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_uuid')->unique(); // IDEMPOTENCY KEY FROM EDGE
            $table->string('camera_event_id');
            $table->string('plate_number');
            $table->string('lane_id');
            $table->enum('direction', ['entry', 'exit']);
            $table->timestamp('event_timestamp');
            $table->string('image_url')->nullable();
            $table->string('signature');
            $table->json('raw_payload');
            $table->timestamps();
        });

        // 5. Trips (Lifecycle)
        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plate_number')->index();
            $table->enum('status', ['ENTRY_RECORDED', 'EXIT_PENDING_PAYMENT', 'EXIT_PAID', 'HELD_INSUFFICIENT_FUNDS', 'OVERRIDDEN']);
            $table->uuid('entry_event_id')->nullable();
            $table->uuid('exit_event_id')->nullable();
            $table->bigInteger('fee_minor')->nullable();
            $table->timestamp('entry_time')->nullable();
            $table->timestamp('exit_time')->nullable();
            $table->timestamps();

            $table->foreign('entry_event_id')->references('id')->on('lane_events');
            $table->foreign('exit_event_id')->references('id')->on('lane_events');
        });

        // 6. Immutable Ledger
        Schema::create('ledger_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('wallet_id');
            $table->enum('type', ['CREDIT', 'DEBIT']);
            $table->string('category'); // TRIP_FEE, TOPUP, REMITTANCE_TRANSFER, REFUND
            $table->bigInteger('amount_minor');
            $table->string('ref_type'); // trip, topup, remittance
            $table->uuid('ref_id');
            $table->string('idempotency_key')->unique(); // event_uuid or payment_ref
            $table->timestamps();

            $table->foreign('wallet_id')->references('id')->on('wallets');
        });

        // 7. Webhook Events (Fast Ingest)
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('event_uuid')->unique();
            $table->string('gateway');
            $table->string('processing_status')->default('PENDING'); // PENDING, COMPLETED, FAILED
            $table->json('payload');
            $table->timestamps();
        });

        // 8. Remittances
        Schema::create('remittances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('batch_id')->unique();
            $table->bigInteger('total_collections_minor');
            $table->bigInteger('dotr_share_minor');
            $table->string('status')->default('PENDING'); // PENDING, INITIATED, CONFIRMED, UNKNOWN_TIMEOUT
            $table->string('bank_reference')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('remittances');
        Schema::dropIfExists('webhook_events');
        Schema::dropIfExists('ledger_transactions');
        Schema::dropIfExists('trips');
        Schema::dropIfExists('lane_events');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('operators');
    }
};
