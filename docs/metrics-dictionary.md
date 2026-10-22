# CampusOne — Product Metrics Dictionary

> **Document Status:** Authoritative Metric Definitions
> **Author:** Rahul Kumar (Product Manager & Full-Stack Lead)
> **Audience:** Engineers, Product Managers, Institutional Stakeholders
> **Notice:** _Defines mathematical formulas, edge cases, data sources, and privacy boundaries for all platform metrics._

---

## Foundational Measurement Principles

To prevent vanity metrics and deceptive reporting, CampusOne enforces four structural distinctions across all dashboards and reports:

1. **Registered Account ≠ Active User**: An identity created in `public.users` indicates account provisioning, not ongoing engagement. Activity requires session interaction or task execution within the evaluation window.
2. **Page View ≠ Successful Task**: A view of `/events/[id]` indicates interest or browsing, not successful registration or problem resolution.
3. **Event Registration ≠ Physical Attendance**: A ticket booked via `public.registrations` reserves venue capacity; physical attendance requires door verification.
4. **Zero vs. Unavailable Data**: A metric value of `0` denotes measured absence of activity (e.g. 0 complaints in a brand new hostel wing). A `null` or empty state denotes missing instrumentation or unconfigured services.

---

## Metric 1: Event Capacity Fill Rate (Conversion Rate)

| Attribute                | Specification                                                                                                                                     |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**                 | Event Capacity Fill Rate                                                                                                                          |
| **Purpose**              | Measures how effectively published event venues and workshop seats are utilized by the student body.                                              |
| **Formula**              | $$\text{Capacity Fill Rate (\%)} = \left( \frac{\text{Total Registered Participants}}{\text{Total Available Venue Capacity}} \right) \times 100$$ |
| **Numerator**            | Sum of `events.current_participants` across published events in window.                                                                           |
| **Denominator**          | Sum of `events.max_participants` across published events in window.                                                                               |
| **Time Window**          | Rolling 30 days or Semester-to-date.                                                                                                              |
| **Data Source**          | `public.events` table in PostgreSQL.                                                                                                              |
| **Inclusion Criteria**   | Published events with `max_participants > 0`.                                                                                                     |
| **Exclusion Criteria**   | Cancelled events, draft events, or unlimited capacity broadcasts.                                                                                 |
| **Privacy Implications** | None. Aggregated numeric counts only; no personal identities exposed.                                                                             |
| **Limitations**          | Does not account for no-shows unless door check-in is recorded.                                                                                   |
| **Decisions Informed**   | Informs auditorium booking sizes, workshop scheduling times, and marketing channels.                                                              |

---

## Metric 2: Registration Velocity (Monthly Trend)

| Attribute                | Specification                                                                                                                |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Name**                 | Monthly Registration Velocity                                                                                                |
| **Purpose**              | Tracks monthly student participation volume to identify academic calendar peaks (e.g., fest season vs. mid-sem study weeks). |
| **Formula**              | $$\text{Monthly Velocity} = \sum \text{Successful Registrations created within Month } M$$                                   |
| **Numerator**            | Count of records in `public.registrations` where `date_trunc('month', registration_date) = M`.                               |
| **Denominator**          | N/A (Absolute volume count).                                                                                                 |
| **Time Window**          | Calendar month (1st to last day of month, UTC).                                                                              |
| **Data Source**          | `public.registrations` table.                                                                                                |
| **Inclusion Criteria**   | Active registrations confirmed in database.                                                                                  |
| **Exclusion Criteria**   | Withdrawn / cancelled registrations where the row was deleted.                                                               |
| **Privacy Implications** | Zero PII; grouped by month bucket only.                                                                                      |
| **Limitations**          | Does not differentiate between paid and free event registrations.                                                            |
| **Decisions Informed**   | Helps student council avoid scheduling major fests during examination preparation weeks.                                     |

---

## Metric 3: Hostel Maintenance Resolution Rate

