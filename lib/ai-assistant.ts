/**
 * CampusOne AI Campus Assistant — Grounded Knowledge Engine & RAG Retrieval
 *
 * Provides verifiable, source-grounded answers for IIIT Ranchi students.
 * Adheres to safety policies: refuses prompt injection, cites approved sources,
 * and falls back safely when information is unverified.
 */

export type KnowledgeChunk = {
  id: string;
  title: string;
  category:
    "Academic" | "Hostel" | "Placements" | "Services" | "Administration";
  source: string;
  lastUpdated: string;
  content: string;
  keywords: string[];
};

export type AssistantResponse = {
  answer: string;
  citations: { id: string; title: string; source: string; category: string }[];
  confidence: number; // 0 to 1
  isRefusal: boolean;
  latencyMs: number;
  suggestedQuestions?: string[];
};

// 1. APPROVED OFFICIAL CAMPUS KNOWLEDGE BASE
export const APPROVED_CAMPUS_KNOWLEDGE: KnowledgeChunk[] = [
  {
    id: "kb-acad-01",
    title: "Mid-Semester & End-Semester Examination Policy",
    category: "Academic",
    source: "Academic Affairs Circular IIITR/ACAD/2025/08",
    lastUpdated: "2025-01-15",
    keywords: [
      "midsem",
      "exam",
      "examination",
      "schedule",
      "admit card",
      "id card",
      "rules",
    ],
    content: `Mid-semester examinations occur in the 8th week of each academic semester. Students must maintain a minimum of 75% attendance in each registered course to be eligible to sit for exams. Institute photo ID cards are strictly mandatory in the examination hall. Electronic devices including mobile phones, programmable calculators, and smartwatches are strictly prohibited.`,
  },
  {
    id: "kb-acad-02",
    title: "Summer Research & Internship Credit Policy",
    category: "Academic",
    source: "Dean R&D Guidelines Memo RND-2024-11",
    lastUpdated: "2024-11-20",
    keywords: [
      "summer",
      "internship",
      "research",
      "credits",
      "faculty",
      "eligibility",
      "stipend",
    ],
    content: `Undergraduate students who have completed their 4th or 6th semester with a CGPA >= 7.0 are eligible to apply for faculty-mentored summer research internships. Projects carry 2 academic credits upon successful completion and submission of an evaluation report verified by the supervising professor. Applications open in March via the academic portal.`,
  },
  {
    id: "kb-hostel-01",
    title: "Hostel Maintenance & Complaint Workflow",
    category: "Hostel",
    source: "Chief Warden Office Notification CWO/HOSTEL/2025/02",
    lastUpdated: "2025-01-10",
    keywords: [
      "hostel",
      "complaint",
      "maintenance",
      "repair",
      "electrical",
      "plumbing",
      "fan",
      "wifi",
      "warden",
    ],
    content: `Hostel residents can lodge maintenance requests for electrical, plumbing, carpentry, and Wi-Fi issues directly through CampusOne under Institute Services > Hostel Complaints. Maintenance staff inspect complaints between 10:00 AM and 5:00 PM on weekdays. Urgent electrical hazards must be reported immediately to the hostel caretaker desk.`,
  },
  {
    id: "kb-hostel-02",
    title: "Hostel Mess Timings & Leave Applications",
    category: "Hostel",
    source: "Student Mess Committee Manual Rev-4",
    lastUpdated: "2024-12-01",
    keywords: [
      "mess",
      "food",
      "breakfast",
      "lunch",
      "dinner",
      "timings",
      "leave",
      "rebate",
    ],
    content: `Mess timings: Breakfast 7:30 AM – 9:15 AM; Lunch 12:15 PM – 2:00 PM; Evening Snacks 5:00 PM – 6:00 PM; Dinner 7:45 PM – 9:30 PM. Mess rebate requires a minimum 3 consecutive days of approved academic or home leave submitted at least 48 hours in advance to the hostel warden office.`,
  },
  {
    id: "kb-place-01",
    title: "Training & Placement Cell Registration & Eligibility",
    category: "Placements",
    source: "TPO Placement Policy Manual 2024-25",
    lastUpdated: "2024-08-15",
    keywords: [
      "placement",
      "tpo",
      "jobs",
      "ctc",
      "eligibility",
      "resume",
      "backlog",
      "drives",
    ],
    content: `Final year B.Tech students register with the TPO in the 7th semester. Students with more than 1 active backlog are ineligible for on-campus drives until backlogs are cleared. Once a student receives an offer with CTC >= 12 LPA, they enter the 'Dream Offer' category and can only apply for 'Super Dream' companies (> 25 LPA). Contact tpo@iiitranchi.ac.in for registration assistance.`,
  },
  {
    id: "kb-serv-01",
    title: "Central Library Access Hours & Borrowing Limits",
    category: "Services",
    source: "Central Library Rulebook 2024",
    lastUpdated: "2024-09-01",
    keywords: [
      "library",
      "books",
      "hours",
      "borrow",
      "reading room",
      "renew",
      "overdue",
    ],
    content: `The Central Library and Reading Hall remain open Monday through Saturday from 8:00 AM to 10:00 PM (extended to 12:00 midnight during examination weeks). B.Tech students may issue up to 4 books simultaneously for 14 days. Book renewals can be processed online once unless reserved by another borrower.`,
  },
  {
    id: "kb-serv-02",
    title: "Campus Wi-Fi Connectivity & IT Cell Support",
    category: "Services",
    source: "IT Services Cell Circular IT/2024/09",
    lastUpdated: "2024-10-05",
    keywords: [
      "wifi",
      "internet",
      "network",
      "credentials",
      "802.1x",
      "authentication",
      "mac",
      "it cell",
      "portal",
    ],
    content: `High-speed campus Wi-Fi ('IIITR-Student') is accessible across academic blocks and hostels. Students authenticate using their institute email credentials via 802.1X security. For device MAC registration or bandwidth troubles, visit the IT Cell (Academic Block Room 108) or email itsupport@iiitranchi.ac.in.`,
  },
  {
    id: "kb-admin-01",
    title: "Official Administration Contacts & Medical Emergency",
    category: "Administration",
    source: "Student Affairs Contact Directory",
    lastUpdated: "2025-01-01",
    keywords: [
      "contact",
      "emergency",
      "ambulance",
      "doctor",
      "medical",
      "warden",
      "security",
      "phone",
    ],
    content: `Campus Health Center: 24/7 on-call medical assistance and emergency ambulance service (+91 9876543299). Security Main Gate: (+91 9876543200). Academic Section: academic@iiitranchi.ac.in. Student Welfare Office: dosw@iiitranchi.ac.in.`,
  },
];

