# Project Constitution

## Data Schemas

### Monetary and Idempotency Standard
- **Money formatting**: `amount_minor` integers (Centavos). No floats. 100 PHP = `10000`.
- **Identity keys**: System relies on `UUIDv7` / `ULID` for chronologically sortable, collision-free idempotency.

### Inputs
**1. ANPR Camera Event (Edge to Core via mTLS)**
```json
{
  "event_uuid": "018f2a20-3b60-7a00-b000-00000000xx11",
  "camera_event_id": "EVT-12345",
  "plate_number": "ABC1234",
  "lane_id": "LANE-01",
  "direction": "exit",
  "timestamp": "2026-02-27T14:30:00+08:00",
  "image_url": "s3://anpr-images/2026/02/27/ABC1234.jpg",
  "nonce": "txn-99xx88",
  "signature": "hmac_sha256"
}
```

**2. Payment Webhook (Aggregator Fast Ingest)**
```json
{
  "event_uuid": "018f2a20-8888-7a00-b000-00000000xx22",
  "webhook_id": "WH-9999",
  "payment_ref": "PAY-8888",
  "wallet_id": "W-5555",
  "amount_minor": 100000,
  "status": "success",
  "method": "gcash",
  "timestamp": "2026-02-27T14:35:00+08:00"
}
```

### Outputs (Payload)
**1. Barrier Decision (Operational Payload to Edge)**
```json
{
  "core_event_id": "CORE-111",
  "lane_id": "LANE-01",
  "action": "open",
  "trip_id": "TRP-1111",
  "reason": "fee_deducted",
  "wallet_balance_after_minor": 45000,
  "exception_flag": false
}
```

## Behavioral Rules
- **Role**: System Pilot building deterministic, self-healing automation.
- **Priority**: Reliability over speed. Never guess business logic.
- **Data-First Rule**: Must define JSON Data Schema (Input/Output shapes) before coding.
- **Golden Rule**: If logic changes, update Layer 1 (SOP) before updating Layer 3 (Code).
- **Self-Annealing**: On tool failure -> Analyze, Patch, Test, Update Architecture.
- **Intermediates vs Deliverables**: Ephemeral data goes to `.tmp/`. Finished payload goes to Global (On-Premise Core).
- **Latency Constraint**: Process entry/exit from camera trigger to decision within ~2 seconds target. No heavy processing on critical path.
- **Financial Integrity**: Immutable ledger (`ledger_transactions`); corrections are offsets. Vault credentials, `amount_minor` integer enforcement, and strict database unique constraints.
- **Webhooks**: "Fast Ingest" rule: Verify, persist robustly, return 200 OK immediately, process ledger actions via Async queues to prevent 500-level gateway retries.
- **Edge Subsystem Constraint**: Edge uses mTLS, requires strict explicit whitelists offline, outputs metrics, and NEVER computes money.
- **Timezones**: Remittance/Ledger scoping explicitly aligns to `Asia/Manila` business days while storing UTC offsets.
