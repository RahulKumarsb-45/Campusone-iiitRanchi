/**
 * CampusOne IIIT Ranchi: Event Image Resolution System
 *
 * Provides verified, high-resolution, domain-accurate images for college events:
 * Seminars, Sports, Workshops, Cultural Nights, Hackathons, AI Healthcare,
 * Placement Drives, and Academic Conferences.
 */

export const EVENT_IMAGES = {
  // Keynote, Conference, Summits (e.g. Tech Innovation Summit)
  seminar: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",

  // Hands-on Technical Workshops (e.g. Full-Stack Web Development)
  workshop: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",

  // Athletics, Tournaments, Sports (e.g. Annual Sports Tournament)
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",

  // Cultural Nights, Stage Performances, Music Fests
  cultural: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",

  // Hackathons & Collaborative Programming (e.g. National Campus Hackathon)
  hackathon: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",

  // AI, Medical & Healthcare Seminars (e.g. AI in Healthcare)
  healthcareAi: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
  healthcare: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",

  // Academic Lectures & Research Presentations
  academic: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80",

  // Placement, Career Talks, Industry Connect
  career: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",

  // General Campus Gathering / Networking
  general: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
};

/**
 * Checks whether an image URL is an unstyled placeholder or empty
 */
export function isGenericEventPlaceholder(url?: string): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (
    trimmed === "" ||
    trimmed === "/placeholder.svg" ||
    trimmed.includes("placeholder.svg") ||
    trimmed.includes("via.placeholder.com")
  ) {
    return true;
  }
  return false;
}

/**
 * Deterministically resolves a relevant image based on event title, category, description, and tags
 */
export function getFallbackEventImage(
  category = "",
  title = "",
  description = "",
  tags: string[] = []
): string {
  const text = `${title} ${description} ${category} ${tags.join(" ")}`.toLowerCase();

  // 1. AI in Healthcare or Medical Research
  if (
    (text.includes("health") || text.includes("medical") || text.includes("biomedical") || text.includes("disease")) &&
    (text.includes("ai") || text.includes("vision") || text.includes("learning"))
  ) {
    return EVENT_IMAGES.healthcareAi;
  }

  // 2. Hackathons, Coding Marathons
  if (
    text.includes("hackathon") ||
    text.includes("hack") ||
    text.includes("codefest") ||
    text.includes("36-hour") ||
    text.includes("24-hour")
  ) {
    return EVENT_IMAGES.hackathon;
  }

  // 3. Hands-on Workshops, Web Dev, Programming Labs
  if (
    category.toLowerCase() === "workshops" ||
    category.toLowerCase() === "workshop" ||
    text.includes("workshop") ||
    text.includes("hands-on") ||
    text.includes("masterclass") ||
    text.includes("bootcamp") ||
    text.includes("lab")
  ) {
    return EVENT_IMAGES.workshop;
  }

  // 4. Sports, Tournaments, Athletics, Matches
  if (
    category.toLowerCase() === "sports" ||
    category.toLowerCase() === "sport" ||
    text.includes("sport") ||
    text.includes("tournament") ||
    text.includes("football") ||
    text.includes("cricket") ||
    text.includes("championship") ||
    text.includes("athletics")
  ) {
    return EVENT_IMAGES.sports;
  }

  // 5. Cultural, Music, Dance, Festivals
  if (
    category.toLowerCase() === "cultural" ||
    text.includes("cultural") ||
    text.includes("music") ||
    text.includes("fest") ||
    text.includes("concert") ||
    text.includes("dance") ||
    text.includes("drama")
  ) {
    return EVENT_IMAGES.cultural;
  }

  // 6. Placement Drives, Career, Corporate
  if (
    category.toLowerCase() === "career" ||
    category.toLowerCase() === "placement" ||
    text.includes("placement") ||
    text.includes("internship") ||
    text.includes("recruitment") ||
    text.includes("interview") ||
    text.includes("hiring")
  ) {
    return EVENT_IMAGES.career;
  }

  // 7. Seminars & Summits (e.g. tech summit, keynote seminars)
  if (
    category.toLowerCase() === "seminars" ||
    category.toLowerCase() === "seminar" ||
    text.includes("seminar") ||
    text.includes("summit") ||
    text.includes("keynote") ||
    text.includes("conference") ||
    text.includes("speaker")
  ) {
    return EVENT_IMAGES.seminar;
  }

  // 8. Academic Conferences & Research Lectures
  if (
    category.toLowerCase() === "academic" ||
    text.includes("academic") ||
    text.includes("research") ||
    text.includes("paper") ||
    text.includes("faculty") ||
    text.includes("lecture")
  ) {
    return EVENT_IMAGES.academic;
  }

  return EVENT_IMAGES.general;
}

/**
 * Main Event Image Resolver:
 * - Returns custom valid non-placeholder image if present
 * - Otherwise deterministically selects an activity-relevant image
 */
export function getEventImage(event: {
  image?: string;
  category?: string;
  title?: string;
  description?: string;
  tags?: string[];
}): string {
  if (event.image && !isGenericEventPlaceholder(event.image)) {
    return event.image;
  }
  return getFallbackEventImage(
    event.category || "",
    event.title || "",
    event.description || "",
    event.tags || []
  );
}
