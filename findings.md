# Findings

## Research
- **Source Material**: `docs/TFA-requirement.md` details functional and non-functional requirements. `docs/architecture-feedback.md` provides critical enterprise upgrades.
- **Core Integrations**: ANPR cameras via SDK/ONVIF, lane barriers, payment aggregators (Dragonpay/PayMongo/Nuvei), DOTr Bank API (InstaPay/PESONet).
- **Technology Stack**: React (Web Apps) + Laravel (API + Domain Services) + MySQL (Transactional Data Store) + Edge Subsystem (Node/Python/Go).

## Discoveries & Architectural Refinements
- **Idempotency Identity**: Moving from compounded strings to `UUIDv7` (or `ULID`) is required to avoid collisions and easily maintain sortability. Edge and Webhooks must use this for unique constraint tracking on the Core.
- **Monetary Types**: Absolutely no floats. All systems (Ledger, Webhooks, Core API) must use `minor units` (integer centavos/cents) for math predictability.
- **Delivery Protocol (Exact-Once)**: Edge stores `event_uuid`, Core returns `core_event_id`. Edge must not clear local queue until Core's ACK saves successfully.
- **Queue/Async Webhooks**: Fast Ingest Pattern - we must respond `200 OK` to payment gateways *immediately* upon validating signature + persisting to DB. Avoid `500` business logic errors sending retry-loops.
- **Timezones & Snapshots**: DOTr reporting needs to cleanly bound "business days" (`Asia/Manila`), mapping batches tightly with selected ledger items (snapshot state) to prevent changing data histories mutating past reports.

## Constraints
- **Latency (NFR-101)**: Camera trigger to barrier decision must execute in under 2 seconds. The critical path must have no heavy processing, pre-loaded configs at edge, fast API endpoints, and good DB indexes.
- **Compliance & Security**: Requires mTLS for service-to-service, HMAC request signing, PCI DSS Level 1 payment handling, DPA (RA 10173), and BSP compliance.
- **Exceptions**: Unrecognized plates -> flag manual review. Unregistered plates -> mark 'Unregistered' and apply default rate. Insufficient funds -> keep barrier closed, alert staff.
- **Concurrency**: Locking strategy required (DB transaction + unique constraints) to avoid race conditions. Wallet balances are a *cached projection*, with the true state residing in the append-only ledger entries.
