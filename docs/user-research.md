# CampusOne — User Research Plan & Provisional Hypotheses

> **Document Status:** Qualitative Research Protocol & Provisional Hypotheses
> **Notice:** _In strict adherence to evidence-based product management principles, this document outlines the active research plan, interview protocol, and provisional personas. It does NOT fabricate synthetic interview quotes, sample sizes, or fictional percentage claims._

---

## 1. Research Objectives

The primary goals of this research protocol are:

1. **Understand Information Discovery Workflows**: Map how undergraduate students at IIIT Ranchi currently learn about campus events, exam announcements, and hostel notices.
2. **Evaluate Friction in Residential Maintenance**: Identify breakdown points in the current hostel complaint submission and resolution lifecycle.
3. **Assess Event Management Pain Points**: Discover the administrative burden on club organizers when hosting campus hackathons and workshops using legacy tools (e.g., Google Sheets, WhatsApp).
4. **Determine AI Information Verification Expectations**: Understand whether students trust automated conversational tools for policy inquiries and what citation verification they require before acting on an answer.

---

## 2. Target Participant Cohorts & Screening

| Participant Identifier | Cohort Description                     | Criteria                                                                 | Sample Target  |
| :--------------------- | :------------------------------------- | :----------------------------------------------------------------------- | :------------- |
| **P-STU-[01-08]**      | Junior Undergraduates (1st & 2nd Year) | Active hostel residents, registered for at least one club event          | 8 participants |
| **P-SEN-[01-06]**      | Senior Undergraduates (3rd & 4th Year) | Actively preparing for internships or placements, high campus experience | 6 participants |
| **P-ORG-[01-04]**      | Student Society Leads                  | Organizers for House of Geeks (HOG), E-Cell, Vibrance, or Sports Society | 4 participants |
| **P-ADM-[01-03]**      | Hostel Wardens / Department Staff      | Staff handling maintenance registries or administrative notices          | 3 participants |

---

## 3. Semi-Structured Interview Protocol (Neutral Script)

### Section A: Daily Campus Workflow & Information Discovery

1. _"Can you walk me through the last time you searched for an official institute notice (e.g., mid-sem schedule or holiday list)? Where did you look first?"_
2. _"How do you typically discover upcoming student workshops, competitions, or sports tournaments?"_
3. _"What happens when an event schedule or venue changes at the last minute? How did you find out in the most recent instance?"_

### Section B: Hostel Living & Maintenance Operations

4. _"Think back to the last time something in your hostel room or wing malfunctioned (e.g., electrical socket, plumbing, Wi-Fi). What exact steps did you take to report it?"_
5. _"How did you know whether someone was working on the issue, and how long did it take before it was addressed?"_
6. _"Have you ever had a maintenance complaint lost, ignored, or disputed? What happened?"_

### Section C: Club Management & Event Organization (For Organizers)

7. _"When your club hosts a technical workshop or cultural contest, what tools do you use to collect registrations?"_
8. _"How do you prevent venue overcapacity or communicate role assignments to event volunteers?"_
9. _"What information do you wish you had about your attendees after the event concludes?"_

### Section D: Information Verification & AI Assistance

10. _"When someone tells you a campus policy (e.g., minimum attendance percentage or internship credit eligibility), how do you verify if it is accurate?"_
11. _"If a campus digital assistant gave you an answer to an academic question, what would make you trust it or doubt it?"_

---

## 4. Provisional User Personas (Grounded Hypotheses)

> **Methodological Note:** These personas represent provisional behavioral archetypes derived from campus structural constraints rather than finalized demographic surveys.

### Persona 1: "The Busy CS Sophomore" (Provisional)

- **Archetype:** Second-year B.Tech Computer Science student residing in Hostel B.
- **Goals:** Keep up with high-intensity coding coursework, participate in tech fests, and ensure room Wi-Fi/electricity are stable for evening contests.
- **Hypothesized Pain Point:** Constantly checks 4 different WhatsApp class groups for circulars; misses hostel water shutdown announcements because physical notice board is located at the main gate.
- **Desired Outcome:** Quick dashboard notifications and a direct 30-second maintenance ticket lodging mechanism.

### Persona 2: "The Overburdened Club Lead" (Provisional)

- **Archetype:** Third-year lead coordinator for House of Geeks (HOG) technical club.
- **Goals:** Host high-attendance coding workshops, track attendance accurately, and recruit volunteer desk support.
- **Hypothesized Pain Point:** Spends hours cross-referencing messy Google Sheets; experiences 40% no-show rates because participants register on impulse with no cancellation option.
- **Desired Outcome:** Built-in event capacity caps, automated ticket cancellation to free up seats, and volunteer role signups.

### Persona 3: "The Residential Warden" (Provisional)

- **Archetype:** Faculty warden managing hostel facilities and student welfare.
- **Goals:** Maintain hostel hygiene, address safety hazards promptly, and minimize chaotic verbal complaints during evening rounds.
- **Hypothesized Pain Point:** Maintenance ledger entries written in paper notebooks are frequently illegible, missing room numbers, or duplicated by multiple roommates.
- **Desired Outcome:** Centralized digital queue showing open complaints categorized by trade (electrician vs. plumber) with timestamped resolution logs.

---

## 5. Research Recording & Evidence Template

```markdown
### Interview Record: [Participant ID, e.g., P-STU-01]

- **Date & Setting:** [Date / In-person or Video Call]
- **Interviewer:** [Interviewer Name]
- **Demographic Summary:** [Year / Branch / Hostel Wing]

#### Raw Observations & Behaviors

- Finding 1: [Objective description of behavior without editorializing]
- Finding 2: [Observed workaround or tool usage]

#### Categorized Pain Points

| Pain Point Category | Observed Behavior                              | Severity (Low/Med/High) | Confidence Score (1-5) |
| :------------------ | :--------------------------------------------- | :---------------------- | :--------------------- |
| Notice Discovery    | [e.g., Saves screenshots of emails to gallery] | High                    | 4                      |
| Hostel Maintenance  | [e.g., Roommate reported same fan issue twice] | High                    | 5                      |

#### Verification & Follow-up Actions

- [ ] Cross-reference finding with administrative log records
```

---

## 6. Synthesis & Hypothesis Prioritization Framework

All qualitative findings collected during user interviews will be evaluated using a **Confidence & Impact Matrix**:

1. **High Frequency + High Friction (Critical Path)**:
   - _Example:_ Inability to verify if a hostel complaint is being worked on. Addressed in **Phase 2 (Hostel Ticketing)**.
2. **High Frequency + Moderate Friction**:
   - _Example:_ Checking multiple pages for upcoming workshops. Addressed in **Phase 1 (Consolidated Events Calendar)**.
3. **Moderate Frequency + High Severity**:
   - _Example:_ Academic exam disqualification due to attendance misunderstanding. Addressed in **Phase 5 (Verified AI Assistant RAG)**.

_This framework ensures engineering cycles are allocated to structural user friction rather than superficial feature expansion._
