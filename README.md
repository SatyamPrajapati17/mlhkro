# WORKTAK — Autonomous AI & Biometric Company Management Platform

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)](http://localhost:3002)
[![Port](https://img.shields.io/badge/Port-3002%20(Strict)-red?style=for-the-badge)](http://localhost:3002)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-yellow?style=for-the-badge)](https://ai.google.dev/)
[![Biometrics](https://img.shields.io/badge/Biometrics-128--D%20Embeddings%20(Zero%20Photos)-blue?style=for-the-badge)](https://github.com/vladmandic/face-api)
[![Audit](https://img.shields.io/badge/Audit-SHA--256%20Hash%20Chaining-black?style=for-the-badge)](http://localhost:3002/app/security)
[![Integrations](https://img.shields.io/badge/Integrations-Slack%20%7C%20Google%20%7C%20RazorpayX%20%7C%20ZKTeco-orange?style=for-the-badge)](http://localhost:3002/app/integrations)

---

## ⚡ Overview & Vision

**WorkTak** is an autonomous, high-contrast **cyber-brutalist company management platform** built for high-throughput enterprises. It unifies biometric attendance verification, role-scoped AI query assistance, automated payroll with real-time Loss-of-Pay (LOP) calculation, AI-driven document OCR verification, tamper-evident cryptographic audit logs, and an extensible **App Integrations Hub** (Slack, Google Workspace, RazorpayX, ZKTeco hardware, and custom webhooks).

WorkTak runs strictly on a **single unified server at `http://localhost:3002`** (Node.js + Express TypeScript serving API endpoints under `/api` and Vite React SPA in middleware mode with strict port collision enforcement).

```
                                      WORKTAK SYSTEM TOPOLOGY
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    CYBER CLIENT SPA (REACT 19)                              │
  │  - Brutalist Cyber Interface (Strict 4-Color Palette: Red #E50914, Yellow #FFD700, #000, #FFF)│
  │  - Client-Side Biometrics (@vladmandic/face-api 128-D Euclidean distance vector extraction) │
  │  - Role Guards & Scoped Navigation (ADMIN, HR, FINANCE, MANAGER, EMPLOYEE)                  │
  └──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                 │ httpOnly Session Cookie (worktak_session)
                                                 ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
  │                             UNIFIED EXPRESS BACKEND (NODE 20 + TS)                          │
  │  - Single Server Port 3002 (Express + Vite Middleware Mode, Fail-Loud Collision Detection)   │
  │  - Google OAuth 2.0 Code Flow (/api/auth/google/callback) with Invite-Only RBAC Gate        │
  │  - Biometric Nonce Engine: 30s TTL, single-use anti-replay defense, liveness blink/yaw      │
  │  - TAK AI Assistant: Role-permission-guarded, whitelisted read-only tool calling            │
  │  - Statistical Anomaly Detection (z-score check-ins, late streaks, payroll deltas >25%)     │
  │  - Immutable Cryptographic Hash Chain: SHA-256 blocks chained back to genesis               │
  └──────────────┬───────────────────────────────┬───────────────────────────────┬──────────────┘
                 │                               │                               │
                 ▼                               ▼                               ▼
  ┌──────────────────────────────┐┌──────────────────────────────┐┌──────────────────────────────┐
  │      DATABASE LAYER          ││   GOOGLE AI STUDIO (GEMINI)  ││   APP INTEGRATIONS HUB       │
  │ - Dual Seam: Supabase/Local  ││ - Gemini 2.5 Flash Adapter   ││ - Slack Channel Webhooks     │
  │ - Multi-Tenant company_id    ││ - Whitelisted Tool Calling   ││ - Google Calendar / Drive    │
  │ - Row-Level Security (RLS)   ││ - Zero-Hallucination Numbers ││ - RazorpayX Direct Payouts   │
  │ - 128-D pgvector Embeddings  ││ - Document OCR Verification  ││ - ZKTeco Hardware Turnstiles │
  └──────────────────────────────┘└──────────────────────────────┘└──────────────────────────────┘
```

---

## 🛡️ Role-Based Permission Matrix

Every endpoint, view, and AI tool execution enforces strict Role-Based Access Control (RBAC):

| Feature / Capability | ADMIN | HR | FINANCE | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|:---:|:---:|
| **Executive Dashboard** | Full Corporate Telemetry | Workforce & KYC Health | Payroll Ledger & Cashflow | Team Presence & Approvals | Personal Attendance & Balances |
| **Employee Directory** | Full CRUD + Roster Invite | Full CRUD + Roster Invite | Read-Only Roster | Read Department Team | Self Profile Only |
| **Face Biometric Check-In** | Verify & Delete Any | Enroll & Verify | Verify | Verify Team | Self Verify & Re-enroll |
| **Attendance Logs** | All Company Logs | Logs + Manual Overrides | Read All | Team + Manual Overrides | Self Logs Only |
| **Leave Management** | Override & View All | Full Approval Queue | Read-Only | Approve Team Leaves | Apply & View Balance |
| **Payroll Engine** | Final Approval & Disburse | — | Prepare DRAFT Runs | — | — |
| **Official Payslips** | All Employee PDF Slips | — | All Employee PDF Slips | — | View Own Payslip PDF |
| **Document AI (OCR)** | Full Queue & Verify | Full Queue & Verify | — | — | Upload & View Own Status |
| **TAK AI Scope** | Company-Wide Tool Calling | Headcount & Attendance | Payroll & Department Costs| Team Scoped | Restricted to Personal Data |
| **Security & Hash Chain** | Full Audit Ledger & Verify | Anomaly Review | — | — | — |
| **App Integrations Hub** | Full Configuration | Manage Slack & Google | Manage Banking APIs | View Synced Feeds | — |

---

## 🔬 Core Innovations & AI/ML Architecture

### 1. Biometric Liveness & Verification Engine
- **Browser-Side Vector Extraction:** Client loads `@vladmandic/face-api` (Tiny Face Detector + 68 Facial Landmarks + Face Recognition net) from `public/models/`.
- **Zero Raw Photos Stored:** Video streams and photo frames never touch backend storage or networks. Only anonymous 128-dimensional floating point descriptor arrays are transmitted.
- **Single-Use Anti-Replay Nonce:** The server issues a cryptographically random UUID nonce with a 30-second TTL. Nonces are invalidated on consumption, defeating video replay and photo injection attacks.
- **Dynamic Liveness Challenge:** The client randomly prompts for physical actions (`BLINK TWICE`, `TURN HEAD LEFT`, `TURN HEAD RIGHT`) before sampling verification frames.
- **Euclidean L2 Matching:**
  $$\text{distance} = \sqrt{\sum_{i=1}^{128} (u_i - v_i)^2}$$
  Matches are confirmed when $\text{distance} \le 0.50$; confidence is calculated as $\text{clamp}(1 - \frac{\text{dist}}{0.60}, 0, 1) \times 100\%$.

### 2. Guardrailed TAK AI Assistant
- **Engine:** Google Gemini 2.5 Flash via Google AI Studio API (`LLM_API_KEY`).
- **Whitelisted Read-Only Tools:** `get_headcount`, `get_attendance_summary`, `get_late_comers`, `get_leave_balance`, `get_pending_leaves`, `get_payroll_summary`, `get_payroll_by_department`, `get_risk_signals`, `get_my_profile`.
- **Zero Raw Database Queries:** The model has zero SQL/DB access. Tool results are formatted deterministically before generation to guarantee zero numerical hallucinations.
- **Strict Permission Guardrails:** If an `EMPLOYEE` asks for corporate payroll, department salaries, or company-wide late arrivals, the request is blocked by policy before tool execution.

### 3. Automated Payroll with Attendance LOP
- **Loss-of-Pay (LOP) Computation:** Automatically deducts unapproved absences from monthly compensation based on immutable biometric attendance logs:
  $$\text{LOP Deduction} = \frac{\text{Gross Salary}}{\text{Working Days}} \times \text{Unexcused Days}$$
- **State Machine Workflow:** `DRAFT` (Finance preps) $\to$ `SUBMITTED` $\to$ `APPROVED` (Admin signs) $\to$ `PAID` (Direct bank disbursement).
- **Salary Delta Anomaly Flag:** Flags any employee whose net pay deviates $>25\%$ from the prior cycle without an approved base salary revision.
- **Official PDF Payslips:** Generates branded, verifiable pay statements detailing Basic, HRA, Allowances, PF (12%), PT, and LOP deductions.

### 4. Document AI (KYC & Identity OCR)
- Supports Aadhaar, PAN Card, and Passport uploads.
- Auto-extracts employee name, masked ID number (`XXXXXX4812`), DOB, and validity dates.
- Compares extracted metadata against the registered employee directory profile and scores match confidence ($>90\%$ for verified status).

### 5. Cryptographic SHA-256 Audit Hash Chain
- Every critical operational event (Login, Biometric Enrollment, Attendance Check-In, Leave Approval, Payroll Disbursement, Document Verification) is committed as an immutable block:
  $$\text{hash}_n = \text{SHA-256}(\text{hash}_{n-1} \parallel \text{company\_id} \parallel \text{actor} \parallel \text{action} \parallel \text{entity} \parallel \text{entity\_id} \parallel \text{metadata} \parallel \text{created\_at})$$
- One-click `[ VERIFY INTEGRITY CHAIN ]` walks the ledger back to genesis (`GENESIS_HASH_WORKTAK_000`) and pinpoints any row tampering.

### 6. App Integrations Hub & Webhooks
Connects WorkTak to third-party tools:
- **Slack Workspaces:** Real-time channel broadcasts for daily attendance roll-calls (`#attendance-alerts`), leave requests, and payroll disbursements.
- **Google Workspace & Calendar:** Bi-directional sync of approved team leaves to company Google Calendars and automatic archiving of KYC identity documents into Google Drive.
- **Microsoft Teams:** Adaptive Cards for manager one-tap leave authorizations.
- **RazorpayX / Stripe Banking API:** Automated direct bank transfers for approved payroll cycles.
- **ZKTeco Biometric Hardware:** On-premise optical/RFID turnstile gate ingestion via TCP/REST webhooks.
- **Custom Outgoing Webhooks:** HTTPS webhook callbacks signed with HMAC-SHA256 secrets for real-time company events.
- **Scoped API Tokens:** Bearer tokens for external scripts, microservices, and turnstiles.

---

## 🔌 API Endpoint Catalog

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status, port confirmation, and timestamp |
| `POST` | `/api/auth/google` | Public | Initiates Google OAuth 2.0 authorization code flow |
| `GET` | `/api/auth/google/callback` | Public | Handles OAuth return, matches invited employee, sets session cookie |
| `POST` | `/api/auth/demo-switch` | Public (Dev) | Instant role switcher session generator for testing |
| `GET` | `/api/auth/session` | Authenticated | Validates session token and returns current user payload |
| `POST` | `/api/auth/logout` | Authenticated | Clears `worktak_session` cookie and logs audit event |
| `POST` | `/api/face/challenge` | Authenticated | Generates 30s single-use nonce & liveness challenge action |
| `POST` | `/api/face/verify` | Authenticated | Verifies 128-D descriptor, invalidates nonce, commits attendance |
| `POST` | `/api/face/enroll` | Authenticated | Registers 5-frame averaged 128-D biometric template |
| `DELETE`| `/api/face/delete` | Authenticated | Deletes biometric embedding for user (right to erasure) |
| `GET` | `/api/attendance/logs` | Scoped | Retrieves attendance history (scoped by employee / team / company) |
| `POST` | `/api/attendance/manual-request`| Authenticated | Submits manual check-in request with reason for manager approval |
| `GET` | `/api/leaves/balances` | Authenticated | Returns annual leave balances (Casual, Sick, Earned, Unpaid) |
| `POST` | `/api/leaves/apply` | Authenticated | Applies for leave with quota deduction validation |
| `POST` | `/api/leaves/decide` | ADMIN, HR, MGR | Approves or rejects a pending leave application |
| `GET` | `/api/payroll/current` | ADMIN, FINANCE | Returns current month payroll cycle with LOP deductions |
| `POST` | `/api/payroll/transition` | ADMIN, FINANCE | Advances payroll stage: `DRAFT` $\to$ `SUBMITTED` $\to$ `APPROVED` $\to$ `PAID` |
| `GET` | `/api/payroll/payslips` | Scoped | Returns official payslips (company-wide or self-only) |
| `POST` | `/api/documents/upload` | Authenticated | Ingests document image and triggers AI OCR field extraction |
| `POST` | `/api/documents/:id/verify` | ADMIN, HR | Marks extracted document as VERIFIED or REJECTED |
| `POST` | `/api/ai/chat` | Authenticated | Executes whitelisted read-only tools and synthesizes answer |
| `POST` | `/api/ai/report` | ADMIN, HR, FIN, MGR | Synthesizes comprehensive executive intelligence report |
| `GET` | `/api/security/signals` | ADMIN, HR | Lists open statistical anomaly detection risk signals |
| `GET` | `/api/security/audit` | ADMIN | Returns immutable audit log ledger |
| `GET` | `/api/security/audit/verify` | ADMIN | Performs cryptographic SHA-256 hash chain verification back to genesis |
| `GET` | `/api/integrations` | Authenticated | Lists all connected apps, sync statuses, and telemetry |
| `POST` | `/api/integrations/:id/toggle` | ADMIN, HR, FIN | Enables or disables an external app integration |
| `POST` | `/api/integrations/:id/test` | ADMIN, HR, FIN | Executes live remote handshake test and returns latency |
| `GET` | `/api/integrations/webhooks` | Authenticated | Lists registered outgoing webhook pipelines |
| `POST` | `/api/integrations/webhooks` | ADMIN | Registers a new HTTPS webhook destination |
| `POST` | `/api/integrations/webhooks/:id/test` | ADMIN | Dispatches a simulated test event ping |
| `GET` | `/api/integrations/api-keys` | ADMIN | Lists issued API Bearer tokens |
| `POST` | `/api/integrations/api-keys` | ADMIN | Generates a new scoped API access token |
| `DELETE`| `/api/integrations/api-keys/:id` | ADMIN | Revokes an API access token |

---

## 🚀 Quickstart & Setup Guide

### System Requirements
- **Node.js:** $\ge 20.0.0$
- **npm:** $\ge 10.0.0$
- **Web Browser:** Chrome, Edge, or Firefox with camera permissions enabled for biometric features.

### 1. Clone & Install
```bash
git clone https://github.com/SatyamPrajapati17/mlhkro.git
cd mlhkro
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Strict Port Specification (Must be 3002)
PORT=3002
NODE_ENV=development
SESSION_SECRET=worktak_production_grade_secret_session_2026

# Google Cloud Console OAuth 2.0
# Authorised JavaScript origin: http://localhost:3002
# Authorised redirect URI:      http://localhost:3002/api/auth/google/callback
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Postgres & Storage (Dual-Seam Architecture)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI Studio
LLM_PROVIDER=gemini
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-2.5-flash

# Biometric Verification Configuration
FACE_MATCH_THRESHOLD=0.50
FACE_MARGIN=0.05
FACE_LOCKOUT_MINUTES=15
```

### 3. Launch Development Server
```bash
npm run dev
```
WorkTak strictly initializes at: **`http://localhost:3002`**

---

## 🎯 Evaluator Walkthrough & Testing Scenarios

| Step | Action | Route | What to Verify |
|:---:|---|---|---|
| **1** | **Landing Page** | `/` | Cyber-brutalist theme, marquee ticker, HUD feature pillars. |
| **2** | **Role Switching** | `/login` | Use bottom quick-switchers to test **Admin**, **HR**, **Finance**, **Manager**, or **Employee**. |
| **3** | **Biometric Check-In** | `/app/check-in` | Click `[ START SCAN ]`. Observe single-use nonce issuance, random liveness challenge (`BLINK TWICE` or `TURN HEAD`), and 128-D Euclidean vector matching. |
| **4** | **Leave Balance & Application** | `/app/leaves` | Apply for Casual Leave. Observe annual quota checks, real-time balance reduction, and manager approval queues. |
| **5** | **Payroll & LOP Engine** | `/app/payroll` | Switch to **Finance** or **Admin**. Review attendance-driven LOP deductions, advance workflow to `APPROVED`, and inspect PDF payslip generation under `/app/payslips`. |
| **6** | **AI Assistant & Permission Guard** | `/app/ai` | Ask: *"Who was late more than 3 times this month?"* or *"What is our payroll cost by department?"*. As an Employee, ask for corporate payroll to verify the RBAC safety refusal guardrail. |
| **7** | **Cryptographic Audit Chain** | `/app/security` | Click `[ VERIFY INTEGRITY CHAIN ]`. Observe SHA-256 blocks validated back to genesis with zero tampering. |
| **8** | **App Integrations Hub** | `/app/integrations` | Test Slack handshake ping, view active Google Calendar and ZKTeco connectors, trigger a test webhook dispatch, and generate a scoped API token. |

---

## 📄 License
MIT License. Developed for the Hackathon Track: **Artificial Intelligence and Machine Learning**.
