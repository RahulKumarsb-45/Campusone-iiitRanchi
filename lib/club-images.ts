/**
 * CampusOne IIIT Ranchi: Club Image Resolution System
 * 
 * Accurately maps college clubs to relevant, verified high-resolution images based on
 * their real activities (e.g. Photography, Fine Arts, Sports, Robotics, Music, Startups)
 * rather than displaying a duplicate generic coding laptop image everywhere.
 */

export const CLUB_IMAGES = {
  // Photography, Videography & Media (e.g. Piccell Club)
  photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
  
  // Art, Sketching, Painting & Fine Arts (e.g. Kriti Club)
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",

  // Sports & Athletics
  sportsGeneral: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
  football: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80",

  // Literary, Poetry, Debating & MUN
  literary: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1000&q=80",

  // Cultural, Music & Dance
  culturalGeneral: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
  dance: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
  drama: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1000&q=80",

  // Robotics, IoT, Hardware & Electronics
  robotics: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",

  // Coding, Software & Open-Source (e.g. House of Geeks)
  coding: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",

  // Entrepreneurship, Startups & Ventures (e.g. E-Cell)
  entrepreneurship: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80",

  // Social Work, Community, Volunteering & NSS
  socialWork: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1000&q=80",
};

/**
 * Checks whether an image URL is the legacy duplicate generic laptop image or a placeholder
 */
export function isGenericPlaceholderImage(url?: string): boolean {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "/placeholder.svg" || trimmed.includes("placeholder.svg")) {
    return true;
  }
  // The duplicate laptop image that was previously copied to all clubs:
  if (trimmed.includes("photo-1517694712202-14dd9538aa97")) {
    return true;
  }
  return false;
}

/**
 * Resolves a tailored, high-resolution image for a club based on its name,
 * description, code, tags, and category.
 *
 * Specific activities take precedence over general categories (e.g. Piccell Club is
 * identified as Photography even if categorized under 'Social').
 */
