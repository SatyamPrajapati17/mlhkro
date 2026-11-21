# WORKTAK // CONTROL ROOM
### Autonomous Enterprise Management & Biometric Intelligence Platform
**Hackathon Track:** Artificial Intelligence & Machine Learning  
**Target Environment:** `http://localhost:3002` (Unified Node + Express TypeScript & Vite SPA)

---

```
                                  WORKTAK ARCHITECTURE
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 WEB CLIENT (REACT 19 + VITE)                           │
│  - Cyber-Brutalist Glassmorphism Interface (Tokens: Red, Yellow, Black, White)         │
│  - @vladmandic/face-api (TensorFlow.js 128-D Biometric Extraction in Browser)          │
│  - Role Guards & Scoped Navigation (ADMIN, HR, FINANCE, MANAGER, EMPLOYEE)             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ httpOnly Session Cookie & REST / SSE
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              UNIFIED BACKEND ENGINE (NODE 20 + TS)                     │
│  - Strict Single-Port Architecture: Port 3002 (Fail-Loud Collision Detection)          │
│  - Google OAuth 2.0 Code Flow (/api/auth/google/callback) with Invite-Only Gate        │
│  - Biometric Nonce & Liveness Engine (Single-Use Anti-Replay Defense)                  │
│  - TAK//AI Assistant (Whitelisted Read-Only Tool Execution, Role Scope Guard)          │
│  - Statistical Anomaly Detection & Immutable SHA-256 Hash Chain Verification           │
└──────────────────────┬───────────────────────────────────┬─────────────────────────────┘
                       │                                   │
                       ▼                                   ▼
        ┌──────────────────────────────┐    ┌──────────────────────────────┐
        │  SUPABASE / POSTGRES SCHEMA  │    │  GOOGLE AI STUDIO (GEMINI)   │
        │  - Multi-Tenant company_id   │    │  - Gemini 2.5 Flash Adapter  │
        │  - Row-Level Security (RLS)  │    │  - Tool Call Synthesis       │
        │  - Vector (128-D Embeddings) │    │  - Document Field OCR        │
        └──────────────────────────────┘    └──────────────────────────────┘
```

---

## ⚡ Core Problem & Solution

Traditional small-to-midsize companies manage HR, operations, and payroll across disconnected spreadsheets and messaging channels. Attendance suffers from buddy punching, reports require manual analyst overhead, sensitive documents are chased over chat, and managers cannot query telemetry without SQL skills.

**WorkTak** resolves this with a unified, high-contrast **cyber-brutalist control room**:
1. **Trustworthy Attendance:** Guided 5-frame enrollment and real-time liveness challenges (random server nonces, blink counter, head-turn yaw detection).
2. **Zero Photo Storage:** Photos never leave client memory; only anonymous mathematical 128-dimensional L2-normalized float embeddings are processed.
3. **TAK//AI Intelligence Layer:** Chat copilot and executive report generator powered by Gemini 2.5 Flash utilizing whitelisted read-only tools. Permission guardrails enforce that employees cannot access corporate secrets.
4. **Automated Compensations:** Attendance-driven loss-of-pay (LOP) deduction calculator, PF, tax deductions, and branded PDF payslips.
5. **Cryptographic Integrity:** Tamper-evident SHA-256 hash chaining on all critical corporate actions with one-click chain validation.

---

## 🛡️ Role-Based Permission Matrix

WorkTak features 5 tailored operational workspaces enforced at both UI route guards and backend API middleware:

| Feature / Workspace | ADMIN | HR | FINANCE | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|:---:|:---:|
| **Control Dashboard** | Full Corporate KPI | Workforce & Docs | Ledger & Payroll Run | Team Presence & Approvals | Self Status & Leave Balances |
| **Employee Directory** | Full CRUD | Full CRUD | Read-Only | Read Team | — |
| **Face Biometric Scan** | Verify & Delete Any | Enroll & Verify | Verify | Verify Team | Self Verify & Delete |
| **Attendance Logs** | All Logs + Export | All Logs + Manual Decide | Read All | Team + Manual Decide | Self Logs Only |
| **Leave Management** | Override & View All | Full Approvals | Read All | Approve Team Leaves | Apply & View Own |
| **Payroll Runs** | Final Approval & Disburse | — | Prepare DRAFT Runs | — | — |
| **Official Payslips** | Company All | — | Company All | — | View Own Only |
| **AI Document OCR** | Full Queue & Verify | Full Queue & Verify | — | — | Upload & View Own |
| **TAK//AI Scope** | Company-Wide | People & Attendance | Financial Data | Team Scoped | Restricted to Self Records |
| **Security & Hash Chain**| Tamper Verification | Anomaly Review | — | — | — |

---

## 🔬 AI & Machine Learning Specifications

