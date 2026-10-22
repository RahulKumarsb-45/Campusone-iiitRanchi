# AI Campus Assistant — Technical & Product Design

> **Document Status:** Architectural & System Design Document
> **Author:** Rahul Kumar (AI Product Manager & Full-Stack Lead)
> **Module Path:** `/assistant` & `lib/ai-assistant.ts`
> **API Route:** `/api/assistant/chat`
> **Notice:** _Production design for the retrieval-grounded CampusOne AI Assistant at IIIT Ranchi._

---

## 1. Product Purpose & Problem Context

Students at IIIT Ranchi face recurring difficulties locating verified institutional guidelines:

- What is the exact attendance percentage required to sit for mid-semester exams?
- How do summer internship credits get transferred to academic transcripts?
- What are the step-by-step procedures for lodging a hostel fan repair?
- What is the CTC threshold for a "Dream Offer" in campus placement drives?

When students ask peers or seniors on WhatsApp or Telegram, they frequently receive outdated, informal, or conflicting answers.

**The AI Campus Assistant** serves as an authoritative, retrieval-grounded interface that delivers **instant, verifiable answers backed by explicit circular citations**. To maintain absolute institutional trust, the assistant adheres to a strict safety constraint: **if an answer cannot be grounded in approved campus documents, it must safely refuse and direct the student to the appropriate administrative office.**

---

## 2. Approved Knowledge Sources

The assistant's retrieval store is restricted exclusively to approved, accessible institutional records:

1. **Academic Affairs Circulars**: Attendance mandates, examination conduct rules, admit card policies.
2. **Dean R&D Guidelines**: Undergraduate summer research projects, faculty mentorship credits.
3. **Chief Warden Office Notifications**: Hostel repair procedures, room inspection hours, quiet hours.
4. **Student Mess Committee Manual**: Meal timings, mess rebate submission windows, diet committee contacts.
5. **Training & Placement Office (TPO) Manual**: Campus drive eligibility, backlog restrictions, offer tiers.
6. **Central Library Regulations**: Opening hours, reading room rules, borrowing limits, overdue policies.
7. **IT Services Cell Notices**: 802.1X Wi-Fi authentication instructions, MAC registration, IT cell room numbers.
8. **Student Affairs Contact Directory**: Medical emergency lines, campus health center on-call numbers, security gate contacts.

_Private student records, individual grades, fee transaction histories, and confidential faculty communications are strictly excluded from ingestion._

---

## 3. System Architecture & RAG Pipeline

```
+----------------------------------------------------------------------------------------------------+
|                                     CAMPUSONE RAG PIPELINE                                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [Student User Prompt] ---> [/api/assistant/chat]                                                  |
|                                     |                                                              |
|                                     v                                                              |
|                       +---------------------------+                                                |
|                       | Prompt Injection Detector | -- (Matches jailbreak/DAN/exfiltration)        |
|                       +---------------------------+       |                                        |
|                                     |                     v                                        |
|                                     | Safe                [Instant Safe Refusal Response]          |
|                                     v                                                              |
|                       +---------------------------+                                                |
|                       | Tokenizer & Stopword Purge|                                                |
|                       +---------------------------+                                                |
|                                     |                                                              |
|                                     v                                                              |
|                       +---------------------------+                                                |
|                       | Grounded Retrieval Engine | <--- [APPROVED_CAMPUS_KNOWLEDGE Base]          |
|                       +---------------------------+                                                |
|                                     |                                                              |
|                         Score >= 0.20 Threshold?                                                   |
|                                    / \                                                             |
|                            Yes    /   \   No Match                                                 |
|                                  /     \                                                           |
|                                 v       v                                                          |
|               +-----------------------+   +------------------------------------+                   |
|               | Grounded Synthesis    |   | Verified Refusal & Office Fallback |                   |
|               | + Official Citations  |   | (Points to Academic / Warden email)|                   |
|               +-----------------------+   +------------------------------------+                   |
|                                 |                       |                                          |
|                                 +-----------+-----------+                                          |
|                                             |                                                      |
|                                             v                                                      |
|                             [JSON Response to Client UI]                                           |
|                             - Answer Markdown text                                                 |
|                             - Verified Citation Badges                                             |
|                             - Response Latency (ms)                                                |
|                             - Thumbs Up/Down Feedback Hooks                                        |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Safety, Security & Prompt Injection Defense

### Adversarial Prompt Injection Defense

Language model assistants deployed in student environments are susceptible to jailbreak attempts (e.g. DAN mode, instructions to ignore rules, or attempts to harvest environment variables).

The assistant implements regex-based input filtering (`detectPromptInjection` in `lib/ai-assistant.ts`) targeting known adversarial patterns:

- Attempts to override directives (`/ignore\s+.*instructions/i`)
- System prompt extraction (`/reveal\s+.*system\s+prompt|developer/i`)
- Jailbreak triggers (`/jailbreak/i`, `/dan\s+mode/i`, `/developer\s+mode/i`)
- Unauthorized administrative action (`/grant\s+me\s+admin/i`, `/change\s+my\s+attendance/i`)

When triggered, the assistant immediately returns an immutable refusal without passing the prompt downstream:

> _"I cannot comply with that request. I am the CampusOne AI Assistant designed strictly to provide verified, official IIIT Ranchi campus guidelines and academic circulars."_

### Untrusted Document Content Isolation

Retrieved chunk text is treated as structured knowledge rather than executable instructions. The synthesis template wraps retrieved material in structured quotation blocks, preventing indirect prompt injection from compromised circular text.

---

## 5. User Experience Design

The assistant interface (`app/assistant/page.tsx`) incorporates modern conversational UX patterns:

1. **Interactive Prompt Chips**: Pre-configured query buttons ("What is the exam policy?", "How to lodge hostel repairs?") reduce cold-start friction.
2. **Grounded Source Badges**: Every response renders clickable document reference chips detailing the issuing body and document circular number.
3. **Latency & Confidence Telemetry**: Each response displays the exact execution latency in milliseconds and the retrieval confidence score.
4. **Active Feedback Loop**: Binary rating buttons (Thumbs Up / Thumbs Down) allow students to rate answer utility, logging feedback for continuous model tuning.
5. **Transparent Fallback**: When an inquiry cannot be answered with verified evidence, the assistant admits uncertainty and displays direct email addresses for the relevant campus department.
