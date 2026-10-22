# Feature Prioritization Framework & RICE Scoring

> **Document Status:** Planning & Portfolio Baseline
> **Author:** Rahul Kumar (Product Manager & Full-Stack Lead)
> **Frameworks Applied:** MoSCoW Method & RICE Scoring Model
> **Notice:** _Effort estimates reflect actual full-stack Next.js/Supabase development time. Reach and impact estimates represent provisional product assumptions based on student cohort size (approx. 800 undergraduates at IIIT Ranchi)._

---

## 1. MoSCoW Prioritization Matrix

The initial release roadmap was categorized into four structural tiers:

```
+---------------------------------------------------------------------------------+
| MUST HAVE (Core Platform Viability)                                             |
| - Tamper-resistant Auth & Role Security (Prevents privilege escalation)        |
| - Event Lifecycle: Browse, Create, Register, Cancel, Capacity enforcement       |
| - Hostel Maintenance Ticketing with State Machine & RLS                         |
| - Consolidated Campus Notices & Announcements directory                         |
+---------------------------------------------------------------------------------+
| SHOULD HAVE (High Leverage Engagement & Support)                                |
| - Grounded AI Campus Assistant (FAQ & Academic Regulations)                     |
| - Product Health & Conversion Analytics Dashboard                               |
| - Club Discovery & Category Filtering                                           |
| - Lost & Found Status Tracking (Open, Claimed, Resolved)                        |
+---------------------------------------------------------------------------------+
| COULD HAVE (Value-Add Utilities)                                                |
| - Peer-to-Peer Campus Marketplace (Books, cycles, hostel furniture)             |
| - Campus Gallery with event photo categorization                                |
| - Automated Email notifications for event confirmations (requires SMTP)         |
+---------------------------------------------------------------------------------+
| WON'T HAVE (Deferred / Non-Goals for Initial Release)                           |
| - Live Payment Gateway Integration (Razorpay/Stripe compliance overhead)        |
| - Native Mobile iOS/Android Applications (Web PWA suffices)                     |
| - Official Academic Transcripts / Grading Engine (Institute ERP scope)          |
+---------------------------------------------------------------------------------+
```

---

## 2. RICE Scoring Methodology & Assumptions

The **RICE** model scores features using:

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

### Parameter Definitions

- **Reach**: Estimated number of students/staff impacted over a 90-day semester window (Scale: 1 – 800 users).
- **Impact**: Expected improvement in task completion or problem resolution:
  - `3.0` = Massive impact (Solves major daily pain point)
  - `2.0` = High impact
  - `1.0` = Medium impact
  - `0.5` = Low impact
- **Confidence**: Team confidence in the problem definition and technical feasibility:
  - `100% (1.0)` = High confidence (Clear institutional requirement)
  - `80% (0.8)` = Medium confidence
  - `50% (0.5)` = Low confidence / exploratory
- **Effort**: Person-weeks of full-stack engineering effort required to implement, secure, and test:
  - `1.0` = ~1 person-week

---

## 3. RICE Prioritization Table

|  Rank  | Feature Candidate                             | Reach (Users/90d) | Impact (0.5–3.0) | Confidence (0.5–1.0) | Effort (Person-Wks) | RICE Score |     Status     |
| :----: | :-------------------------------------------- | :---------------: | :--------------: | :------------------: | :-----------------: | :--------: | :------------: |
| **1**  | **Hostel Maintenance Ticketing**              |        750        |       3.0        |         0.9          |         1.5         | **1,350**  | ✅ Implemented |
| **2**  | **Centralized Events & Capacity Management**  |        700        |       2.5        |         0.9          |         1.5         | **1,050**  | ✅ Implemented |
| **3**  | **Role Governance & Security Hardening**      |        800        |       3.0        |         1.0          |         0.8         | **3,000**  | ✅ Implemented |
| **4**  | **Grounded AI Campus Assistant**              |        600        |       2.0        |         0.8          |         1.2         |  **800**   | ✅ Implemented |
| **5**  | **Product Analytics & PM Conversion Metrics** |        150        |       2.0        |         0.9          |         0.6         |  **450**   | ✅ Implemented |
| **6**  | **College Notices & Announcements Hub**       |        700        |       1.5        |         0.9          |         0.7         | **1,350**  | ✅ Implemented |
| **7**  | **Lost & Found Tracker**                      |        300        |       1.0        |         0.8          |         0.5         |  **480**   | ✅ Implemented |
| **8**  | **Campus Marketplace**                        |        250        |       1.0        |         0.7          |         0.6         |  **291**   | ✅ Implemented |
| **9**  | **Live Online Payment Gateway**               |        100        |       0.5        |         0.5          |         3.0         |  **8.3**   |  ⛔ Deferred   |
| **10** | **Native iOS/Android Flutter App**            |        400        |       1.0        |         0.5          |         6.0         |  **33.3**  |  ⛔ Deferred   |

---

## 4. Rationale for Major Priority Trade-Offs

### Priority 1: Role Governance & Security Hardening (Score: 3,000)

- **Why First:** In multi-tenant campus platforms, permissive RLS or client-only role checks permit malicious privilege escalation (e.g. students assigning themselves `admin` role or altering institutional notices). Without defense-in-depth SQL triggers, no feature can be considered production-ready.
- **Engineering Effort:** Database migrations, PostgreSQL security definer triggers, and RLS policy rewrites.

### Priority 2: Hostel Maintenance Ticketing (Score: 1,350)

- **Why Critical:** Physical living conditions directly affect all residential students daily. Transitioning from paper logs to digital state transitions delivers immediate tangible value with measurable MTTR improvements.

### Priority 3: Grounded AI Assistant (Score: 800)

- **Why Valued:** Routine student inquiries regarding examination attendance rules (75% rule) and placement eligibility place repetitive load on faculty coordinators. Providing instant, deterministic citations prevents misinformation.

---

## 5. Explicitly Deferred Features & Rationale

1. **Integrated Payment Gateway (Razorpay/Stripe)**
   - _Rationale:_ Majority of campus events at IIIT Ranchi are free institute-sponsored workshops or society meetings. Introducing payment compliance, merchant KYC, and refund dispute logic would have tripled engineering effort for marginal MVP utility. Free reservation tracking was prioritized.
2. **Native Mobile App (React Native / Flutter)**
   - _Rationale:_ Next.js 15 App Router with responsive Tailwind design provides immediate desktop and mobile web parity without app store review delays or multi-codebase maintenance overhead.
