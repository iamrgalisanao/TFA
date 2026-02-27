# SOP 04: DOTr Remittance Processor

## Objective
To securely generate highly reproducible remittance reports bounded by explicit business day timezones, securely orchestrate Bank API transfers, and treat the remittance itself as a core ledger event with safe timeout handling.

## Scope
- Filter specific ledger categories for an `Asia/Manila` business day.
- Snapshot the batch for absolute reproducibility.
- Negotiate transfer with Bank API over mTLS.
- Record remittance actions on the ledger.

## Logic Workflow
1. **Timezone & Aggregation Scope**:
   - Define business day strictly in `Asia/Manila`. (Store both Local and UTC).
   - Query `ledger_transactions` where `category = 'TRIP_FEE'` AND `type = 'DEBIT'` matching the period.
2. **Batch Snapshotting (Crucial)**:
   - Create a new `remittances` record (status: `PENDING`).
   - Insert relationships into `remittance_ledger_items` mapping the `remittance_id` to EVERY `ledger_tx_id` included, freezing the batch.
   - Generate the compliance DOTr report (PDF/CSV) from this exact snapshot.
3. **Calculation**: Compute `dotr_share_minor`.
4. **Bank Transfer Execution**:
   - Update `remittances` to `INITIATED`.
   - Construct payload with `idempotency_key = UUIDv7`.
   - POST to Bank API endpoint via **mTLS** and **HMAC** signed request.
5. **Response & Timeout Handling**:
   - **Success**: Update status to `CONFIRMED`, log `bank_reference`, insert a `CREDIT` into `ledger_transactions` (category: `REMITTANCE_TRANSFER`, amount: `dotr_share_minor`) representing cash leaving our accounts.
   - **Timeout (504/Unknown)**: Update status to `UNKNOWN_TIMEOUT`. Do NOT auto-retry POST. Trigger a separate job that polls the Bank API `GET /transfers/status?idemp_key=...`.
6. **Reconciliation & Adjustments**:
   - If operator refunds are issued *after* the snapshot, they are logged as `TRIP_REFUND` credits on the current operational day and dynamically lower *tomorrow's* `total_collections`. Past batches are never altered.
