# SOP 06: Trigger & Deployment (On-Premise & Edge)

## Objective
To map the operational deployment procedures extending from code repository to the physical terminal lanes and on-premise servers, completing Phase 5 of the B.L.A.S.T pipeline.

## 1. Environment Topology
- **Core (Laravel + React + MySQL)**
  - Hosted On-Premise within the PITX datacenter.
  - MySQL with daily automated snapshots, point-in-time recovery, and local high-availability (HA) clustering.
  - Redis cache for Laravel Horizon (Webhook Fast Ingest queues).
- **Edge (Lane Subsytems)**
  - Hardened industrial edge PCs physically located at PITX control rooms or directly within IP65 enclosures at lane kiosks.
  - Communicating directly with Hikvision cameras (SDK/ONVIF) and Relay Controllers (Barrier open/hold) over local LAN.
  - Runs Edge Script (Node/Go/Python) with local SQLite queue and provisioned mTLS certs communicating with the On-Premise Core.

## 2. CI/CD Operations
- **Core API & Dashboards**:
  - Pushes to `main` undergo automated tests mimicking the Python `tools/` simulators.
  - Immutable container builds (Docker) deployed to local on-premise server instances.
- **Edge Deployment**:
  - Edge node updates pushed via Fleet Management (e.g., Balena or AWS IoT Greengrass).
  - **Crucial Rule**: Edge software updates can ONLY occur between 01:00 AM - 04:00 AM PHT to avoid peak vehicle flow interruptions.

## 3. Safe Migration Strategies (Financial)
- The `ledger_transactions` and `wallet` tables are classified as **Tier 0 Critical**. 
- Database migrations affecting monetary fields must NEVER execute a destructive command (`DROP COLUMN` or renaming actively queried fields). They are append-only schema changes.

## 4. Maintenance / Handover Protocol
- **Secrets Management**: Rotate Aggregator `.env` API keys every 90 days. Update Edge mTLS certificates 30 days before expiry.
- **Backup Testing**: Finance administrators must invoke a mock DB restore to test the DOTr remittance batch reproducibility at least bi-annually.
- **Reconciliation**: A daily cron job runs at 03:00 AM PHT comparing Aggregator dashboard settled funds directly against the `SUM()` of the `topups` table and `ledger_transactions`. Any drift instantly pages the Finance Engineering team.