export function getFallbackClubImage(
  name = "",
  description = "",
  category = "",
  code = "",
  tags: string[] = []
): string {
  const text = `${name} ${description} ${code} ${tags.join(" ")}`.toLowerCase();

  // Word-boundary helper to prevent accidental substring collisions
  // (e.g. "community" containing "mun" or "smart/start" containing "art")
  const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, "i").test(text);

  // 1. Photography, Videography, Camera, Media (e.g. Piccell)
  if (
    text.includes("piccell") ||
    text.includes("photo") ||
    text.includes("photography") ||
    text.includes("videograph") ||
    text.includes("camera") ||
    text.includes("dslr") ||
    text.includes("cinematograph") ||
    text.includes("film") ||
    text.includes("media coverage")
  ) {
    return CLUB_IMAGES.photography;
  }

  // 2. Art, Sketching, Painting, Drawing (e.g. Kriti)
  if (
    text.includes("kriti") ||
    hasWord("art") ||
    hasWord("arts") ||
    text.includes("fine art") ||
    text.includes("sketch") ||
    text.includes("paint") ||
    text.includes("drawing") ||
    text.includes("canvas") ||
    text.includes("calligraphy") ||
    text.includes("illustration")
  ) {
    return CLUB_IMAGES.art;
  }

  // 3. Cricket specific
  if (text.includes("cricket") || text.includes("wicket")) {
    return CLUB_IMAGES.cricket;
  }

  // 4. Football / Soccer specific
  if (text.includes("football") || text.includes("soccer")) {
    return CLUB_IMAGES.football;
  }

  // 5. Sports & Athletics (Badminton, Basketball, Athletics, Fitness, Sports Society)
  if (
    category.toLowerCase() === "sports" ||
    text.includes("sport") ||
    text.includes("athletic") ||
    text.includes("badminton") ||
    text.includes("volleyball") ||
    text.includes("basketball") ||
    text.includes("fitness") ||
    text.includes("tournament")
  ) {
    return CLUB_IMAGES.sportsGeneral;
  }

  // 6. Literary, Debating, MUN, Poetry, Writing
  if (
    category.toLowerCase() === "literary" ||
    text.includes("literary") ||
    text.includes("literature") ||
    text.includes("debate") ||
    text.includes("debating") ||
    text.includes("poetry") ||
    text.includes("poet") ||
    text.includes("creative writing") ||
    hasWord("writing") ||
    hasWord("author") ||
    hasWord("book") ||
    hasWord("books") ||
    text.includes("reading") ||
    hasWord("mun") ||
    text.includes("model united nations") ||
    text.includes("model un") ||
    text.includes("quiz") ||
    text.includes("oratory")
  ) {
    return CLUB_IMAGES.literary;
  }

  // 7. Dance specific
  if (text.includes("dance") || text.includes("choreograph")) {
    return CLUB_IMAGES.dance;
  }

  // 8. Music specific
  if (
    text.includes("music") ||
    text.includes("band") ||
    text.includes("vocal") ||
    text.includes("singing") ||
    text.includes("instrumental") ||
    text.includes("guitar")
  ) {
    return CLUB_IMAGES.music;
  }

  // 9. Drama / Theatre specific
  if (
    text.includes("drama") ||
    text.includes("theatre") ||
    text.includes("theater") ||
    text.includes("acting") ||
    text.includes("nukkad") ||
    text.includes("play")
  ) {
    return CLUB_IMAGES.drama;
  }

  // 10. Robotics, IoT, Hardware, Embedded (e.g. ROBO Club)
  if (
    text.includes("robot") ||
    text.includes("iot") ||
    text.includes("hardware") ||
    text.includes("embedded") ||
    text.includes("circuit") ||
    text.includes("electronics") ||
    text.includes("arduino") ||
    text.includes("drone")
  ) {
    return CLUB_IMAGES.robotics;
  }

  // 11. Entrepreneurship, Startups, Ventures (e.g. E-Cell)
  if (
    text.includes("ecell") ||
    text.includes("e-cell") ||
    text.includes("entrepreneur") ||
    text.includes("startup") ||
    text.includes("incubat") ||
    text.includes("venture") ||
    text.includes("pitch")
  ) {
    return CLUB_IMAGES.entrepreneurship;
  }

  // 12. Coding, Software Development, Algorithms (e.g. House of Geeks)
  if (
    category.toLowerCase() === "technical" ||
    text.includes("coding") ||
    text.includes("programming") ||
    text.includes("developer") ||
    text.includes("hackathon") ||
    text.includes("open-source") ||
    text.includes("house of geeks") ||
    text.includes("hog") ||
    text.includes("algorithm")
  ) {
    return CLUB_IMAGES.coding;
  }

  // 13. Social / Volunteering / Community
  if (
    category.toLowerCase() === "social" ||
    text.includes("social") ||
    text.includes("volunteer") ||
    text.includes("nss") ||
    text.includes("community") ||
    text.includes("ngo")
  ) {
    return CLUB_IMAGES.socialWork;
  }

  // 14. Cultural Society General
  if (category.toLowerCase() === "cultural" || text.includes("cultural") || text.includes("vibrance")) {
    return CLUB_IMAGES.culturalGeneral;
  }

  // Default fallback
  return CLUB_IMAGES.coding;
}

/**
 * Main resolver function used across club cards and modals.
 * Returns the club's custom image if present and valid; otherwise returns
 * the intelligently determined fallback.
 */
export function getClubImage(club: {
  name?: string;
  code?: string;
  category?: string;
  description?: string;
  tags?: string[];
  image?: string;
}): string {
  if (!club) return CLUB_IMAGES.coding;

  const rawImage = club.image?.trim();

  // If a valid custom image exists that isn't the legacy duplicate generic laptop image, use it:
  if (rawImage && !isGenericPlaceholderImage(rawImage)) {
    return rawImage;
  }

  // Otherwise, compute the appropriate domain image for this club:
  return getFallbackClubImage(
    club.name || "",
    club.description || "",
    club.category || "",
    club.code || "",
    club.tags || []
  );
}
