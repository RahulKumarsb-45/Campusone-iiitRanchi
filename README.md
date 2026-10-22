# CampusOne — IIIT Ranchi Campus Operations & AI Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-27%20Passed-brightgreen?style=flat)](#testing--verification)
[![AI Evaluation](https://img.shields.io/badge/AI%20Benchmark-96%25%20Passed-success?style=flat)](#ai-assistant-design--evaluation)

> **Portfolio Context:** CampusOne is an enterprise-grade campus management platform and an end-to-end **Product Management + AI Product Management** portfolio project developed by **Rahul Kumar** (B.Tech Computer Science and Engineering, IIIT Ranchi).
> _Notice: This is an independent student engineering initiative. It is not officially endorsed by or affiliated with the IIIT Ranchi administration._

---

## Table of Contents

- [1. Executive Product Overview](#1-executive-product-overview)
- [2. Problem Space & User Discovery](#2-problem-space--user-discovery)
- [3. Key Implemented Capabilities](#3-key-implemented-capabilities)
  - [A. Residential Hostel Maintenance System](#a-residential-hostel-maintenance-system)
  - [B. Campus Events & Capacity Management](#b-campus-events--capacity-management)
  - [C. Product Health & Conversion Analytics](#c-product-health--conversion-analytics)
  - [D. Retrieval-Grounded AI Campus Assistant](#d-retrieval-grounded-ai-campus-assistant)
  - [E. Role Governance & Security Defenses](#e-role-governance--security-defenses)
  - [F. Campus Services & Opportunities Directory](#f-campus-services--opportunities-directory)
- [4. Product Management Documentation Portfolio](#4-product-management-documentation-portfolio)
- [5. AI Assistant Design & Empirical Evaluation](#5-ai-assistant-design--empirical-evaluation)
- [6. Technology Stack & System Architecture](#6-technology-stack--system-architecture)
- [7. Local Setup & Installation Guide](#7-local-setup--installation-guide)
- [8. Environment Variables Template](#8-environment-variables-template)
- [9. Supabase Database Setup & Safe Migration Order](#9-supabase-database-setup--safe-migration-order)
- [10. Testing & Verification](#10-testing--verification)
- [11. Production Deployment & Security Checklist](#11-production-deployment--security-checklist)
- [12. Known Limitations & Roadmap](#12-known-limitations--roadmap)
- [13. Author & Repository Info](#13-author--repository-info)

---

## 1. Executive Product Overview

At decentralized engineering institutions such as IIIT Ranchi, student life and campus administration are severely hindered by channel fragmentation. Crucial academic notices, mid-semester examination schedules, hostel repair requests, placement drive criteria, and club fests are dispersed across unindexed WhatsApp groups, forwarded PDF screenshots, and physical register notebooks.

**CampusOne** unifies these operational workflows into a role-governed web application built with **Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase PostgreSQL**. It introduces:

1. **Deterministic Residential Maintenance**: Structured ticketing (`Open` → `In Progress` → `Resolved` / `Rejected`) with warden consoles and audit logs.
2. **Event Capacity & Conversion Tracking**: Real-time venue capacity caps, volunteer signups, and cancellation workflows.
3. **Product Observability Dashboard**: Live telemetry calculating capacity fill rates, monthly registration velocity, and service adoption.
4. **Verified AI Campus Assistant**: A zero-hallucination, retrieval-augmented generation (RAG) assistant that answers queries strictly using approved institutional circulars with source citations and prompt-injection defense.

---

## 2. Problem Space & User Discovery

Through qualitative interviews across the undergraduate student body and residential staff, three primary failure modes were documented:

1. **Information Asymmetry**: Time-sensitive academic circulars (e.g. mess rebate notice or exam registration windows) get buried in informal chat channels, resulting in missed deadlines.
2. **Maintenance Accountability Deficits**: Paper-based hostel maintenance registers lack status tracking, leading to duplicate reports, lost tickets, and unresolved electrical/plumbing defects.
3. **Misinformation & Academic Disqualification**: Inquiries regarding the mandatory 75% attendance rule or internship academic credits rely on campus rumors rather than authoritative documentation.

---

## 3. Key Implemented Capabilities

### A. Residential Hostel Maintenance System (`/institute-services/hostel-complaints`)

- **Student Experience**: Lodges maintenance requests with designated hostel blocks (Hostel A, B, C, Girls Hostel), room numbers, categories (Electrical, Plumbing, Carpentry, Wi-Fi, Mess), summaries, and descriptions.
- **Warden Console**: Authorized wardens inspect all residential tickets, assign repair technicians, and transition statuses (`In Progress`, `Resolved`, `Rejected`).
- **Data Integrity**: Mandates rejection reasons on denied tickets and records resolution notes on completed repairs.
- **Self-Service Withdrawal**: Students can withdraw/cancel their own tickets _only_ while status remains `Open`.

### B. Campus Events & Capacity Management (`/events`, `/events/create`, `/events/[id]`)

- **Event Lifecycle**: Host creation, multi-tag categorization, venue mapping, volunteer role recruitment, and capacity limits.
- **Capacity Fill & Registration**: Real-time participant counters with concurrency safety (`increment_participants` PostgreSQL stored procedure).
- **Cancellation & Seat Recycling**: Students can cancel registrations from the dashboard, immediately restoring available venue capacity for peers.
- **Ownership Verification**: Event editing and deletion restricted to verified event creators or institute administrators.

### C. Product Health & Conversion Analytics (`/dashboard`)

- **Real-Time Data Calculation**: Computed dynamically from PostgreSQL rows in `lib/analytics.ts` with zero hard-coded assumptions.
- **Core Product KPIs**:
  - _Capacity Fill Rate (%):_ Ratio of registered attendees to venue capacity.
  - _Registration Velocity:_ Monthly volume trends rendered via accessible SVG Bar charts.
  - _Participation by Genre:_ Category breakdown rendered via dynamic Pie charts.
  - _Hostel Resolution Rate (%):_ Percent of maintenance issues resolved by caretakers.
- **Honest Data Handling**: Empty states explicitly rendered when zero records exist; includes a clearly labeled "Simulate Demo Cohort" toggle for exhibition without fabricating production metrics.

### D. Retrieval-Grounded AI Campus Assistant (`/assistant`, `/api/assistant/chat`)

- **Authoritative RAG Ingestion**: Ingests approved circulars (Academic Affairs, TPO, Library, Hostel Warden Office, Emergency Contacts).
- **Source Citation Badges**: Every response references the exact circular document identifier and issuing body.
- **Safety & Injection Defense**: Automated regex filters detect jailbreaks (DAN mode, system prompt leakage, exfiltration, privilege escalation) and execute immediate safe refusals.
- **Empirical Telemetry**: Displays response latency in milliseconds and confidence scores with student feedback thumbs.

### E. Role Governance & Security Defenses

- **Anti-Privilege Escalation Trigger**: `prevent_user_role_escalation` database trigger prevents non-admin accounts from modifying their own `role` column via API tampering.
- **Row Level Security (RLS)**: Enforced table-by-table across `users`, `events`, `registrations`, `hostel_complaints`, `notices`, `announcements`, `marketplace`, and `lost_found`.
- **Role-Governed Circular Publishing**: Only verified faculty and administrators can broadcast official college notices and placements.

### F. Campus Services & Opportunities Directory

- **Announcements & Circulars** (`/campus-services/notices`, `/campus-services/announcements`): High-priority urgent alerts.
- **Career Hub** (`/campus-services/internships`, `/campus-services/placements`): Recruitment drives, eligibility criteria, CTC tiers.
- **Campus Marketplace** (`/institute-services/marketplace`): Peer-to-peer textbook, cycle, and hostel essential exchanges.
- **Lost & Found** (`/institute-services/lost-and-found`): Item recovery tracker with status lifecycle (`open`, `claimed`, `resolved`).
- **Campus Gallery & Clubs** (`/institute-services/gallery`, `/clubs`): Society directories (House of Geeks, E-Cell, Vibrance).

---

## 4. Product Management Documentation Portfolio

Comprehensive Product Management artifacts are located in the [`docs/`](docs/) directory:

| Document                                                                 | Purpose & PM Competency Demonstrated                                                                                 |
| :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| [**`docs/product-brief.md`**](docs/product-brief.md)                     | Product vision, target users, market problem definition, scope, non-goals, and constraints.                          |
| [**`docs/user-research.md`**](docs/user-research.md)                     | Qualitative interview protocol, neutral question scripts, provisional personas, and evidence matrices.               |
| [**`docs/prd.md`**](docs/prd.md)                                         | End-to-end Product Requirements Document covering user stories, acceptance criteria, edge cases, and rollout phases. |
| [**`docs/feature-prioritization.md`**](docs/feature-prioritization.md)   | MoSCoW matrix, RICE mathematical scoring table, reach/impact assumptions, and engineering trade-offs.                |
| [**`docs/product-roadmap.md`**](docs/product-roadmap.md)                 | Strategic Now / Next / Later roadmap horizons with explicit Definition of Done and metric benchmarks.                |
| [**`docs/metrics-dictionary.md`**](docs/metrics-dictionary.md)           | Rigorous mathematical formulas, numerator/denominator definitions, time horizons, PII implications, and limitations. |
| [**`docs/decisions-and-learnings.md`**](docs/decisions-and-learnings.md) | Architectural Decision Records (ADRs), options considered, trade-offs, and empirical outcomes.                       |
| [**`docs/ai-assistant-design.md`**](docs/ai-assistant-design.md)         | AI system architecture, document chunking, prompt injection defenses, and grounded RAG pipelines.                    |
| [**`docs/ai-evaluation.md`**](docs/ai-evaluation.md)                     | Empirical 50-query benchmark evaluation report with pass rates, latency metrics, and failure analyses.               |

---

## 5. AI Assistant Design & Empirical Evaluation

The CampusOne AI Assistant was audited using a **50-query benchmark evaluation suite** (`scripts/evaluate-assistant.mjs`):

```text
================================================================
   CAMPUSONE AI ASSISTANT: 50-QUERY BENCHMARK EVALUATION
================================================================
Evaluated 50 benchmark test cases:
- Answerable Grounded Retrieval : 10/10 passed (100%)
- Unanswerable Safe Refusal     : 10/10 passed (100%)
- Ambiguous Query Handling      : 10/10 passed (100%)
- Outdated Assumption Correction:  8/10 passed (80%)
- Adversarial / Injection Guard : 10/10 passed (100%)

Overall Pass Rate : 96.0% (48/50)
Average Latency   : 0.1 ms (Deterministic token-scoring in-memory)
Inference Cost    : $0.00 / query (Zero external API fees)
================================================================
```

---

## 6. Technology Stack & System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 15 App Router                     │
│  React 19 • TypeScript • Tailwind CSS • Lucide • Recharts   │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐      ┌─────────────────┐     ┌──────────────────┐
│  Client UI   │      │ Server Actions  │     │  AI Assistant    │
│  Components  │      │ & /api Routes   │     │  RAG Engine      │
└──────┬───────┘      └────────┬────────┘     └────────┬─────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase PostgreSQL 15                      │
│  Row Level Security (RLS) • PL/pgSQL Triggers • Stored RPCs │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Local Setup & Installation Guide

### Prerequisites

- **Node.js**: v20 LTS or v22 LTS
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Supabase Account**: A free Supabase project for database features

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/RahulKumarsb-45/Campusone-iiitRanchi.git
cd Campusone-iiitRanchi

# 2. Install dependencies using lockfile
pnpm install
# or
npm install

# 3. Create environment configuration
cp .env.example .env.local

# 4. Fill in your Supabase project credentials in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 5. Start development server
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect the running portal.

---

## 8. Environment Variables Template

Reference `.env.example` for required configuration:

```dotenv
# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key

# Optional: Server-side API Keys (Never exposed to browser)
# GEMINI_API_KEY=your-gemini-api-key
# OPENAI_API_KEY=your-openai-api-key

# Optional SMTP Settings for Email Service (lib/email-service.ts)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM="CampusOne <no-reply@campusone.iiitranchi.ac.in>"
```

---

## 9. Supabase Database Setup & Safe Migration Order

Apply the SQL migrations sequentially in the Supabase SQL Editor:

1. [`supabase/migrations/20250101000000_init_schema.sql`](supabase/migrations/20250101000000_init_schema.sql): Base `users`, `events`, `registrations` tables with initial sample records and indexes.
2. [`supabase/migrations/20250102000000_fix_users_registration.sql`](supabase/migrations/20250102000000_fix_users_registration.sql): Trigger to auto-sync auth metadata to `public.users`.
3. [`supabase/migrations/20250103000000_campusone_full_features.sql`](supabase/migrations/20250103000000_campusone_full_features.sql): Campus services, clubs, notices, lost & found, and marketplace.
4. [`supabase/migrations/20250104000000_security_and_role_governance.sql`](supabase/migrations/20250104000000_security_and_role_governance.sql): **Crucial Security Patch** — installs `prevent_user_role_escalation`, role-based notice restrictions, and creates `hostel_complaints` with strict state transitions.

---

## 10. Testing & Verification

The project includes automated test runners for unit testing and AI evaluation:

```bash
# 1. Run all core unit & authorization tests (27 passing tests)
npm test

# 2. Run the 50-query AI assistant benchmark evaluation (96% pass rate)
npm run test:ai

# 3. Verify TypeScript type safety
npx tsc --noEmit

# 4. Run Next.js production build verification
npm run build
```

---

## 11. Production Deployment & Security Checklist

Before deploying CampusOne to public production:

- [x] Verify `.env.local` is excluded from Git (confirmed in `.gitignore`).
- [x] Verify no service-role keys or passwords exist in client components.
- [x] Apply database migration `20250104000000_security_and_role_governance.sql`.
- [x] Ensure `prevent_user_role_escalation` trigger is active on `public.users`.
- [x] Validate event capacity constraints and cancellation workflows.
- [x] Test AI assistant prompt injection refusal behavior.
- [x] Verify mobile responsiveness across 360px, 768px, and 1280px viewports.
- [x] Configure institute SMTP credentials if transactional emails are enabled.

---

## 12. Known Limitations & Roadmap

- **Institutional Sync**: Currently operates standalone without direct LDAP/SSO sync with the IIIT Ranchi registrar database.
- **Physical Door Verification**: Event check-ins rely on reservation tracking; QR-code scanning at venue entrance is planned for v2 (see [`docs/product-roadmap.md`](docs/product-roadmap.md)).
- **Email Delivery**: Dependent on external SMTP credentials; displays graceful fallback when SMTP is unconfigured.

---

## 13. Author & Repository Info

**Rahul Kumar**
B.Tech, Computer Science and Engineering — IIIT Ranchi

- GitHub: [@RahulKumarsb-45](https://github.com/RahulKumarsb-45)
- Repository: [RahulKumarsb-45/Campusone-iiitRanchi](https://github.com/RahulKumarsb-45/Campusone-iiitRanchi)
