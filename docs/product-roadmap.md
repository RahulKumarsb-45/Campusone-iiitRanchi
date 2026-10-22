# CampusOne — Product Roadmap (Now / Next / Later)

> **Document Status:** Living Product Roadmap
> **Author:** Rahul Kumar (Product Manager & Full-Stack Lead)
> **Cadence:** Semester-Aligned Horizons (Spring 2025 – Autumn 2025)
> **Notice:** _Roadmap items represent planned engineering horizons and strategic outcomes. Features are explicitly categorized by completion status._

---

## Roadmap Overview

```
+------------------------------------+------------------------------------+------------------------------------+
| NOW (Completed / Production Ready) | NEXT (Near-Term Quarter)           | LATER (Future Horizons)            |
+------------------------------------+------------------------------------+------------------------------------+
| • Role Governance & RLS Hardening  | • Automated Email & Push Alerts   | • QR-Code Event Check-In Scanning  |
| • Hostel Maintenance Ticketing     | • Rich Media Ingestion for AI (PDF)| • Multi-Hostel Inventory Restock   |
| • Product Conversion Analytics     | • Real-Time WebSockets for Tickets | • Society Budgeting & Grants Portal|
| • Grounded AI Campus Assistant     | • Student Feedback Loops on Events | • Native Progressive Web App (PWA) |
+------------------------------------+------------------------------------+------------------------------------+
```

---

## 1. NOW (Completed & Deployed Baseline)

### Item 1.1: Database Role Governance & Privilege Hardening

- **User Problem:** Ordinary users could potentially modify client state or raw profile records to escalate privileges to `admin` or publish unauthorized notices.
- **Proposed Outcome:** Strict PostgreSQL security definer trigger (`prevent_user_role_escalation`) and tightened RLS policies preventing unauthorized profile tampering.
- **Priority:** P0 (Critical Security)
- **Dependencies:** Supabase PostgreSQL extension, SQL migration 20250104.
- **Definition of Done:** Automated test suites verify that non-admin accounts cannot update their `role` column; verified staff checks enforced server-side.
- **Success Metric:** 0 unauthorized role changes in database audit logs.

### Item 1.2: Hostel Maintenance Ticket Lifecycle

- **User Problem:** Students lose track of repair requests; hostel caretakers duplicate verbal complaints.
- **Proposed Outcome:** Dedicated ticketing system with visual status badges (`Open` → `In Progress` → `Resolved` / `Rejected`) and warden review controls.
- **Priority:** P0 (Core Operations)
- **Dependencies:** `hostel_complaints` table, auth context, UI dialogs.
- **Definition of Done:** Resident submits ticket, warden updates status and resolution notes, student inspects update in real-time.
- **Success Metric:** Mean Time to Resolution (MTTR) < 72 hours.

### Item 1.3: Real Product Analytics & PM Conversion Metrics

- **User Problem:** Dashboard previously displayed static placeholder numbers without visibility into actual participant conversion or capacity utilization.
- **Proposed Outcome:** Live data aggregation calculating capacity fill rate, registration velocity, and category distribution with zero-data empty states.
- **Priority:** P1 (Product Observability)
- **Dependencies:** `lib/analytics.ts`, dynamic Recharts components.
- **Definition of Done:** Dashboard dynamically reflects database rows; toggle cleanly separates live data from simulated cohorts.
- **Success Metric:** 100% chart accuracy verified against raw SQL count queries.

### Item 1.4: Grounded AI Campus Assistant

- **User Problem:** Students repeatedly ask repetitive policy questions regarding attendance, library hours, and placement rules across chaotic chat groups.
- **Proposed Outcome:** Deterministic RAG assistant with source citations, latency monitoring, feedback thumbs, and prompt injection defense.
- **Priority:** P1 (Deflection & Guidance)
- **Dependencies:** Knowledge base index, Next.js server route `/api/assistant/chat`.
- **Definition of Done:** Passes 50-query benchmark evaluation with >90% accuracy and sub-50ms latency.
- **Success Metric:** Query pass rate > 90%; refusal rate on adversarial queries = 100%.

---

## 2. NEXT (Upcoming Quarter Focus)

### Item 2.1: Automated SMTP & In-App Notification Dispatcher

- **User Problem:** Students forget about events they registered for, leading to 30% venue no-show rates.
- **Proposed Outcome:** Triggered email confirmation and 24-hour reminder dispatched via Nodemailer using institute SMTP server.
- **Priority:** P1
- **Dependencies:** Configured SMTP credentials (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`).
- **Definition of Done:** Event registration triggers asynchronous email receipt containing calendar `.ics` invite.
- **Success Metric:** Event attendee attendance rate increases by 20%.

### Item 2.2: Automated Knowledge Base Sync via Official PDF Ingestion

- **User Problem:** New circulars require manual ingestion into `APPROVED_CAMPUS_KNOWLEDGE`.
- **Proposed Outcome:** Administrative upload portal allowing authorized staff to upload PDF notices with automated text extraction and vector chunking.
- **Priority:** P2
- **Dependencies:** Server-side PDF parser (`pdf-parse`) and Supabase pgvector extension.
- **Definition of Done:** Uploaded circular appears in assistant retrieval within 60 seconds without redeploying code.
- **Success Metric:** Zero manual code edits required to update campus circulars.

---

## 3. LATER (Future Horizons)

### Item 3.1: QR-Code Physical Attendance Verification

- **User Problem:** Event organizers cannot verify whether a registered student physically attended the venue.
- **Proposed Outcome:** Generation of a unique student QR code in the user dashboard that organizers scan at the auditorium entrance to convert registration into verified attendance.
- **Priority:** P2
- **Dependencies:** Scanner camera permissions, attendee verification API.
- **Definition of Done:** Scan updates `attendance_verified: true` in database within 1 second.
- **Success Metric:** Distinguishes registration conversion from actual physical presence in analytics.

### Item 3.2: Multi-Hostel Material & Spares Inventory Tracking

- **User Problem:** Electricians delay repairs because capacitors, wire reels, or fan regulators are out of stock.
- **Proposed Outcome:** Lightweight inventory ledger linked to hostel complaint tickets to track replacement parts usage.
- **Priority:** P3
- **Dependencies:** Warehouse inventory schema.
- **Definition of Done:** Resolving a complaint deducts 1 unit from designated hostel inventory stock.
- **Success Metric:** Stockout delays reduced by 40%.
