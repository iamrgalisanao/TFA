# Task Plan

## Phases
- [x] Phase 1: Blueprint (Vision & Logic)
- [x] Phase 2: Link (Connectivity)
- [x] Phase 3: Architect (The 3-Layer Build)
- [x] Phase 4: Stylize (Refinement & UI)
- [ ] Phase 5: Trigger (Deployment)

## Goals
- Fully replace manual terminal fee collection with ANPR tracking and automated wallet deductions.
- Enable <2s operational decisions at active lanes (barrier open/hold) via an Edge subsystem querying the Core API.
- Supply immutable, compliance-ready DOTr Remittance reporting and automated transfers.
- Enable end-user and operator web portals/dashboards (React).

## Progress Highlights
- **Backend**: Scaffolded Laravel `core` in `e:\2026\TFA\core`.
  - Implemented Full Schema (Migrated to SQLite for local dev).
  - Created Models with `HasUuids` and strict relationships.
  - Implemented `LaneController`, `VehicleController`, and `WalletController`.
  - Seeded test data (Operator, Wallet, Vehicle: ABC1234).
- **Frontend**: Scaffolded React `frontend` in `e:\2026\TFA\frontend`.
  - Implemented Premium Design System (`index.css`).
  - Created `MainLayout`, `Dashboard`, `Vehicles`, and `Wallet` pages.
  - Integrated dynamic balance fetching and ledger history.
  - Fully integrated vehicle registration and wallet top-ups.

## Checklists
### Initialization
- [x] Initialize Project Memory (`task_plan.md`, `findings.md`, `progress.md`, `gemini.md`)
- [x] Answer Discovery Questions & Expand Architecture Detail
- [x] Define Data Schema in `gemini.md` (Including Idempotency Keys)
- [x] Approve Blueprint

### Execution (Phase 2 & 3: Link & Architect)
- [x] Establish environment (`.env`) for mock credentials (API Keys treated as risk dependency) and MySQL config.
- [x] Build basic handshake connection tests for Payment Aggregator and Edge ANPR trigger endpoints in `tools/` (Python simulators).
- [x] Draft Architecture SOPs in `architecture/`:
    - `01_edge_lane_logic.md` (Buffer/Relay logic)
    - `02_laravel_core_ledger.md` (Append-only ledger, Idempotency)
    - `03_payment_webhook_handler.md`
    - `04_remittance_processor.md`
- [x] Develop Layer 3 modular tools (`tools/`) to mimic deterministic operations, validating edge-to-core latency and idempotency processing.

### Execution (Phase 4: Stylize)
- [x] Draft UI/UX wireframe layouts for React Portals in `architecture/05_ui_ux_layouts.md`.
- [x] Translate Minor Unit ledgers to standard PHP Currency formatting displays.

### Execution (Phase 5: Trigger)
- [x] Implement **Core Decision Engine** (`LaneController@ingest`) for automated entry/exit processing.
- [x] Develop **USB Camera Edge Simulator** (`tools/usb_camera_simulator.py`) for handwritten plate simulation.
- [ ] Define Deployment procedures (Cloud vs Edge deployment, DB migrations) in `architecture/06_trigger_deployment.md`.
- [ ] Finalize the Maintenance Log / Handover document.

## Todo / Parked Features
- [ ] **Transaction Explorer**: Comprehensive auditing UI for all roles (Parked).
- [ ] **DOTr Remittance**: Automated batching and bank API integration (Requires formal bank specs).
- [ ] **Hardware ANPR**: Production-grade camera integration (Pending hardware availability).
- [ ] **mTLS Security**: Hardening of Edge-to-Core communication layer.
