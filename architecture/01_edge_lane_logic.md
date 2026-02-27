# SOP 01: Edge Lane Logic (Barrier & ANPR Buffer)

## Objective
To process ANPR events, negotiate barrier decisions with the Laravel Core via a robust delivery protocol, and maintain secure offline resilience without computing financial logic at the edge.

## Scope
- Receives camera triggers (Entry/Exit).
- Packages payload securely with `event_uuid` (UUIDv7) + HMAC.
- Transmits to Laravel Core via mTLS.
- Manages an offline queue with strict policies.
- Emits observability metrics.

## Inputs & Outputs
**Input from ANPR Camera:**
- Event Trigger (Entry/Exit), Plate Number, Timestamp, Image Reference.

**Payload to Laravel Core:**
```json
{
  "event_uuid": "018f2a20-3b60-7a00-b000-000000000000",
  "camera_event_id": "CAM-EVT-123",
  "plate_number": "ABC1234",
  "lane_id": "LANE-01",
  "direction": "exit",
  "timestamp": "2026-02-27T14:30:00+08:00",
  "image_url": "s3://anpr-images/2026/02/27/ABC1234.jpg",
  "nonce": "txn-99x88y77z",
  "signature": "hmac_sha256_hash_here"
}
```

**Response from Laravel Core:**
```json
{
  "core_event_id": "CORE-987654321",
  "action": "open",
  "decision_id": "DEC-1111",
  "reason": "fee_deducted",
  "wallet_balance_after_minor": 45000,
  "exception_flag": false
}
```

## Logic Workflow & Delivery Protocol
1. **ANPR Trigger**: Camera detects plate, passes to Edge Service.
2. **Event Identity**: Edge generates `event_uuid` (UUIDv7/ULID) combining time and specific identity.
3. **Security Signing**: Edge generates an HMAC signature using its provisioned lane secret, adding a `nonce` and precise `timestamp` to prevent replay attacks.
4. **Transmission**: Send JSON to Core `POST /api/v1/lane/event` over mTLS.
5. **Exact-Once Contract**: 
   - Edge persists the `event_uuid` in local SQLite queue.
   - Core returns the decision + `core_event_id`.
   - Edge persists the `core_event_id` and *only then* removes the event from its pending queue.
   - If network drops before ACK, Edge retries the exact payload later (Core will deduplicate based on `event_uuid`).
6. **Execution**:
   - `action == "open"` -> Trigger relay to lift.
   - `action == "hold"` -> Keep barrier down, trigger UI alert on Staff Dashboard.

## Offline Mode Policy (Critical)
- **Entry**: Allow ONLY if plate exists in a locally cached strict whitelist. Otherwise, hold for staff override. Mandatory reconciliation report generated when WAN restores.
- **Exit**: Always hold. Requires manual override workflow from Staff UI (capturing `reason_code`, `operator_id`, and generating an audit log).

## Observability & Sec
- **Metrics**: Edge must continuously emit `success_rate`, `latency`, `queue_depth`, `offline_duration`, and `barrier_action_count`.
- **Certificates**: Ensure device provisioning allows automatic cert rotation for mTLS.
