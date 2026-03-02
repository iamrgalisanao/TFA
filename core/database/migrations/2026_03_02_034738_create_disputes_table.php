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
        Schema::create('disputes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('operator_id');
            $table->uuid('wallet_id');
            $table->uuid('ledger_transaction_id')->nullable();
            $table->string('reference_code')->unique();
            $table->enum('type', ['INCORRECT_DEDUCTION', 'MISSING_TOPUP', 'OTHER']);
            $table->enum('status', ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'])->default('OPEN');
            $table->text('description');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->foreign('operator_id')->references('id')->on('operators')->onDelete('cascade');
            $table->foreign('wallet_id')->references('id')->on('wallets')->onDelete('cascade');
            $table->foreign('ledger_transaction_id')->references('id')->on('ledger_transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