### 1. Biometric Liveness & Verification Engine
- **Descriptor Extraction:** Uses `@vladmandic/face-api` (Tiny Face Detector + 68 Facial Landmarks + Face Recognition net) in the client browser.
- **5-Frame Quality Gates:** Frame height >= 25%, detection score >= 0.80, luminance variance checks, and frontal yaw within $\pm 15^\circ$.
- **Liveness Challenge Nonce:** Server issues a single-use random UUID nonce with 30s TTL. Client detects random challenge action (`BLINK_2`, `TURN_LEFT`, `TURN_RIGHT`) before sampling 3 consecutive verification frames.
- **Matching Distance:** Evaluates 128-dimensional Euclidean distance against registered vector profile:
  $$\text{dist} = \sqrt{\sum_{i=1}^{128} (u_i - v_i)^2}$$
  Matches accepted when $\text{dist} < 0.50$; confidence scored as $\text{clamp}(1 - \frac{\text{dist}}{0.60}, 0, 1)$. Single-use nonce invalidation defends against replay attacks.

### 2. TAK//AI Copilot & Whitelisted Tools
- **Model:** Google Gemini 2.5 Flash via Google AI Studio API (`LLM_API_KEY`).
- **Whitelisted Read-Only Tools:** `get_headcount`, `get_attendance_summary`, `get_late_comers`, `get_leave_balance`, `get_pending_leaves`, `get_payroll_summary`, `get_payroll_by_department`, `get_risk_signals`, `get_my_profile`.
- **Zero Raw SQL Access:** Model queries execute strictly through user-scoped typed handlers. Numbers in answers are anchored to tool data to eradicate numerical hallucinations.
- **Source Verification:** Every answer renders clickable verification chips citing exact tools and data timestamps.
- **Safety Refusals:** When an `EMPLOYEE` prompts for company payroll or cross-employee attendance, the assistant politely refuses based on assigned permissions.

### 3. Explainable Statistical Anomaly Detection
- **Check-in Outliers:** Per-employee z-score calculation of arrival minutes vs personal 30-day mean: $|z| > 2.5$ flags alert.
- **Late Streaks:** Flags employees with $\ge 3$ late arrivals within a 5-day rolling window.
- **Payroll Delta Flag:** Alerts whenever net compensation fluctuates $>25\%$ from previous cycle without a base revision.

### 4. Cryptographic SHA-256 Audit Hash Chain
- Every audit entry hashes the preceding block's digest:
  $$\text{hash}_n = \text{SHA-256}(\text{hash}_{n-1} \parallel \text{company\_id} \parallel \text{actor} \parallel \text{action} \parallel \text{entity} \parallel \text{entity\_id} \parallel \text{metadata} \parallel \text{created\_at})$$
- One-click `[ VERIFY INTEGRITY CHAIN ]` walks the ledger back to genesis (`GENESIS_HASH_WORKTAK_000`) and pinpoints any row tampering.

---

## 🚀 Quickstart & Setup

### Requirements
- Node.js $\ge 20$
- npm $\ge 10$

### 1. Clone & Install
```bash
git clone https://github.com/SatyamPrajapati17/mlhkro.git
cd mlhkro
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=3002
NODE_ENV=development
SESSION_SECRET=worktak_super_secret_session_key_2026_dev_mode

# Google Cloud Console OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Postgres & Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI Studio
LLM_PROVIDER=gemini
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-2.5-flash

# Biometric Verification
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

## 🎯 Testing & Evaluation Guide

| Scenario | What to Click / Inspect | Expected Result |
|---|---|---|
| **1. Landing Page** | Open `http://localhost:3002/` | Glitch hero, scanline HUD preview, hazard stripes, dark cyber grid. |
| **2. Role Isolation** | On `/login`, click **`EMPLOYEE (SELF)`** | Lands on Employee dashboard. Notice **PAYROLL** and **SECURITY** are absent from sidebar. |
| **3. RBAC Route Guard** | Type `http://localhost:3002/app/payroll` | Blocked immediately with `403 FORBIDDEN` access denied screen. |
| **4. Face Check-In** | Navigate to `/app/check-in` & click `[ START SCAN ]` | Liveness prompt appears (`BLINK TWICE` or `TURN HEAD`). 128-D descriptor verified and logged in attendance records. |
| **5. AI Permission Guard** | Under `/app/ai`, ask *"What is company payroll?"* | TAK//AI politely refuses due to employee permission scope. |
| **6. Admin Workflows** | Switch role to **`ADMIN`** via sidebar selector | Unlocks full controls: People roster, Leave approvals, Payroll approval, AI Report Generator, and Security audit chain. |
| **7. Hash Chain Verify** | Open `/app/security` & click `[ VERIFY INTEGRITY CHAIN ]` | Validates entire SHA-256 block ledger and displays `CHAIN INTACT`. |

---

## 📄 License
MIT License. Built for the Hackathon Track: **Artificial Intelligence and Machine Learning**.
