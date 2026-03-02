# PITX Terminal Fee Automation System
# Comprehensive User Manual

Welcome to the **Terminal Fee Automation (TFA)** system. This software is designed to streamline toll collection, monitor traffic flows, and maintain an immutable ledger of all vehicles entering and exiting the PITX terminal.

This guide provides step-by-step instructions on navigating and utilizing the system based on your assigned role: **Administrator**, **Staff/Cashier**, **Transport Operator/Driver**, or **Public User**. It includes comprehensive coverage of web portals, mobile access, self-service kiosks, and troubleshooting procedures.

---

## Table of Contents

1. [Global Navigation Elements](#global-navigation-elements)
2. [Administrator Portal](#administrator-portal)
3. [Staff Console](#staff-console)
4. [Operator Portal](#operator-portal)
5. [Public Portal](#public-portal)
6. [Self-Service Top-Up Kiosks](#self-service-top-up-kiosks)
7. [Mobile Usage Guidance](#mobile-usage-guidance)
8. [Troubleshooting and FAQ](#troubleshooting-and-faq)
9. [Security and Privacy](#security-and-privacy)
10. [Glossary](#glossary)
11. [Quick Reference](#quick-reference)
12. [Support and Contact Information](#support-and-contact-information)

---

## 🧭 Global Navigation Elements

Regardless of your role, the following layout elements are available on every page:

- **Sidebar Menu:** On the left, use the sidebar to quickly jump between different modules (e.g., Dashboard, Vehicles, Transactions). The links you see are tailored to your specific permissions.
- **Top Bar Profile:** Your name, role, and a quick dropdown to switch roles (in Debug/Dev mode) or log out are located here.
- **Interactive Help Tour:** Click the **"?"** (Help Circle) icon in the top right header to launch an interactive, guided tour of whatever page you are currently viewing. The tour will highlight key buttons and charts.
- **Operator Wallet Balance:** If you are an Operator, your real-time wallet balance is always securely pinned to the top navigation bar.
- **Search Bar:** Located at the top, allows quick search across relevant data (e.g., vehicle plates, transaction IDs).
- **Notifications Bell:** Alerts for low balances, system alerts, or pending actions.

[Visual Aid: Global Navigation Screenshot - Shows sidebar menu expanded, top bar with profile and help icon, search bar, and notifications.]

---

## 🛡️ 1. Administrator Portal

The Admin Portal is the central command center for the PITX management team. Administrators have absolute visibility into revenue, operator metrics, system audits, and compliance.

### The Live Dashboard (`/`)
1. **Overview:** The very first thing you see is your live revenue generation (MTD), the number of registered partner operators, and pending remittances queued for payout.
2. **System Health:** Keep a bird's-eye view on the active/offline status of all entry and exit lanes in real-time.
3. **Key Metrics:** Total collections, vehicle throughput, and operator wallet balances overview.

[Visual Aid: Admin Dashboard Screenshot - Displays revenue charts, system health indicators, and key metrics cards.]

### Vehicle & Operator Management (`/vehicles`, `/operators`)
1. **Master Vehicle List:** Browse the complete table of all vehicles authorized to enter the terminal. You can search by plate number or filter by vehicle type (Bus, Minibus).
2. **Onboarding Operators:** Register a new Transport Operator. A dedicated digital wallet shadow account is automatically provisioned for them.
3. **Wallet Monitoring & Manual Top-ups:** Track Total Assets Under Management (AUM) across all operator wallets. Spot low balances and process manual wallet top-ups if an operator hands you physical cash or a bank transfer.
4. **Bulk Operations:** Import/export vehicle and operator data via CSV for batch updates.

[Visual Aid: Vehicle Management Screenshot - Table view with filters, search, and action buttons for edit/add.]

### Financials & Transactions (`/transactions`, `/remittances`)
1. **Immutable Ledger:** View the live transaction feed of every vehicle trip, displaying the exact entry/exit timestamps and fee deductions.
2. **Held Vehicles Analysis:** Use the filters to explicitly isolate trips that are "Held" at a gate due to Insufficient Funds.
3. **Remittance Processing:** Generate and initiate automated remittances to DOTr via integrated banking APIs.
4. **Exporting Data:** Export clean PDF/Excel spreadsheets of the ledger, ready for DOTr or Finance reconciliation.

[Visual Aid: Transactions Ledger Screenshot - Paginated table with expandable rows showing trip details.]

### Auditing & Dispute Management (`/audit`, `/dispute-management`)
1. **Audit Logs:** Access a chronological timeline capturing hardware alerts, software events, and manual barrier overrides. Every entry permanently records the exact Actor (Admin/Staff) and the Idempotency key for forensic analysis.
2. **Dispute Management Central:** Review, investigate, and resolve support tickets filed by operators regarding "Missing Top-ups", "Incorrect Fee Deductions", or other account issues.
   - From this page, click on any submitted Dispute to review the Operator's claim and referenced Transaction ID.
   - Using your internal physical records, investigate the claim.
   - Provide "Resolution Notes" to explain your findings directly to the Operator and update the ticket status to 'Investigating' or 'Resolved'.
3. **System Configuration:** Manage user roles, permissions, fee schedules, and system settings.

[Visual Aid: Audit Logs Screenshot - Timeline view with filters for event types and date ranges.]

---

## 🚦 2. Staff Console

The Staff Console is designed exclusively for on-the-ground terminal personnel and cashiers who monitor physical lanes and handle real-time traffic flow.

### Live Terminal Feed
1. **Real-time Monitoring:** The primary dashboard streams every incoming and outgoing vehicle recognized by the ANPR cameras in real-time.
2. **Verification:** Instantly verify plate numbers, lane assignments, and whether the barrier successfully opened. Vehicles with an "Exit" direction will be highlighted in blue, while "Entry" will be in orange.
3. **Lane Status Overview:** Visual indicators for each lane's operational status.

[Visual Aid: Staff Dashboard Screenshot - Live feed grid with vehicle cards showing plate, direction, and status.]

### Lane & Barrier Control
1. **Exception Queue:** Stay on top of live alerts and quickly identify if any hardware components (cameras, physical sensors) go offline.
2. **Manual Barrier Override:** In case of an extreme emergency, physical sensor malfunction, or missing license plates, use the Lane Control panel to forcefully command the barrier to **OPEN** or **CLOSE**.
3. **Submitting Justifications:** Clicking the "OVERRIDE" button will prompt a modal. You must strictly input a reason (e.g., "Sensor Malfunction") before confirming the override. This action is permanently logged to the system Audit Trail under your username.
4. **Manual Payment Collection:** For unregistered vehicles or exceptions, process on-site payments.

[Visual Aid: Lane Control Panel Screenshot - Buttons for each lane with override options and justification form.]

### Edge Camera Simulation & Bridge
To test the real-time scanning feed as a Staff member, you can run the Edge Simulator locally:
1. **Launch from Dashboard:** On the Staff Dashboard feed, click **"Launch Edge Simulator"**.
2. **Prerequisites (Bridge Tool):**
   - **For Windows PC:** Open a new terminal instance, navigate to the `tools/` folder, and run: `python windows_bridge.py`.
   - **For Mac:** Open a new terminal instance, navigate to the `tools/` folder, and run: `python3 mac_bridge.py`.
3. **Important Note on Browser Security:** The bridge tool runs on `https://tfa.abbadev.com/bridge`. If you are viewing the live remote production site (`https://tfa.abbadev.com`), your browser will handle secure connections properly. For local testing:
   - Test by opening the app on your local development server (`http://localhost:5173`).
   - *OR* use the production bridge endpoint for testing purposes.
4. **Using the Simulator:** Once the terminal window pops up:
   - Point your webcam at a printed license plate (e.g., "ABC1234").
   - Press **SPACE** to freeze and scan the plate using OCR.
   - If correctly detected, press **C** to Confirm and send the plate to the remote API. You should immediately see the trip populate on your Staff Dashboard at `https://tfa.abbadev.com`!

[Visual Aid: Edge Simulator Interface Screenshot - Webcam view with controls for capture and confirm.]

---

## 🚛 3. Operator Portal

The Operator Portal is a self-service dashboard for Transport Operators to manage their fleet, track expenses, and top up their digital wallets.

### The Operator Dashboard (`/`)
1. **Fleet & Expense Overview:** Track exactly how many vehicles you have registered in the system, and view the total amount of terminal/parking fees deducted this month.
2. **Live Fleet Feed:** Watch a live feed limited exclusively to your own drivers. Watch them ping entry and exit gates and verify the exact fee deducted at that exact second.
3. **Wallet Balance Alert:** Prominent display of current balance with low-balance warnings.

[Visual Aid: Operator Dashboard Screenshot - Fleet summary cards, balance display, and live feed.]

### Wallet & Top-Ups (`/wallet`)
1. **Balance Monitoring:** Always keep an eye on your real-time wallet balance indicator.
2. **Real-time GCash/Bank Top-ups:** Need a higher balance so your drivers never get stuck at a gate? Start a real-time top-up here. The system uses Fast Ingest webhooks to update your balance immediately.
3. **Auto Top-Up Settings:** Configure automatic top-ups when balance falls below a threshold.
4. **Negative Balance Warnings:** *(Note: If a vehicle exits and drives your wallet below zero, you will instantly receive an automated email warning prompting you to reload your account immediately to avoid future holds.)*
5. **Top-Up History:** View all past top-ups with methods and statuses.

[Visual Aid: Wallet Page Screenshot - Balance card, top-up form with payment options, and history table.]

### Transactions & Helpdesk (`/transactions`, `/support`)
1. **Trip History:** This is your immutable ledger. Click any row to expand a granular timeline of exactly when the vehicle entered and exited, down to the second.
2. **Statement of Account (SOA):** Generate and download monthly SOAs for accounting purposes.
3. **Support & Filing Disputes:** Navigate to the **Support** page when you encounter incorrect deductions or delayed manual top-ups.
   - Click the **"File Dispute"** button.
   - Select the type of issue (Missing Top-up, Incorrect Deduction, Account Issue).
   - Enter your detailed dispute explanation.
   - (Optional) If it relates to a specific deduction, paste the **Reference/Ledger ID**.
4. **Ticket Tracking:** The Support dashboard provides a clear table where you can continuously monitor the status of your submitted tickets. Look out for updates from the Admin staff directly in the "Resolution Notes" column once the issue is closed.

[Visual Aid: Transactions Page Screenshot - Filterable table with expandable trip details.]

---

## 🌐 4. Public Portal

The Public Portal is a mobile-responsive website for drivers and operators to register accounts, manage vehicles, and perform wallet top-ups without needing terminal access.

### Account Registration and Management
1. **User Registration:** Create an account by providing basic information (name, contact details, operator affiliation if applicable).
2. **Vehicle Registration:** Register your vehicle(s) with plate number, type, and required documents.
3. **Profile Management:** Update contact information, change passwords, and manage notification preferences.

[Visual Aid: Public Portal Registration Form Screenshot - Step-by-step form with validation.]

### Wallet Top-Ups
1. **Top-Up Options:** Choose from GCash, bank transfer (InstaPay/PESONet), or QRPh.
2. **GCash Integration:** Scan QR code or enter mobile number for instant top-up.
3. **Bank Transfer:** Generate payment instructions or virtual account details for bank transfers.
4. **Top-Up History:** Track all your top-up transactions.

[Visual Aid: Top-Up Page Screenshot - Payment method selection and confirmation screen.]

### Balance and Transaction Monitoring
1. **Real-Time Balance:** View current wallet balance.
2. **Transaction History:** See all fee deductions and top-ups.
3. **Trip Records:** Access records of your vehicle's terminal entries and exits.

[Visual Aid: Public Portal Dashboard Screenshot - Balance card and recent transactions list.]

---

## 🏪 5. Self-Service Top-Up Kiosks

Physical kiosks located within the PITX terminal provide convenient, 24/7 wallet top-up services.

### Kiosk Interface
1. **Touch-Screen Operation:** Large, intuitive touch interface optimized for quick interactions.
2. **Language Selection:** Choose between English and Filipino.
3. **Account Lookup:** Enter your registered mobile number or operator ID to access your account.

[Visual Aid: Kiosk Welcome Screen Mockup - Language buttons and account entry field.]

### Top-Up Methods
1. **GCash Top-Up:** Generate a dynamic QR code on the kiosk screen. Scan with your GCash app and confirm payment.
2. **QRPh Integration:** Similar to GCash, generate QR for QRPh-compatible wallets.
3. **Cash Payment:** Insert exact cash amount into the bill acceptor. The system accepts Philippine peso bills only and provides NO CHANGE. Your wallet is credited immediately upon successful insertion.
   - Supported denominations: ₱20, ₱50, ₱100, ₱200, ₱500, ₱1000.
   - Maximum per transaction: ₱5000.
   - Note: Only exact amounts accepted; overpayments will be rejected.

[Visual Aid: Cash Payment Screen Mockup - Bill acceptor status and amount display.]

### Transaction Confirmation
1. **Receipt Generation:** After successful top-up, receive a printed receipt with transaction details.
2. **SMS Notification:** Receive confirmation via SMS to your registered number.
3. **Balance Update:** Wallet balance updates in real-time across all platforms.

[Visual Aid: Kiosk Receipt Mockup - Transaction summary and balance confirmation.]

---

## 📱 6. Mobile Usage Guidance

The TFA system is fully mobile-responsive, allowing access from smartphones and tablets.

### Browser Compatibility
- Supported browsers: Chrome, Safari, Firefox, Edge (latest versions).
- Minimum screen resolution: 320px width.
- Optimized for touch interactions.

### Mobile-Specific Features
1. **Responsive Design:** All portals automatically adjust to mobile screens.
2. **Push Notifications:** Enable notifications for balance alerts and transaction confirmations.
3. **Camera Integration:** Use device camera for QR code scanning during top-ups.
4. **Offline Capability:** Limited offline viewing of transaction history (syncs when online).

[Visual Aid: Mobile Dashboard Screenshot - Collapsed sidebar, stacked cards for mobile view.]

### Best Practices for Mobile Use
- Use secure Wi-Fi or mobile data.
- Enable two-factor authentication for account security.
- Regularly check app permissions for camera and notifications.
- Clear browser cache if experiencing loading issues.

---

## 🔧 7. Troubleshooting and FAQ

### Common Issues and Solutions

**Q: My vehicle was held at the exit barrier. What should I do?**
A: This usually indicates insufficient wallet balance. Check your balance in the Operator Portal or Public Portal and perform a top-up immediately. If balance is adequate, contact support with your plate number and trip ID.

**Q: Top-up payment was successful but balance not updated.**
A: Wait 2-3 minutes for webhook processing. If still not updated, check transaction status in your portal. Contact support with the reference number if issue persists.

**Q: ANPR camera didn't recognize my plate.**
A: Ensure plate is clean and visible. For temporary issues, staff can perform manual override. Report persistent recognition failures to support.

**Q: Kiosk rejects my cash bill.**
A: Ensure bill is genuine Philippine peso and not damaged. Only exact amounts accepted - no change given. Try a different denomination or use digital payment methods.

**Q: Cannot access account after password reset.**
A: Check spam/junk folder for reset email. If not received, contact support for manual reset.

**Q: System shows "Lane Offline" error.**
A: This is a hardware issue. Terminal staff will address it. If affecting multiple lanes, check system status on Admin dashboard.

**Q: Bank transfer top-up not reflecting.**
A: Bank transfers may take 5-15 minutes for processing. Use InstaPay for faster real-time transfers. Check bank app for confirmation.

**Q: Dispute filed but no response.**
A: Disputes are reviewed within 24 hours. Check ticket status in Support dashboard. Escalation available after 48 hours.

### System Performance Tips
- Clear browser cache weekly.
- Use latest browser version.
- Avoid multiple simultaneous sessions.
- Report bugs via support portal.

---

## 🔒 8. Security and Privacy

### Data Protection
- All data is encrypted in transit (TLS 1.2+) and at rest (AES-256).
- Compliance with Philippine Data Privacy Act (RA 10173).
- PCI DSS Level 1 compliance for payment data.

### Account Security
- Use strong, unique passwords.
- Enable two-factor authentication (2FA) where available.
- Never share login credentials.
- Log out after each session on shared devices.

### Privacy Practices
- Personal data collected only for system operation.
- Data retention: Transactions (10 years), Images (30 days), Audit logs (5 years).
- No data sold to third parties.
- Right to access, correct, or delete your data (contact support).

[Visual Aid: Privacy Policy Summary Screenshot - Key points highlighted.]

---

## 📚 9. Glossary

| Term | Definition |
|------|------------|
| ANPR | Automatic Number Plate Recognition - Camera technology that reads license plates. |
| DOTr | Department of Transportation (Philippines) - Government agency overseeing transportation. |
| GCash | Popular digital wallet in the Philippines for mobile payments. |
| Idempotency Key | Unique identifier preventing duplicate transaction processing. |
| InstaPay | Real-time low-value electronic fund transfer service. |
| Kiosk | Self-service terminal for cash and digital top-ups. |
| PESONet | Batch electronic fund transfer service in the Philippines. |
| PITX | Parañaque Integrated Terminal Exchange - The terminal location. |
| QRPh | Philippine QR code standard for payments. |
| SOA | Statement of Account - Monthly financial summary. |
| TFA | Terminal Fee Automation - This system. |
| Wallet | Digital account storing prepaid funds for terminal fees. |

---

## ⚡ 10. Quick Reference

### Fee Schedule
- City Bus: ₱50
- Provincial Bus: ₱75
- Modern Jeep: ₱25
- Traditional Jeep: ₱20
- Taxi & UV: ₱15
- Unregistered: ₱100 (manual payment)

### Contact Numbers
- Support Hotline: 1800-PITX-HELP (1800-7482-4357)
- Emergency: +63 917 123 4567
- Email: support@pitx-tfa.ph

### URLs
- Production: https://tfa.abbadev.com
- Public Portal: https://portal.pitx-tfa.ph
- Local Dev: http://localhost:5173

### Keyboard Shortcuts
- Ctrl+F: Search page
- Ctrl+R: Refresh data
- Esc: Close modals

---

## 📞 11. Support and Contact Information

### Support Channels
1. **In-System Support:** File tickets via Operator Portal > Support section.
2. **Hotline:** 1800-PITX-HELP (24/7, English/Filipino).
3. **Email:** support@pitx-tfa.ph (Response within 24 hours).
4. **Emergency Contact:** +63 917 123 4567 (Hardware failures, system outages).

### Office Hours
- Support: 24/7
- Administrative: Monday-Friday, 8AM-5PM PHT
- On-site Assistance: 24/7 at PITX terminal

### Escalation Process
1. Contact primary support channel.
2. If unresolved in 24 hours, request escalation.
3. Critical issues: Call emergency number directly.

For comprehensive system documentation, visit the [TFA Requirements Document](TFA-requirement.md).

---

*This manual is maintained by the PITX System Administration Team. Last updated: March 2, 2026.*