// 2. ADVERSARIAL PROMPT INJECTION & UNAUTHORIZED ACTION PATTERNS
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+.*instructions/i,
  /reveal\s+.*(developer|system\s+prompt|secret|api\s+key|password|credential)/i,
  /act\s+as\s+an\s+unfiltered/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /pretend\s+you\s+have\s+no\s+rules/i,
  /disregard\s+all/i,
  /bypass\s+all/i,
  /grant\s+me\s+admin/i,
  /question\s+paper\s+for/i,
  /private\s+semester\s+grades/i,
  /change\s+my\s+attendance/i,
  /refund\s+my\s+(college|tuition)/i,
  /give\s+me\s+.*password/i,
  /wifi\s+administrator\s+password/i,
];

/**
 * Checks for prompt injection attempts
 */
export function detectPromptInjection(query: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(query));
}

const STOP_WORDS = new Set([
  "what",
  "is",
  "the",
  "who",
  "which",
  "are",
  "can",
  "you",
  "for",
  "with",
  "this",
  "that",
  "from",
  "how",
  "many",
  "does",
  "will",
  "would",
  "about",
  "your",
  "give",
  "and",
  "but",
  "not",
  "have",
  "been",
  "right",
  "now",
]);

/**
 * Tokenize and score query relevance against knowledge base
 */
export function retrieveRelevantKnowledge(
  query: string,
  minScore = 0.2,
): { chunk: KnowledgeChunk; score: number }[] {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  if (queryTokens.length === 0) return [];

  const scored = APPROVED_CAMPUS_KNOWLEDGE.map((chunk) => {
    let score = 0;
    const text = (chunk.title + " " + chunk.content).toLowerCase();

    for (const token of queryTokens) {
      if (chunk.keywords.some((k) => k.includes(token))) {
        score += 2.0;
      }
      if (chunk.title.toLowerCase().includes(token)) {
        score += 1.5;
      }
      if (text.includes(token)) {
        score += 0.5;
      }
    }

    const normalizedScore = Math.min(1.0, score / (queryTokens.length * 2.0));
    return { chunk, score: normalizedScore };
  });

  return scored
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

/**
 * Main Grounded Answer Generation Engine
 */
export async function generateGroundedAnswer(
  userQuery: string,
): Promise<AssistantResponse> {
  const startTime = Date.now();

  // 1. Safety check: Prompt injection
  if (detectPromptInjection(userQuery)) {
    return {
      answer:
        "I cannot comply with that request. I am the CampusOne AI Assistant designed strictly to provide verified, official IIIT Ranchi campus guidelines and academic circulars.",
      citations: [],
      confidence: 1.0,
      isRefusal: true,
      latencyMs: Date.now() - startTime,
    };
  }

  // 2. Retrieve grounded sources
  const relevantItems = retrieveRelevantKnowledge(userQuery);

  // 3. Fallback: If no approved source verifies the query
  if (relevantItems.length === 0) {
    return {
      answer:
        "I could not find an approved official IIIT Ranchi document or circular answering this question. To prevent misinformation, I only provide verified campus information. Please verify with the Academic Section (academic@iiitranchi.ac.in) or Student Affairs (dosw@iiitranchi.ac.in).",
      citations: [],
      confidence: 0,
      isRefusal: true,
      latencyMs: Date.now() - startTime,
      suggestedQuestions: [
        "What are the central library access hours?",
        "How do I lodge a hostel maintenance complaint?",
        "What is the mid-semester examination policy?",
        "What are the TPO placement eligibility rules?",
      ],
    };
  }

  // Top matching document
  const topMatch = relevantItems[0];
  const citations = relevantItems.slice(0, 3).map((item) => ({
    id: item.chunk.id,
    title: item.chunk.title,
    source: item.chunk.source,
    category: item.chunk.category,
  }));

  // Synthesize response based on grounded chunk content
  const answer = `According to **${topMatch.chunk.source}** (${topMatch.chunk.title}):\n\n${topMatch.chunk.content}\n\n*If you require individual exceptions or official sanction, please consult the issuing department.*`;

  return {
    answer,
    citations,
    confidence: Number(topMatch.score.toFixed(2)),
    isRefusal: false,
    latencyMs: Date.now() - startTime,
    suggestedQuestions: [
      "How do I lodge a hostel maintenance complaint?",
      "What are the central library access hours?",
      "What is the summer research credit policy?",
    ],
  };
}
