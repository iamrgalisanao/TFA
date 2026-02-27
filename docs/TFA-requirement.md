# Software Requirements Specification (SRS)
## Automated Terminal Fee Collection System with ANPR & GCash Integration
### For Parañaque Integrated Terminal Exchange (PITX)

**Version:** 1.1  
**Date:** February 27, 2026  
**Prepared by:** System Architecture Team  

---

## Table of Contents

1. [Introduction](#1-introduction)  
   1.1 [Purpose](#11-purpose)  
   1.2 [Scope](#12-scope)  
   1.3 [Definitions and Acronyms](#13-definitions-and-acronyms)  
   1.4 [References](#14-references)  
   1.5 [Overview](#15-overview)  

2. [Overall Description](#2-overall-description)  
   2.1 [Product Perspective](#21-product-perspective)  
   2.2 [User Characteristics](#22-user-characteristics)  
   2.3 [Operating Environment](#23-operating-environment)  
   2.4 [Design and Implementation Constraints](#24-design-and-implementation-constraints)  
   2.5 [Assumptions and Dependencies](#25-assumptions-and-dependencies)  

3. [System Features and Requirements](#3-system-features-and-requirements)  
   3.1 [Functional Requirements](#31-functional-requirements)  
       3.1.1 [ANPR and Vehicle Detection](#311-anpr-and-vehicle-detection)  
       3.1.2 [Vehicle Classification and Master Data Management](#312-vehicle-classification-and-master-data-management)  
       3.1.3 [Automated Payment and Wallet Management](#313-automated-payment-and-wallet-management)  
       3.1.4 [Payment Gateway Integration (GCash & Bank Transfers)](#314-payment-gateway-integration-gcash--bank-transfers)  
       3.1.5 [Bank Transfer Integration for DOTR Remittance](#315-bank-transfer-integration-for-dotr-remittance)  
       3.1.6 [Transaction Management](#316-transaction-management)  
       3.1.7 [Operator Dashboard](#317-operator-dashboard)  
       3.1.8 [Public Portal](#318-public-portal)  
       3.1.9 [Reporting and Analytics](#319-reporting-and-analytics)  
       3.1.10 [DOTR Remittance](#3110-dotr-remittance)  
       3.1.11 [System Administration](#3111-system-administration)  
   3.2 [External Interface Requirements](#32-external-interface-requirements)  
       3.2.1 [User Interfaces](#321-user-interfaces)  
       3.2.2 [Hardware Interfaces](#322-hardware-interfaces)  
       3.2.3 [Software Interfaces](#323-software-interfaces)  
       3.2.4 [Communication Interfaces](#324-communication-interfaces)  
   3.3 [Non-Functional Requirements](#33-non-functional-requirements)  
       3.3.1 [Performance](#331-performance)  
       3.3.2 [Security](#332-security)  
       3.3.3 [Reliability and Availability](#333-reliability-and-availability)  
       3.3.4 [Scalability](#334-scalability)  
       3.3.5 [Maintainability](#335-maintainability)  
       3.3.6 [Regulatory Compliance](#336-regulatory-compliance)  

4. [Data Requirements](#4-data-requirements)  
   4.1 [Data Models](#41-data-models)  
   4.2 [Data Storage](#42-data-storage)  
   4.3 [Data Retention and Archival](#43-data-retention-and-archival)  

5. [Appendices](#5-appendices)  
   5.1 [API Specifications (Partial)](#51-api-specifications-partial)  
   5.2 [Sample Reports](#52-sample-reports)  
   5.3 [Glossary](#53-glossary)  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document defines the complete set of requirements for the development of an automated terminal fee collection system at the Parañaque Integrated Terminal Exchange (PITX). The system will utilize Automatic Number Plate Recognition (ANPR) technology to identify vehicles entering and exiting the terminal, automatically deduct fees from pre-funded operator wallets, and provide real‑time reporting and remittance to the Department of Transportation (DOTr). It includes integration with GCash and bank transfer services for seamless wallet top‑ups and DOTr remittance.

### 1.2 Scope
The system will:
- Capture vehicle license plates at entry and exit lanes via ANPR cameras.
- Classify vehicles into types (City Bus, Provincial Bus, Modern Jeep, Traditional Jeep, Taxi & UV, Unregistered).
- Maintain a master database of registered vehicles and operator accounts.
- Provide a wallet system for operators/drivers to pre‑load funds.
- Automatically deduct applicable terminal fees upon vehicle exit.
- Integrate with GCash and bank transfer channels (InstaPay/PESONet) for wallet top‑ups.
- Integrate with banking APIs to automate DOTr remittance via bank transfer.
- Offer an operator dashboard for monitoring, exception handling, and reporting.
- Provide a public portal for account management and top‑ups.
- Generate daily, weekly, monthly, and yearly collection reports.
- Compute and facilitate remittance to DOTr.
- Ensure high availability, security, and scalability to handle peak loads.

Out of scope:
- Physical infrastructure installation (e.g., cameras, barriers) – assumed to be provided separately.
- Integration with other government systems beyond DOTr remittance (future phase).

### 1.3 Definitions and Acronyms

| Term       | Definition                                                                           |
|------------|--------------------------------------------------------------------------------------|
| ANPR       | Automatic Number Plate Recognition                                                   |
| DOTr       | Department of Transportation (Philippines)                                           |
| PITX       | Parañaque Integrated Terminal Exchange                                               |
| SOA        | Statement of Account                                                                 |
| OPS        | Operations Team                                                                      |
| API        | Application Programming Interface                                                    |
| RFID       | Radio Frequency Identification                                                       |
| ETC        | Electronic Toll Collection                                                           |
| PCI DSS    | Payment Card Industry Data Security Standard                                         |
| TLS        | Transport Layer Security                                                             |
| InstaPay   | Real‑time low‑value electronic fund transfer service in the Philippines              |
| PESONet    | Batch electronic fund transfer service in the Philippines                            |
| BSP        | Bangko Sentral ng Pilipinas                                                          |

### 1.4 References
- Dragonpay API Documentation
- GCash / Nuvei Payment Gateway Integration Guide
- QRPh Standards
- PITX Operational Guidelines
- Bangko Sentral ng Pilipinas (BSP) Circular on Electronic Payments

### 1.5 Overview
This document is organized into four main sections: Introduction, Overall Description, System Features and Requirements (functional and non‑functional), and Data Requirements. The appendices provide detailed API specifications and sample reports.

---

## 2. Overall Description

### 2.1 Product Perspective
The Automated Terminal Fee Collection System is a new, standalone system that will interface with existing PITX infrastructure (ANPR cameras, barriers, network). It will replace manual fee collection and integrate with external payment gateways (GCash, Dragonpay, QRPh) and banking APIs for electronic payments and remittances. The system will also interface with DOTr systems for remittance reporting (initially via file upload, later via API).

### 2.2 User Characteristics

| User Role         | Description                                                                          |
|-------------------|--------------------------------------------------------------------------------------|
| **Operator**      | Staff of bus/taxi companies who manage vehicle registration, view outstanding balances, and generate SOAs. |
| **Terminal Staff**| PITX personnel who monitor lane operations, handle exceptions (unregistered plates), and access real‑time reports. |
| **Driver**        | Individual driver of a registered vehicle; can top up wallet via public portal (optional). |
| **System Administrator** | IT staff managing user accounts, system configuration, and audit logs.          |
| **DOTr Auditor**  | Government personnel who access remittance reports (via secure portal or file).      |

### 2.3 Operating Environment
- **Hardware:** ANPR cameras (Hikvision DS-TCG405-E or equivalent), edge servers, lane controllers, barriers, deposit machines (optional for cash top‑ups).
- **Network:** High‑speed LAN within terminal, secure internet connection for cloud services.
- **Software:** Backend services hosted on cloud (AWS/Azure) with on‑premise edge processing. Web interfaces accessible via modern browsers. Mobile‑friendly design.

### 2.4 Design and Implementation Constraints
- Must comply with Philippine data privacy laws (DPA).
- Payment processing must adhere to PCI DSS Level 1.
- Banking integrations must comply with BSP regulations and bank partner security requirements.
- System must operate 24/7 with minimal downtime.
- Must handle up to 500 vehicles per hour during peak.
- Integration with GCash and banks must follow respective API specifications.

### 2.5 Assumptions and Dependencies
- ANPR cameras provide reliable plate recognition under various lighting/weather conditions.
- Master data (vehicle registration) will be provided by OPS team in a structured format and kept up‑to‑date.
- Internet connectivity is stable; edge servers can buffer data during outages.
- Operators and drivers have basic digital literacy.
- Bank partnerships are established to access APIs for fund transfers and balance inquiries.

---

## 3. System Features and Requirements

### 3.1 Functional Requirements

#### 3.1.1 ANPR and Vehicle Detection
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-101  | The system shall capture license plate images at each entry and exit lane using ANPR cameras. |
| FR-102  | Edge servers shall process images to extract plate numbers with ≥95% accuracy.                |
| FR-103  | For unrecognizable plates, the system shall flag the vehicle for manual review and store the image. |
| FR-104  | Each detection shall include timestamp, lane ID, direction (entry/exit), and image reference. |

#### 3.1.2 Vehicle Classification and Master Data Management
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-201  | The system shall maintain a master database of registered vehicles with attributes: plate number, vehicle type (City Bus, Provincial Bus, Modern Jeep, Traditional Jeep, Taxi & UV), operator ID, contact details, and wallet account linkage. |
| FR-202  | Upon entry detection, the system shall query the master database to classify the vehicle.      |
| FR-203  | If plate not found, mark as “Unregistered” and apply default fee (or trigger manual handling). |
| FR-204  | Master data shall be synchronised with OPS team inputs via batch upload or real‑time API.      |

#### 3.1.3 Automated Payment and Wallet Management
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-301  | Each registered operator/driver shall have a wallet account with a unique wallet ID.           |
| FR-302  | Wallet balance shall be stored in PHP and updated in real‑time.                                |
| FR-303  | Upon exit, the system shall calculate the applicable terminal fee based on vehicle type and duration (if time‑based) and attempt to deduct from the wallet. |
| FR-304  | If balance is sufficient, the system shall open the exit barrier and record the transaction.   |
| FR-305  | If insufficient funds, the barrier shall remain closed and an alert sent to operator/terminal staff. |
| FR-306  | The system shall support auto top‑up rules (e.g., when balance falls below threshold, auto‑deduct from linked payment method). |

#### 3.1.4 Payment Gateway Integration (GCash & Bank Transfers)
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-401  | The system shall integrate with a payment aggregator (e.g., Dragonpay, PayMongo, Nuvei) that supports GCash and bank transfer channels (InstaPay, PESONet). |
| FR-402  | Users shall be able to initiate a wallet top‑up via GCash or direct bank transfer from the public portal or operator dashboard. |
| FR-403  | For bank transfers, the system shall generate a virtual bank account or payment instructions (e.g., reference number, bank details) for the user to complete the transfer. |
| FR-404  | The system shall support real‑time notification of bank transfer completion via webhook or polling of bank transaction status (where available). |
| FR-405  | Upon successful payment (GCash or bank transfer), the aggregator or bank API shall notify the system via webhook, which will then credit the wallet. |
| FR-406  | The system shall verify the webhook signature using a shared secret to prevent fraud.         |
| FR-407  | Idempotency keys shall be used to prevent duplicate processing of the same payment.            |
| FR-408  | Failed payments shall be retried up to 3 times with exponential backoff; otherwise marked as failed and user notified. |
| FR-409  | The system shall provide a transaction history of all top‑ups via GCash and bank transfers.    |

#### 3.1.5 Bank Transfer Integration for DOTR Remittance
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-501  | The system shall integrate with the DOTr‑designated bank’s API to initiate automated fund transfers for remittance. |
| FR-502  | Upon generation of a remittance report, an authorized user (PITX finance) can trigger a bank transfer for the computed amount. |
| FR-503  | The system shall support both real‑time (InstaPay) and batch (PESONet) transfer modes depending on amount and schedule. |
| FR-504  | The system shall record bank transaction references, statuses, and confirmation receipts for audit. |
| FR-505  | The system shall handle error conditions (e.g., insufficient PITX bank balance, network issues) and alert finance staff. |
| FR-506  | All bank transfer attempts shall be logged with full audit trail.                              |

#### 3.1.6 Transaction Management
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-601  | Each vehicle trip shall be recorded as a transaction with fields: trip ID, plate, vehicle type, entry time, exit time, fee, payment method (wallet), status (pending/paid/failed). |
| FR-602  | Each wallet top‑up (GCash/bank) shall be recorded as a transaction.                            |
| FR-603  | Transactions shall be immutable; any adjustments require an offsetting transaction.            |
| FR-604  | The system shall support manual override by authorized staff for exception cases (e.g., incorrect plate read). |

#### 3.1.7 Operator Dashboard
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-701  | Authorized operators shall have a web‑based dashboard to view their vehicles, wallet balance, transaction history, and outstanding SOAs. |
| FR-702  | Operators can initiate top‑ups (via GCash or bank transfer), view statements, and download reports. |
| FR-703  | Terminal staff shall have a dashboard with live lane status, exception queue, and manual payment/registration options. |
| FR-704  | The dashboard shall support role‑based access control.                                        |

#### 3.1.8 Public Portal
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-801  | A public website shall allow drivers/operators to register, manage their account, view balance, and top up using GCash or bank transfer. |
| FR-802  | The portal shall be mobile‑responsive and support both English and Filipino (optional).       |

#### 3.1.9 Reporting and Analytics
| ID      | Requirement                                                                                   |
|---------|-----------------------------------------------------------------------------------------------|
| FR-901  | The system shall generate daily, weekly, monthly, and yearly collection reports, filterable by vehicle type, operator, and date range. |
| FR-902  | Reports shall be exportable to PDF, Excel, and CSV.                                           |
| FR-903  | The system shall provide a dashboard for PITX management with key metrics (total collections, average fee per vehicle, peak hours, etc.). |

#### 3.1.10 DOTR Remittance
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| FR-1001  | The system shall compute the amount due to DOTR based on collection data and predefined share formula. |
| FR-1002  | A remittance report shall be generated daily (or on demand) and made available for download or sent via secure API. |
| FR-1003  | The system shall integrate with banking APIs to execute the actual fund transfer to DOTR’s account (see FR-501). |
| FR-1004  | The system shall maintain an audit trail of all remittances, including bank confirmation.     |

#### 3.1.11 System Administration
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| FR-1101  | Admin users can manage user accounts, roles, permissions, and system settings.                |
| FR-1102  | All system events and transactions shall be logged for audit purposes.                        |

### 3.2 External Interface Requirements

#### 3.2.1 User Interfaces
- Operator Dashboard: Responsive web UI built with React.js, optimized for desktop and tablet.
- Public Portal: Mobile‑first design using Vue.js.
- Admin Panel: Similar to operator dashboard with additional controls.

#### 3.2.2 Hardware Interfaces
- ANPR Cameras: Ethernet connection; integration via vendor SDK or ONVIF.
- Lane Barriers: Relay control via edge server.
- Deposit Machines: Serial or TCP/IP communication for cash/coin acceptance.

#### 3.2.3 Software Interfaces
- Payment Aggregator API: RESTful with JSON payloads; webhook callbacks (for GCash and bank transfer status).
- Banking API: REST/SOAP API for initiating fund transfers (InstaPay/PESONet) and checking balances (for DOTr remittance).
- GCash: Indirect via aggregator.
- Dragonpay, QRPh: Similar aggregator integration.
- OPS Master Data: CSV upload or REST API for synchronization.

#### 3.2.4 Communication Interfaces
- All external communication over HTTPS (TLS 1.2+).
- Internal microservices communicate via message queues (RabbitMQ) for reliability.

### 3.3 Non‑Functional Requirements

#### 3.3.1 Performance
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-101  | The system shall process a vehicle entry/exit within 2 seconds from camera trigger to barrier decision. |
| NFR-102  | The system shall support up to 500 concurrent transactions per hour.                          |
| NFR-103  | API response time (95th percentile) shall be <500ms.                                          |
| NFR-104  | Web pages shall load in <3 seconds on a standard broadband connection.                        |

#### 3.3.2 Security
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-201  | All sensitive data (PII, wallet balances) shall be encrypted at rest (AES-256) and in transit (TLS). |
| NFR-202  | Authentication shall use OAuth2 with JWT; passwords hashed with bcrypt.                        |
| NFR-203  | Payment data must be handled in compliance with PCI DSS.                                      |
| NFR-204  | Banking credentials and API keys shall be stored in a secure vault (e.g., HashiCorp Vault).   |
| NFR-205  | Role‑based access control (RBAC) shall be enforced.                                           |
| NFR-206  | API endpoints shall be protected against common attacks (rate limiting, input validation, SQL injection). |

#### 3.3.3 Reliability and Availability
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-301  | System availability target: 99.9% uptime (excluding planned maintenance).                     |
| NFR-302  | Edge servers shall continue to operate during network outages and sync data when connectivity resumes. |
| NFR-303  | Database replication and failover shall be implemented.                                       |

#### 3.3.4 Scalability
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-401  | The system architecture shall support horizontal scaling of microservices.                    |
| NFR-402  | The database shall be able to handle growth to millions of transactions per year.             |

#### 3.3.5 Maintainability
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-501  | Code shall be modular with clear separation of concerns.                                      |
| NFR-502  | Comprehensive logging and monitoring (e.g., ELK stack) shall be implemented.                  |

#### 3.3.6 Regulatory Compliance
| ID       | Requirement                                                                                   |
|----------|-----------------------------------------------------------------------------------------------|
| NFR-601  | Comply with Republic Act 10173 (Data Privacy Act of the Philippines).                         |
| NFR-602  | Comply with BSP regulations on electronic payments and fund transfers.                        |

---

## 4. Data Requirements

### 4.1 Data Models

**Vehicle**  
- plate_number (PK)  
- vehicle_type (enum)  
- operator_id (FK to Operator)  
- status (active/inactive)  
- created_at, updated_at  

**Operator**  
- operator_id (PK)  
- company_name  
- contact_person  
- phone  
- email  
- wallet_id (FK to Wallet)  

**Wallet**  
- wallet_id (PK)  
- balance (decimal)  
- currency (default PHP)  
- auto_topup_enabled (boolean)  
- auto_topup_threshold (decimal)  
- auto_topup_amount (decimal)  
- created_at, updated_at  

**Transaction**  
- transaction_id (PK)  
- wallet_id (FK)  
- trip_id (nullable)  
- amount (decimal)  
- type (topup/fee/refund/remittance)  
- method (GCash/bank_transfer/wallet)  
- status (pending/success/failed)  
- reference (external reference, e.g., GCash ref, bank ref)  
- created_at  

**Trip**  
- trip_id (PK)  
- plate_number (FK)  
- entry_time  
- exit_time (nullable)  
- fee (decimal)  
- status (open/closed)  

**PaymentRequest**  
- request_id (PK)  
- wallet_id  
- amount  
- payment_method (GCash, bank_transfer)  
- redirect_url  
- webhook_url  
- idempotency_key  
- status  
- created_at  

**Remittance**  
- remittance_id (PK)  
- period_start, period_end  
- total_collections (decimal)  
- dotr_share (decimal)  
- bank_reference (string)  
- status (pending/initiated/completed/failed)  
- initiated_by (user_id)  
- initiated_at  
- completed_at  

### 4.2 Data Storage
- Relational database (PostgreSQL) for transactional data.
- Time‑series database (TimescaleDB) for analytics.
- Image storage (S3 or equivalent) for ANPR images.

### 4.3 Data Retention and Archival
- Transaction data retained for 10 years (regulatory).
- ANPR images retained for 30 days, then archived.
- Audit logs retained for 5 years.

---

## 5. Appendices

### 5.1 API Specifications (Partial – GCash & Bank Transfer)

**Initiate Top‑up (GCash)**  
`POST /api/v1/payments/gcash/initiate`  
Request body and response as described in section 3.1.4.

**Initiate Top‑up (Bank Transfer)**  
`POST /api/v1/payments/bank/initiate`  
Returns virtual bank account details or instructions.

**Webhook for Payment Confirmation**  
`POST /webhooks/payment/callback`  
Handles both GCash and bank transfer status updates.

**Initiate DOTr Remittance**  
`POST /api/v1/remittance/dotr/initiate`  
Triggers bank transfer to DOTr account.

### 5.2 Sample Reports

- **Daily Collection Report:** Date, total vehicles, total fees collected, breakdown by vehicle type, operator summary.
- **Operator SOA:** Operator name, period, beginning balance, top‑ups (by method), fees deducted, ending balance.
- **DOTR Remittance Report:** Period, total collections, DOTr share, amount remitted, bank reference, date.

### 5.3 Glossary

| Term        | Definition                                                                     |
|-------------|--------------------------------------------------------------------------------|
| Wallet      | Digital account storing prepaid funds for fee payment.                         |
| Aggregator  | Third‑party service that connects to multiple payment gateways (e.g., GCash, bank channels). |
| InstaPay    | Real‑time low‑value electronic fund transfer service in the Philippines.       |
| PESONet     | Batch electronic fund transfer service in the Philippines.                     |
| Idempotency | Property of an API where multiple identical requests have the same effect as one. |

---

**End of Document**