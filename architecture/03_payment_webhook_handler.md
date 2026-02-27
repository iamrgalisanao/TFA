# SOP 03: Payment Webhook Handler (Top-Ups)

## Objective
To receive wallet top-up notifications rapidly, acknowledge receipt reliably (Fast Ingest pattern), and process crediting asynchronously to prevent timeout retries and race conditions.

## Scope
- Respond 200 OK fast.
- Store raw webhook safely.
- Process ledger crediting in a separate queue worker.

## Integration Standards
- Top-Ups arrive from Aggregation gateways.
- Monetary amounts in minor units (cents).

## Logic Workflow: Fast Ingest Phase (Synchronous)
1. **Receive Webhook**: `POST /api/v1/webhooks/payment`
2. **Security & Anti-Replay Verification**:
   - Check `timestamp` header (must be within ±5 minutes).
   - Verify `nonce` against recent cache (prevent replay).
   - Generate HMAC using exact canonicalization rules requested by gateway and match signature.
   - If any fail -> Return 401/403 (Aborts entirely).
3. **Durable Ingest**:
   - `INSERT INTO webhook_events (payload_hash, gateway, event_uuid, payload_json, processing_status)`
   - Set `processing_status` to `PENDING`.
4. **Acknowledge**:
   - Return HTTP 200 OK immediately. (Never return 500 for business logic errors as gateways will aggressively retry partial processing).

## Logic Workflow: Processing Phase (Asynchronous Horizon Queue)
1. **Job Dispatch**: Fetch `PENDING` webhook from `webhook_events`.
2. **Idempotency & Sanity Checks**:
   - Check if `topups.payment_ref` UNIQUE constraint exists.
   - Ensure `status` == "success".
   - Validate wallet ownership (`operator_id` maps correctly) and currency = `PHP`.
3. **Financial Execution (Database Transaction)**:
   - Select `wallet` `FOR UPDATE`.
   - `wallet.balance_minor` += `amount_minor`.
   - `INSERT INTO topups (payment_ref, amount_minor, status)`
   - `INSERT INTO ledger_transactions (category, type, amount_minor, ref_type, ref_id, idempotency_key)` using `category='TOPUP'`, `type='CREDIT'`.
4. **Update Status**: Set `webhook_events.processing_status` to `COMPLETED`.
5. **Reconciliation**:
   - Daily job to compare aggregator settled payments vs `topups` table vs `ledger_transactions` to ensure zero drift.