| Attribute                | Specification                                                                                                                 |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Name**                 | Hostel Maintenance Resolution Rate                                                                                            |
| **Purpose**              | Measures the operational efficiency of hostel facilities and caretaker resolution.                                            |
| **Formula**              | $$\text{Resolution Rate (\%)} = \left( \frac{\text{Total Resolved Tickets}}{\text{Total Logged Tickets}} \right) \times 100$$ |
| **Numerator**            | Count of `public.hostel_complaints` where `status = 'Resolved'`.                                                              |
| **Denominator**          | Count of all `public.hostel_complaints` created in the evaluation window.                                                     |
| **Time Window**          | Trailing 30 days or academic semester.                                                                                        |
| **Data Source**          | `public.hostel_complaints` table.                                                                                             |
| **Inclusion Criteria**   | Tickets logged by authenticated residents across all hostel blocks.                                                           |
| **Exclusion Criteria**   | Tickets withdrawn by students before inspection while still `Open`.                                                           |
| **Privacy Implications** | Aggregate metric is public to wardens; student room numbers and names are restricted via RLS.                                 |
| **Limitations**          | A ticket marked 'Resolved' by a technician does not guarantee resident satisfaction unless confirmed.                         |
| **Decisions Informed**   | Identifies chronic facility failures and justifies infrastructure budget allocations.                                         |

---

## Metric 4: Mean Time to Resolution (Hostel MTTR)

| Attribute                | Specification                                                                                                                                             |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                 | Mean Time to Resolution (MTTR)                                                                                                                            |
| **Purpose**              | Quantifies the average turnaround duration from maintenance complaint lodging to repair completion.                                                       |
| **Formula**              | $$\text{MTTR} = \frac{1}{N} \sum_{i=1}^{N} \left( \text{updated\_at}_i - \text{created\_at}_i \right) \quad \text{for tickets with status = 'Resolved'}$$ |
| **Numerator**            | Cumulative elapsed hours between ticket creation and marked resolution.                                                                                   |
| **Denominator**          | Total number of resolved tickets ($N$).                                                                                                                   |
| **Time Window**          | Trailing 30 days.                                                                                                                                         |
| **Data Source**          | `public.hostel_complaints` timestamps.                                                                                                                    |
| **Inclusion Criteria**   | Resolved maintenance tickets.                                                                                                                             |
| **Exclusion Criteria**   | Open, In Progress, or Rejected tickets.                                                                                                                   |
| **Privacy Implications** | Zero personal data; aggregated duration in hours.                                                                                                         |
| **Limitations**          | If a warden batches updates at the end of the week, MTTR appears artificially inflated.                                                                   |
| **Decisions Informed**   | Evaluates staffing levels for outsourced electricians, carpenters, and plumbers.                                                                          |

---

## Metric 5: AI Assistant Grounded Pass Rate & Citation Precision

| Attribute                | Specification                                                                                                                                                      |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                 | AI Grounded Accuracy & Citation Precision                                                                                                                          |
| **Purpose**              | Evaluates whether the AI assistant provides factually accurate answers backed by approved circulars and refuses unverified/adversarial prompts.                    |
| **Formula**              | $$\text{Benchmark Pass Rate (\%)} = \left( \frac{\text{Correct Grounded Retrievals + Valid Safe Refusals}}{\text{Total 50 Benchmark Queries}} \right) \times 100$$ |
| **Numerator**            | Count of benchmark test queries correctly answered with valid circular citations + count of adversarial/OOD queries safely refused.                                |
| **Denominator**          | Total queries in versioned evaluation benchmark (50 queries).                                                                                                      |
| **Time Window**          | Measured on every release build via `scripts/evaluate-assistant.mjs`.                                                                                              |
| **Data Source**          | Automated evaluation runner against `lib/ai-assistant.ts`.                                                                                                         |
| **Inclusion Criteria**   | All 50 queries across the 5 standard test suites.                                                                                                                  |
| **Exclusion Criteria**   | None.                                                                                                                                                              |
| **Privacy Implications** | Static synthetic benchmark dataset containing no private student credentials.                                                                                      |
| **Limitations**          | Synthetic benchmarks test known query distributions; novel out-of-distribution student slang must be continuously added to the evaluation set.                     |
| **Decisions Informed**   | Gate check for production deployment: Assistant cannot be deployed if benchmark pass rate falls below 90%.                                                         |
