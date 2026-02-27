# SOP 05: UI/UX Layouts & Styling (React Portals)

## Objective
To define the layout, components, and data presentation for the three React-based frontends: Operator Portal, Terminal Staff Console, and Admin/Finance Dashboard.

## Design Philosophy (Stylize)
- **Tone**: Neutral, operational, and compliance-oriented. High contrast for visibility, clear typography (e.g., Inter or Roboto).
- **Format**: All monetary amounts displayed to the user must be converted from `minor units` (e.g., 50000) to standard `PHP` formats (e.g., ₱500.00).

---

## 1. Operator Portal
**Target User**: Bus/Taxi Company Operators, Individual Drivers.
**Goal**: Account management, wallet top-ups, transaction history, and SOAs.

### Layout Structure
- **Sidebar**: Dashboard, Vehicles, Wallet & Top-Up, Transactions, Statements (SOA).
- **Header**: User Profile, Current Wallet Balance (Prominent: "Balance: ₱500.00").

### Key Views
- **Dashboard Home**: 
  - Summary Cards: Active Vehicles, Total Fees Paid (This Month), Current Balance.
  - Quick Action: "Top-Up Wallet" Button.
- **Wallet & Top-Up Page**:
  - Payment Gateways: "Pay via GCash" or "Bank Transfer (InstaPay)".
  - Form: Input Amount -> Submit -> Redirects to Aggregator.
- **Transactions Table**:
  - Columns: `Date/Time`, `Type` (Top-Up / Trip Fee), `Vehicle Plate`, `Amount (PHP)`, `Status`.
  - Colored Status badges: Green (`Success`), Red (`Failed/Declined`).

---

## 2. Terminal Staff Console
**Target User**: PITX Lane Staff & Operations.
**Goal**: Live monitoring, exception handling, and manual overrides.

### Layout Structure
- **Global Header**: Terminal Status (Online/Offline), Active Alerts count.
- **Split View**: 
  - Left Panel: Live Lane Feed (Real-time logs of entry/exit events).
  - Right Panel: Exception Queue (Requires action).

### Key Views
- **Live Lane Feed**:
  - Auto-updating list (WebSockets).
  - Shows: `Lane ID`, `Plate`, `Action` (🟢 OPEN, 🔴 HOLD), `Reason` (e.g., Fee Deducted).
- **Exception Resolution Modal**:
  - Triggered when a vehicle is `HELD`.
  - Shows: Captured Plate Image + Reason (e.g., "Unrecognized Plate" or "Insufficient Funds").
  - Actions: 
    - "Manual Override (Allow Exit)" -> Prompts for `Reason Code` and `Operator ID/PIN` (RBAC Audit Rule).
    - "Mark as Unregistered & Apply Cash Fee" -> Prompts to record cash receipt.

---

## 3. Admin & Finance Dashboard
**Target User**: PITX Finance & System Administrators.
**Goal**: Reconciliations, Remittance Generation, Master Data.

### Layout Structure
- **Sidebar**: Overview, Reconciliation, Remittances, Master Data (Operators/Vehicles), User Management, Audit Logs.

### Key Views
- **Remittance Generation Page (DOTr)**:
  - Date Picker: Bounded by `Asia/Manila` business day.
  - Preview Table: `Total Collections`, `DOTr Share (PHP)`.
  - Actions: "Generate Snapshot & Report", "Initiate Bank Transfer".
- **Bank Transfer Tracking Table**:
  - Columns: `Remittance ID`, `Amount`, `Bank Ref`, `Status` (Pending/Confirmed/Timeout).
  - Feature: "Poll Status" button for explicitly checking 504 timeouts.
- **Audit Logs View**:
  - Immutable log of all manual overrides, config changes, and failed webhook signatures.
