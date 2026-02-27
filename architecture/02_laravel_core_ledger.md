# SOP 02: Laravel Core & Append-Only Ledger

## Objective
To serve as the System of Record with strict financial integrity. It calculates fees, enforces an immutable ledger (in minor unit integers), and controls lane actions via a well-defined trip state machine.

## Scope
- Authoritative idempotent ingest of Lane Events.
- Managing Trip lifecycle states.
- Auditable fee computations.
- Append-only ledger updates with `wallet.balance` acting as a cached projection.

## Inputs & Outputs
**Input from Edge:**
Payload with `event_uuid` over mTLS.

**Output to Edge:**
Barrier Decision JSON with `core_event_id` (action: OPEN/HOLD).

## Logic Workflow & State Machine
1. **Idempotent Ingest**: Core receives `POST /api/v1/lane/event`.
   - Core attempts to `INSERT INTO lane_events` with `event_uuid` as a UNIQUE constraint.
   - If collision -> fetch the existing decision from `trips`/`lane_events` and return it immediately.
2. **Master Data Resolution**: Query `vehicles` table via `plate_number`.
3. **State Machine (Trips)**:
   - Identify active trip or start a new one.
   - States: `ENTRY_RECORDED` -> `EXIT_PENDING_PAYMENT` -> `EXIT_PAID` | `HELD_INSUFFICIENT_FUNDS` | `OVERRIDDEN`.
4. **Fee Computation (Exit Only)**:
   - Calculate fee. Store the exact parameters used (`tariff_id`, `vehicle_type`, entry/exit timestamps) in the `trips` record for absolute audit reproducibility.
5. **Financial Execution (Database Transaction)**:
   - *Locking*: Select `wallet` row `FOR UPDATE`.
   - *Balance Check*: Verify cached projection `wallet.balance_minor` >= `fee_minor` (all monetary fields stored as integers/centavos).
   - If successful:
     - Deduct `fee_minor` from `wallet.balance_minor`.
     - `INSERT INTO ledger_transactions (category, type, amount_minor, ref_type, ref_id, idempotency_key)` where `category='TRIP_FEE'`, `type='DEBIT'`, `idempotency_key` = `event_uuid`.
     - Update Trip status to `EXIT_PAID`.
     - Return `OPEN`.
   - If failed:
     - Update Trip status to `HELD_INSUFFICIENT_FUNDS`.
     - Return `HOLD`.

## Append-Only & Financial Rules
- **Money Format**: ABSOLUTELY NO FLOATS. Money must be handled in minor units (integer centavos, e.g., 100.00 PHP = 10000).
- **Cached Balances**: `wallet.balance_minor` is strictly a projection. A daily reconciliation job must verify `SUM(ledger_transactions) == wallet.balance_minor`.
- **Corrections**: MUST be handled via `INSERT INTO ledger_transactions` with `type='CREDIT'`, never by updating past rows.
