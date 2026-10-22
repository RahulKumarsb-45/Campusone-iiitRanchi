# CampusOne — Product Brief

> **Document Status:** Active / Portfolio Baseline
> **Author:** Rahul Kumar (B.Tech CSE, IIIT Ranchi)
> **Role:** Product Manager & Full-Stack Lead
> **Product Name:** CampusOne
> **Institution Focus:** Indian Institute of Information Technology Ranchi (IIIT Ranchi)
> **Notice:** _Independent student initiative and engineering portfolio project. Not officially endorsed by or affiliated with IIIT Ranchi administration._

---

## 1. Executive Summary

Indian higher education campuses, particularly newer technical institutes operating from transitional or distributed infrastructure, suffer from extreme communication fragmentation. At IIIT Ranchi, vital announcements, exam schedules, hostel maintenance requests, club events, placement drives, and peer-to-peer textbook exchanges are scattered across unofficial WhatsApp groups, disorganized email inboxes, Telegram channels, and physical notice boards.

**CampusOne** is an integrated campus management and engagement platform that consolidates academic circulars, campus events, hostel maintenance requests, placement updates, and student services into a single, role-governed web application. Additionally, it integrates a deterministic, retrieval-grounded **AI Campus Assistant** that provides verifiable answers derived exclusively from published circulars, preventing misinformation and administrative bottlenecks.

---

## 2. Target Users & Stakeholders

| User Segment                            | Key Characteristics                                                                      | Primary Need                                                                                   |
| :-------------------------------------- | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Undergraduate Students** (Years 1–4)  | Tech-savvy, mobile-first, balancing coursework, competitive programming, and campus life | Rapid, single-pane access to event registrations, hostel repair requests, and verified notices |
| **Club Leads & Event Organizers**       | Student council, House of Geeks (HOG), cultural, sports, and technical societies         | Self-serve event publishing, participant capacity tracking, and volunteer recruitment          |
| **Hostel Wardens & Caretakers**         | Administrative staff managing residential wings (Hostels A, B, C, Girls Hostel)          | Structured issue ticketing, transparent repair assignments, and dispute reduction              |
| **Faculty & Department Administrators** | Academic Section, Dean R&D, Examination Cell                                             | High-integrity broadcast channel for official circulars with role-restricted publishing        |
| **Training & Placement Office (TPO)**   | Placement officers and student coordinators                                              | Timely dissemination of drive schedules, eligibility criteria, and CTC tiers                   |

---

## 3. Problem Statement & User Pain Points

Through direct observational study and peer interviews within the student cohort, four core structural problems were identified:

1. **Information Asymmetry & Missed Deadlines**: Time-sensitive academic circulars (e.g., examination forms, mess rebate deadlines) posted exclusively via email threads or forwarded PDF screenshots get lost in chatter.
2. **Untracked Residential Maintenance**: Hostel repairs (water geysers, Wi-Fi access point flapping, fan regulators) were historically logged via physical register books, leading to lost complaints, lack of accountability, and repeated student escalation.
3. **Event Fragmentation & Low Participation**: Campus societies lacked a unified event portal, relying on Google Forms for registration. This created attendee duplication, unmanaged venue capacity overruns, and zero post-event analytics.
4. **Misinformation & Rumor Propagation**: Queries regarding credit policies, attendance thresholds (75% rule), or placement Dream Offer rules relied on word-of-mouth rather than verified documentation.

---

## 4. Proposed Value Proposition

- **Single Source of Truth**: One verified portal for academic circulars, hostel notices, and campus broadcasts.
- **Closed-Loop Hostel Maintenance**: Full lifecycle ticketing (`Open` → `In Progress` → `Resolved` / `Rejected`) with timestamped audit trails.
- **Self-Serve Event Management**: Real-time capacity monitoring, volunteer signups, and cancellation handling.
- **Verified AI Campus Assistant**: Zero-hallucination RAG assistant providing grounded responses citing official circular IDs.
- **Privacy & Role-Governed Access**: Row Level Security (RLS) guaranteeing students only access their private data while staff maintain administrative governance.

---

## 5. Scope & Capabilities

### In Scope (Current Implementation)

- **Authentication & User Profiles**: Supabase Auth integration with role governance (`student`, `faculty`, `organizer`, `admin`) and tamper-resistant profiles.
- **Campus Events**: Creation, browsing, search, capacity enforcement, volunteer role assignment, and cancellation.
- **Hostel Maintenance Ticketing**: Student complaint logging, warden review console, status transition controls, and resolution notes.
- **Campus Services Directory**: Dedicated hubs for Notices, Announcements, Internships, Placements, Lost & Found, Marketplace, and Gallery.
- **Product Analytics Dashboard**: Dynamic calculation of capacity conversion rate, registration velocity, and complaint resolution rates.
- **AI Campus Assistant**: Deterministic keyword/token-matching RAG with prompt injection defense and source citations.

### Non-Goals (Explicitly Deferred)

- Direct online payment gateway processing (currently tracks paid/free status and payment IDs without handling live payment card data).
- Official grade sheet or transcript generation (restricted to institutional ERP).
- Automated room allocation algorithms (managed strictly by hostel warden committee).

---

## 6. Business & Product Objectives

| Metric Category                           | Target Objective                                                           | Measurement Mechanism                                       |
| :---------------------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **User Activation**                       | 70% of registered students complete profile within 7 days                  | Supabase auth timestamp vs. profile completion              |
| **Event Capacity Utilization**            | Achieve >65% capacity fill rate across technical and cultural workshops    | Real-time `current_participants / max_participants`         |
| **Hostel MTTR (Mean Time to Resolution)** | Reduce complaint resolution time to <72 hours                              | Difference between `created_at` and `updated_at` (Resolved) |
| **AI Assistant Deflection Rate**          | Resolve >60% of routine campus inquiries without administrative escalation | Thumbs-up feedback and absence of escalation ticket         |
| **Zero Privilege Escalation**             | 100% prevention of unauthorized role promotion                             | Database trigger `prevent_user_role_escalation` logs        |

---

## 7. Assumptions & Constraints

### Key Assumptions

1. Students possess an active institute email domain (`@iiitranchi.ac.in`) or verified personal email for Supabase authentication.
2. Hostel caretakers and wardens have desktop or mobile browser access to inspect the maintenance dashboard during work hours.
3. Institutional policies (attendance rules, library timings) are published periodically and can be ingested into the AI assistant knowledge base.

### Technical & Environmental Constraints

- **Hosting Tier**: Deployment on zero-cost or developer tiers (Vercel Hobby + Supabase Free Tier) requires lean database indexing and stateless API routes.
- **Zero Paid API Dependencies**: The default assistant engine runs deterministically without mandatory paid external LLM subscriptions.
- **Stateless Execution**: Next.js App Router serverless execution precludes long-lived in-memory background jobs.
