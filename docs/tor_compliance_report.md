# Compliance Assessment: PITX Terminal Fee Collection System TOR

Based on my review of the `PITX. COO. IT. TOR - TERMINAL FEE COLLECTION SYSTEM. 2026 02 24.pdf` alongside your `GEMINI.md` architecture standard and the current codebase (Core Laravel Models, Database Migrations, and React Frontend), here is the compliance assessment:

## Overall Status: Highly Compliant (w/ Minor Gaps)
The system's core architecture (Immutable Ledger, Fast Ingest Webhooks, Edge mTLS constraints) is perfectly aligned with the TOR expectations for automated, cashless collections. There are only two minor missing features (Notifications & Helpdesk).

---

### 1. Automatic Plate Number Recognition (APNR)
**Requirement:** Cameras at entry points scan vehicle plates, cross-check against a database, and link vehicles to their operator's wallet for automated fee deduction.
**Status: ✅ Compliant**
* **Evidence:** The system explicitly defines the `LaneEvent` payload schema (`camera_event_id`, `plate_number`, `lane_id`, via mTLS) in `GEMINI.md`. Models like `LaneEvent.php`, `Vehicle.php`, and `Trip.php` fully address this.

### 2. Dedicated Wallet per Operator
**Requirement:** Prepaid digital wallets handling automatic deductions upon entry.
**Status: ✅ Compliant**
* **Evidence:** The `Wallet` model (`Wallet.php`) and integer-based `balance_minor` currency tracking seamlessly handle these ledger transactions via the `LedgerTransaction` model.

### 3. Wallet Reloading Options
**Requirement:** Provide reloading options via PITX Website & Payment Gateway (banks, e-wallets, cards) and Onsite kiosks.
**Status: ✅ Compliant**
* **Evidence:** Handled by the **Payment Webhook (Aggregator Fast Ingest)** logic as strictly defined in your project constitution. Supported backend tables (`webhook_events`) ensure robust real-time tracking for external gateways.

### 4. Operator Portal & Dashboard
**Requirement:** Centralized platform for operators to view balances, transactions, and statements.
**Status: ✅ Compliant**
* **Evidence:** Found `OperatorPortal.jsx` and `Dashboard.jsx` in the frontend source code handling these exact visibility requirements.

### 5. Collection Reporting & Compliance
**Requirement:** Real-time dashboards showing entries, fee deductions, and automated reports for DOTr auditing.
**Status: ✅ Compliant**
* **Evidence:** The presence of `StaffPortal.jsx` (Admin side) coupled with `Remittance.php` (tracking total collections and `dotr_share_minor`) precisely solves the revenue assurance side of this TOR requirement.

### 6. Negative Balances & Notifications
**Requirement:** Allow negative balances, with automated notifications sent to the Operators (reload reminder) and PITX (warning).
**Status: ⚠️ Partial Compliance**
* **Negative Balances (Compliant):** The `wallets` table uses a generic `bigInteger` (`balance_minor`) without an `unsigned` constraint, naturally supporting negative balances.
* **Notifications (Missing):** I did not find backend infrastructure (e.g., specific event listeners, Mailables, or SMS webhook integrations in `core/app/Notifications`) handling automated warnings to Operators and PITX when balances dip below zero.

### 7. Customer Support Module
**Requirement:** Customer support feature for concerns like incorrect balances, missing load, or mistaken fee deductions.
**Status: ❌ Non-Compliant / Missing**
* **Evidence:** There are currently no database tables or models (like `Ticket`, `Dispute`, or `SupportRequest`) handling operator dispute submissions or support ticket lifecycles.

---

### Recommendations for Next Steps

To achieve 100% compliance with this TOR, we should build:
1. **Notification System Layer:** Implement Laravel Notifications targeting the `Operator` emails/SMS when `balance_minor < 0` occurs in a `LedgerTransaction`.
2. **Dispute/Ticketing Feature:** Create a `Dispute` model linking to `LedgerTransaction` or `Wallet`, and expose endpoints to the `OperatorPortal` to allow creating support tickets.
