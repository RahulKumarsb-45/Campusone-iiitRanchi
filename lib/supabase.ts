import { createClient } from "@supabase/supabase-js";
import {
  getClubImage,
  getFallbackClubImage,
  isGenericPlaceholderImage,
  CLUB_IMAGES,
} from "./club-images.ts";
import {
  getEventImage,
  getFallbackEventImage,
  isGenericEventPlaceholder,
  EVENT_IMAGES,
} from "./event-images.ts";

export {
  getClubImage,
  getFallbackClubImage,
  isGenericPlaceholderImage,
  CLUB_IMAGES,
  getEventImage,
  getFallbackEventImage,
  isGenericEventPlaceholder,
  EVENT_IMAGES,
};

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    rawUrl.length > 0 &&
    !rawUrl.includes("placeholder-project") &&
    !rawUrl.includes("your-project") &&
    rawKey.length > 0 &&
    !rawKey.includes("placeholder-anon-key") &&
    !rawKey.includes("your-publishable-anon-key")
  );
};

const supabaseUrl = rawUrl || "https://placeholder-project.supabase.co";
const supabaseAnonKey = rawKey || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ================= TYPES =================

export type EventType = {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  image: string;
  date: string;
  end_date?: string;
  location: string;
  address?: string;
  category: string;
  other_category_details?: string;
  tags: string[];
  organizer: string;
  lead_organizer?: string;
  convener?: string;
  coordinator?: string;
  contact_number?: string;
  registration_link?: string;
  is_paid: boolean;
  price?: number;
  max_participants: number;
  current_participants: number;
  created_at: string;
  user_id?: string;
  needs_volunteers: boolean;
  volunteer_roles?: string[];
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  role: "student" | "faculty" | "guest" | "organizer" | "admin";
  department?: string;
  year?: string;
  roll_number?: string;
  position?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
};

export type RegistrationType = {
  id: number;
  event_id: number;
  user_id: string;
  registration_date: string;
  payment_status?: "pending" | "completed";
  payment_id?: string;
  is_volunteer: boolean;
  volunteer_role?: string;
  event?: EventType;
};

export type ClubType = {
  id: number;
  name: string;
  code: string;
  category: "Technical" | "Cultural" | "Sports" | "Literary" | "Social";
  description: string;
  lead_name: string;
  lead_email?: string;
  meeting_info?: string;
  image: string;
  tags: string[];
  created_at?: string;
};

export type InternshipType = {
  id: number;
  title: string;
  company: string;
  role_type: string;
  stipend: string;
  location: string;
  deadline: string;
  eligibility: string;
  description: string;
  apply_link?: string;
  user_id?: string;
  created_at?: string;
};

export type PlacementType = {
  id: number;
  company: string;
  role: string;
  ctc: string;
  eligibility: string;
  drive_date: string;
  location: string;
  description: string;
  apply_link?: string;
  user_id?: string;
  created_at?: string;
};

export type NoticeType = {
  id: number;
  title: string;
  content: string;
  department: string;
  priority: "High" | "Medium" | "Normal";
  notice_type: "college" | "hostel";
  target_audience: string;
  file_url?: string;
  user_id?: string;
  created_at: string;
};

export type AnnouncementType = {
  id: number;
  title: string;
  content: string;
  category: string;
  urgent: boolean;
  user_id?: string;
  created_at: string;
};

export type LostFoundItemType = {
  id: number;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contact: string;
  status: "open" | "claimed" | "resolved";
  image?: string;
  user_id?: string;
  created_at: string;
};

export type MarketplaceItemType = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  contact: string;
  status: "available" | "sold";
  image?: string;
  user_id?: string;
  created_at: string;
};

export type GalleryImageType = {
  id: number;
  title: string;
  description?: string;
  category: string;
  event_name?: string;
  image_url: string;
  user_id?: string;
  created_at: string;
};

export type HostelComplaintType = {
  id: number;
  user_id: string;
  student_name: string;
  student_email: string;
  hostel_block: "Hostel A" | "Hostel B" | "Hostel C" | "Girls Hostel" | "Other";
  room_number: string;
  category:
    | "Electrical"
    | "Plumbing"
    | "Carpentry"
    | "Internet/Wi-Fi"
    | "Cleanliness"
    | "Mess"
    | "Other";
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Rejected";
  rejection_reason?: string;
  resolution_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
};

// ================= EVENTS API =================

export const fallbackEvents: EventType[] = [
  {
    id: 1,
    title: "Tech Innovation Summit 2026",
    description:
      "Join industry leaders to explore cutting-edge technologies, artificial intelligence, and cloud breakthroughs.",
    image: EVENT_IMAGES.seminar,
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    location: "Main Auditorium",
    category: "seminars",
    tags: ["technology", "ai", "innovation"],
    organizer: "Computer Science Department",
    lead_organizer: "Dr. Robert Chen",
    convener: "Prof. Sarah Williams",
    coordinator: "John Smith",
    contact_number: "+91 9876543210",
    is_paid: true,
    price: 299.0,
    max_participants: 150,
    current_participants: 45,
    needs_volunteers: true,
    volunteer_roles: ["Registration Desk", "Technical Support", "Hall Coordinator"],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Annual Sports Tournament",
    description:
      "Compete in football, basketball, cricket, and athletics to win university championships.",
    image: EVENT_IMAGES.sports,
    date: new Date(Date.now() + 10 * 86400000).toISOString(),
    location: "University Sports Complex",
    category: "sports",
    tags: ["sports", "fitness", "athletics"],
    organizer: "Sports Committee",
    lead_organizer: "Coach Michael Davis",
    convener: "Prof. David Lee",
    coordinator: "Emily Green",
    contact_number: "+91 9876543211",
    is_paid: false,
    price: 0,
    max_participants: 200,
    current_participants: 78,
    needs_volunteers: true,
    volunteer_roles: ["First Aid", "Scorekeeper", "Event Guide"],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Full-Stack Web Development Workshop",
    description:
      "Hands-on masterclass building production applications with modern React, Next.js, and TypeScript.",
    image: EVENT_IMAGES.workshop,
    date: new Date(Date.now() + 15 * 86400000).toISOString(),
    location: "Computer Lab 101",
    category: "workshops",
    tags: ["coding", "nextjs", "webdev"],
    organizer: "Tech Club",
    lead_organizer: "Alex Johnson",
    convener: "Dr. Sarah Williams",
    coordinator: "Kevin Patel",
    contact_number: "+91 9876543212",
    is_paid: true,
    price: 149.0,
    max_participants: 60,
    current_participants: 38,
    needs_volunteers: false,
    volunteer_roles: [],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 4,
    title: "Campus Cultural Fest & Music Night",
    description:
      "Celebrate music, dance, theater, and arts across diverse traditions and student performances.",
    image: EVENT_IMAGES.cultural,
    date: new Date(Date.now() + 20 * 86400000).toISOString(),
    location: "Open Air Amphitheater",
    category: "cultural",
    tags: ["culture", "music", "dance"],
    organizer: "Cultural Committee",
    lead_organizer: "Ananya Roy",
    convener: "Prof. Alan Miller",
    coordinator: "Siddharth Nair",
    contact_number: "+91 9876543213",
    is_paid: false,
    price: 0,
    max_participants: 500,
    current_participants: 180,
    needs_volunteers: true,
    volunteer_roles: ["Stage Management", "Backstage Crew", "Hospitality"],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 5,
    title: "National Campus Hackathon",
    description:
      "36-hour intense hackathon solving real-world challenges with mentorship and cash prizes.",
    image: EVENT_IMAGES.hackathon,
    date: new Date(Date.now() + 25 * 86400000).toISOString(),
    location: "Innovation Hub",
    category: "hackathon",
    tags: ["hackathon", "ai", "startups"],
    organizer: "Developer Student Club",
    lead_organizer: "Priya Sharma",
    convener: "Dr. Robert Chen",
    coordinator: "Vikram Rao",
    contact_number: "+91 9876543214",
    is_paid: false,
    price: 0,
    max_participants: 120,
    current_participants: 95,
    needs_volunteers: true,
    volunteer_roles: ["Mentor Escort", "Hardware Lab Assistant", "Logistics"],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 6,
    title: "AI in Healthcare Seminar",
    description:
      "Exploring computer vision and deep learning applications in disease diagnosis and biomedical engineering.",
    image: EVENT_IMAGES.healthcareAi,
    date: new Date(Date.now() + 30 * 86400000).toISOString(),
    location: "Conference Hall B",
    category: "seminars",
    tags: ["ai", "healthcare", "research"],
    organizer: "Biomedical & CS Department",
    lead_organizer: "Dr. Maya Patel",
    convener: "Prof. Sarah Williams",
    coordinator: "Neha Gupta",
    contact_number: "+91 9876543215",
    is_paid: false,
    price: 0,
    max_participants: 100,
    current_participants: 52,
    needs_volunteers: false,
    volunteer_roles: [],
    created_at: new Date().toISOString(),
  },
];

export async function fetchEvents(options?: {
  category?: string;
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
  upcoming?: boolean;
}): Promise<QueryResult<EventType>> {
  try {
    let query = supabase.from("events").select("*");

    if (options?.category && options.category !== "all") {
      query = query.ilike("category", options.category);
    }

    if (options?.upcoming) {
      query = query.gte("date", new Date().toISOString());
    }

    if (options?.orderBy) {
      if (options.orderBy.includes(".")) {
        const [col, dir] = options.orderBy.split(".");
        const isAsc =
          options.ascending !== undefined
            ? options.ascending
            : dir?.toLowerCase() !== "desc";
        query = query.order(col, { ascending: isAsc });
      } else {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      }
    } else {
      query = query.order("date", { ascending: true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("fetchEvents DB error:", error.message);
      let filtered = [...fallbackEvents];
      if (options?.category && options.category !== "all") {
        filtered = filtered.filter(
          (e) => e.category.toLowerCase() === options.category?.toLowerCase()
        );
      }
      if (options?.upcoming) {
        const now = Date.now();
        filtered = filtered.filter((e) => new Date(e.date).getTime() >= now);
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      const res: QueryResult<EventType> = filtered.map((e) => ({
        ...e,
        image: getEventImage(e),
      }));
      res.error = error.message;
      return res;
    }

    const res: QueryResult<EventType> = (data || []).map((e) => ({
      ...e,
      image: getEventImage(e),
    }));
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchEvents error:", err);
    const res: QueryResult<EventType> = fallbackEvents.map((e) => ({
      ...e,
      image: getEventImage(e),
    }));
    res.error = err?.message || "Failed to fetch events";
    return res;
  }
}

export async function fetchEventById(id: number): Promise<EventType | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const fb = fallbackEvents.find((e) => e.id === id);
      return fb ? { ...fb, image: getEventImage(fb) } : null;
    }

    return {
      ...(data as EventType),
      image: getEventImage(data as EventType),
    };
  } catch (err) {
    console.error("fetchEventById error:", err);
    const fb = fallbackEvents.find((e) => e.id === id);
    return fb ? { ...fb, image: getEventImage(fb) } : null;
  }
}

export async function createEvent(
  event: Omit<EventType, "id" | "created_at" | "current_participants">,
) {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...event,
          current_participants: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error creating event:", error.message);
      throw new Error(error.message);
    }

    return data ? (data[0] as EventType) : null;
  } catch (err: any) {
    console.error("createEvent error:", err.message);
    throw new Error(err.message || "Failed to create event");
  }
}

export async function updateEvent(id: number, updates: Partial<EventType>) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("events")
      .update(safeUpdates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating event:", error.message);
      throw new Error(error.message);
    }

    return data ? (data[0] as EventType) : null;
  } catch (err: any) {
    console.error("updateEvent error:", err.message);
    throw new Error(err.message || "Failed to update event");
  }
}

export async function deleteEvent(id: number) {
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ================= REGISTRATIONS API =================

export async function checkUserRegistration(
  eventId: number,
  userId: string,
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

export async function registerForEvent(
  eventId: number,
  userId: string,
  isVolunteer = false,
  volunteerRole?: string,
) {
  try {
    // 1. Check if already registered
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingReg) {
      return { error: "You are already registered for this event." };
    }

    // 2. Check event capacity limits
    const { data: eventData } = await supabase
      .from("events")
      .select("current_participants, max_participants")
      .eq("id", eventId)
      .single();

    if (
      eventData &&
      eventData.max_participants > 0 &&
      (eventData.current_participants || 0) >= eventData.max_participants
    ) {
      return { error: "This event has reached maximum capacity." };
    }

    // 3. Insert registration
    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          registration_date: new Date().toISOString(),
          is_volunteer: isVolunteer,
          volunteer_role: volunteerRole,
        },
      ])
      .select();

    if (error) {
      return { error: error.message };
    }

    // 3. Increment current participants via secure RPC with fallback
    try {
      const rpcRes = await supabase.rpc("increment_participants", { event_id: eventId });
      if (rpcRes.error) {
        console.warn("increment_participants RPC warning:", rpcRes.error.message);
        const { data: cur } = await supabase
          .from("events")
          .select("current_participants")
          .eq("id", eventId)
          .maybeSingle();
        if (cur) {
          await supabase
            .from("events")
            .update({ current_participants: (cur.current_participants || 0) + 1 })
            .eq("id", eventId);
        }
      }
    } catch (rpcErr: any) {
      console.warn("increment_participants exception:", rpcErr?.message);
    }

    return { data: data ? data[0] : null };
  } catch (err: any) {
    return { error: err.message || "Failed to register" };
  }
}

export async function cancelRegistration(eventId: number, userId: string) {
  try {
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    // Decrement participants count via secure RPC with fallback
    try {
      const rpcRes = await supabase.rpc("decrement_participants", { event_id: eventId });
      if (rpcRes.error) {
        console.warn("decrement_participants RPC warning:", rpcRes.error.message);
        const { data: cur } = await supabase
          .from("events")
          .select("current_participants")
          .eq("id", eventId)
          .maybeSingle();
        if (cur) {
          await supabase
            .from("events")
            .update({ current_participants: Math.max((cur.current_participants || 1) - 1, 0) })
            .eq("id", eventId);
        }
      }
    } catch (rpcErr: any) {
      console.warn("decrement_participants exception:", rpcErr?.message);
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateRegistration(
  id: number,
  updates: Partial<Omit<RegistrationType, "id" | "event_id" | "user_id">> & {
    user_id?: never;
    event_id?: never;
  },
) {
  try {
    const { user_id, event_id, id: _, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("registrations")
      .update(safeUpdates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating registration:", error.message);
      return { error: error.message };
    }
    return { data: data ? (data[0] as RegistrationType) : null };
  } catch (err: any) {
    console.error("updateRegistration error:", err.message);
    return { error: err.message || "Failed to update registration" };
  }
}

export type QueryResult<T> = T[] & {
  error?: string | null;
};

export type RegistrationQueryResult = QueryResult<RegistrationType>;

export async function fetchUserRegistrations(
  userId?: string,
  options?: {
    eventId?: number;
    all?: boolean;
  },
): Promise<RegistrationQueryResult> {
  try {
    let query = supabase
      .from("registrations")
      .select("*, event:events(*)")
      .order("registration_date", { ascending: false });

    if (options?.eventId) {
      query = query.eq("event_id", options.eventId);
    }

    if (!options?.all && userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("fetchUserRegistrations error:", error.message);
      const emptyResult: RegistrationQueryResult = [];
      emptyResult.error = error.message;
      return emptyResult;
    }

    const result: RegistrationQueryResult = (data as RegistrationType[]) || [];
    result.error = null;
    return result;
  } catch (err: any) {
    console.error("fetchUserRegistrations error:", err);
    const emptyResult: RegistrationQueryResult = [];
    emptyResult.error = err?.message || "Failed to fetch registrations";
    return emptyResult;
  }
}

export async function fetchAllRegistrations(): Promise<RegistrationQueryResult> {
  return fetchUserRegistrations(undefined, { all: true });
}

export async function fetchEventRegistrations(
  eventId: number,
): Promise<RegistrationQueryResult> {
  return fetchUserRegistrations(undefined, { eventId, all: true });
}

// ================= USER PROFILE API =================

export function isStaffOrAdmin(role?: string): boolean {
  if (!role) return false;
  return ["admin", "faculty", "organizer"].includes(role.toLowerCase());
}

export function isAdmin(role?: string): boolean {
  if (!role) return false;
  return role.toLowerCase() === "admin";
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserType>,
) {
  try {
    // Defense-in-depth: Never allow client to escalate role or reassign ID
    const {
      role: _discardRole,
      id: _discardId,
      ...safeUpdates
    } = updates as any;

    const { data, error } = await supabase
      .from("users")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error.message);
      return { error: error.message };
    }

    return { data: data as UserType };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= CLUBS API =================

const fallbackClubs: ClubType[] = [
  {
    id: 1,
    name: "House of Geeks",
    code: "HOG",
    category: "Technical",
    description:
      "Official coding, algorithmic programming, and open-source development club of IIIT Ranchi.",
    lead_name: "Rahul Sharma",
    lead_email: "hog@iiitranchi.ac.in",
    meeting_info: "Every Wednesday 6 PM, Computer Lab 2",
    image: CLUB_IMAGES.coding,
    tags: ["coding", "development", "competitive-programming"],
  },
  {
    id: 2,
    name: "Robotics & IoT Club",
    code: "ROBO",
    category: "Technical",
    description:
      "Autonomous robotics, embedded systems, microcontrollers, and hardware innovations.",
    lead_name: "Aarav Patel",
    lead_email: "robotics@iiitranchi.ac.in",
    meeting_info: "Saturdays 3 PM, Innovation Lab",
    image: CLUB_IMAGES.robotics,
    tags: ["robotics", "iot", "hardware"],
  },
  {
    id: 3,
    name: "Vibrance Cultural Society",
    code: "VIBRANCE",
    category: "Cultural",
    description:
      "Fostering music, dramatic arts, dance, and cultural celebrations across campus.",
    lead_name: "Pooja Verma",
    lead_email: "cultural@iiitranchi.ac.in",
    meeting_info: "Tuesdays 5 PM, Open Amphitheater",
    image: CLUB_IMAGES.culturalGeneral,
    tags: ["dance", "music", "drama"],
  },
  {
    id: 4,
    name: "E-Cell IIIT Ranchi",
    code: "ECELL",
    category: "Social",
    description:
      "Entrepreneurship cell empowering students to launch startups, incubate ideas, and build ventures.",
    lead_name: "Ankit Roy",
    lead_email: "ecell@iiitranchi.ac.in",
    meeting_info: "Fridays 4 PM, Seminar Hall",
    image: CLUB_IMAGES.entrepreneurship,
    tags: ["startups", "entrepreneurship", "ventures"],
  },
  {
    id: 5,
    name: "Sports & Athletics Society",
    code: "SPORTS",
    category: "Sports",
    description:
      "Cricket, football, badminton, chess, volleyball, and university athletics championships.",
    lead_name: "Vikram Singh",
    lead_email: "sports@iiitranchi.ac.in",
    meeting_info: "Daily 5:30 PM, Sports Complex",
    image: CLUB_IMAGES.sportsGeneral,
    tags: ["sports", "fitness", "athletics"],
  },
  {
    id: 6,
    name: "Kriti Art & Sketching Club",
    code: "KRITI",
    category: "Cultural",
    description:
      "Drawing, sketching, painting, digital art, exhibitions, and campus creative visual designs.",
    lead_name: "Sneha Roy",
    lead_email: "kriti@iiitranchi.ac.in",
    meeting_info: "Wednesdays 4:30 PM, Art & Design Studio",
    image: CLUB_IMAGES.art,
    tags: ["art", "sketching", "painting", "creativity"],
  },
  {
    id: 7,
    name: "Piccell Photography & Media Society",
    code: "PICCELL",
    category: "Social",
    description:
      "Photography, videography, DSLR filmmaking, photo walks, and official campus event media coverage.",
    lead_name: "Aditya Prakash",
    lead_email: "piccell@iiitranchi.ac.in",
    meeting_info: "Sundays 10 AM, Campus Media Room",
    image: CLUB_IMAGES.photography,
    tags: ["photography", "videography", "media", "camera"],
  },
  {
    id: 8,
    name: "Literary & Debating Society",
    code: "LIT",
    category: "Literary",
    description:
      "Creative writing, poetry slams, parliamentary debates, Model UN, and literary publications.",
    lead_name: "Ishita Sharma",
    lead_email: "literary@iiitranchi.ac.in",
    meeting_info: "Thursdays 5:30 PM, Reading Hall",
    image: CLUB_IMAGES.literary,
    tags: ["literature", "debate", "poetry", "writing"],
  },
];

export async function fetchClubs(category?: string): Promise<QueryResult<ClubType>> {
  try {
    let query = supabase.from("clubs").select("*").order("name");
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("fetchClubs DB error:", error.message);
      const fallbackList: QueryResult<ClubType> = (category && category !== "All"
        ? fallbackClubs.filter((c) => c.category.toLowerCase() === category.toLowerCase())
        : fallbackClubs
      ).map((c) => ({ ...c, image: getClubImage(c) }));
      fallbackList.error = error.message;
      return fallbackList;
    }
    const result: QueryResult<ClubType> = (data || []).map((c) => ({
      ...c,
      image: getClubImage(c),
    }));
    result.error = null;
    return result;
  } catch (err: any) {
    console.error("fetchClubs error:", err);
    const fallbackList: QueryResult<ClubType> = fallbackClubs.map((c) => ({ ...c, image: getClubImage(c) }));
    fallbackList.error = err?.message || "Failed to fetch clubs";
    return fallbackList;
  }
}

export async function createClub(club: Omit<ClubType, "id" | "created_at">) {
  try {
    const cleanCode = club.code.trim().toUpperCase();
    const { data: existing } = await supabase
      .from("clubs")
      .select("id")
      .ilike("code", cleanCode)
      .maybeSingle();

    if (existing) {
      return { error: `Club code "${cleanCode}" is already in use. Please choose a unique code.` };
    }

    const resolvedImage =
      club.image && !isGenericPlaceholderImage(club.image)
        ? club.image.trim()
        : getFallbackClubImage(club.name, club.description, club.category, cleanCode, club.tags);

    const { data, error } = await supabase
      .from("clubs")
      .insert([{ ...club, code: cleanCode, image: resolvedImage }])
      .select()
      .single();
    if (error) return { error: error.message };
    const savedClub = data as ClubType;
    return { data: { ...savedClub, image: getClubImage(savedClub) } };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateClub(id: number, updates: Partial<ClubType>) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;

    if (safeUpdates.code) {
      const cleanCode = safeUpdates.code.trim().toUpperCase();
      safeUpdates.code = cleanCode;

      const { data: existing } = await supabase
        .from("clubs")
        .select("id")
        .ilike("code", cleanCode)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return { error: `Club code "${cleanCode}" is already in use by another club.` };
      }
    }

    if (safeUpdates.image !== undefined) {
      if (safeUpdates.image && !isGenericPlaceholderImage(safeUpdates.image)) {
        safeUpdates.image = safeUpdates.image.trim();
      } else {
        safeUpdates.image = getFallbackClubImage(
          safeUpdates.name || "",
          safeUpdates.description || "",
          safeUpdates.category || "",
          safeUpdates.code || "",
          safeUpdates.tags || []
        );
      }
    }

    const { data, error } = await supabase
      .from("clubs")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message };
    const updated = data as ClubType;
    return { data: { ...updated, image: getClubImage(updated) } };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteClub(id: number) {
  try {
    const { error } = await supabase.from("clubs").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ================= CAMPUS SERVICES: INTERNSHIPS =================

const fallbackInternships: InternshipType[] = [
  {
    id: 1,
    title: "Summer Software Engineer Intern",
    company: "Google India",
    role_type: "Software Engineering",
    stipend: "₹1,25,000 / month",
    location: "Bangalore / Hyderabad",
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    eligibility: "B.Tech CSE/ECE 3rd Year (CGPA 7.5+)",
    description:
      "Work with Google Cloud or Search infrastructure teams building scalable systems in Go/C++.",
    apply_link: "https://careers.google.com",
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    company: "CRED",
    role_type: "Web Development",
    stipend: "₹70,000 / month",
    location: "Bangalore (On-site)",
    deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    eligibility: "B.Tech CSE 2nd & 3rd Year",
    description:
      "Build high-performance React & TypeScript user interfaces with top notch motion design.",
    apply_link: "https://careers.cred.club",
  },
  {
    id: 3,
    title: "Machine Learning Research Intern",
    company: "Microsoft Research",
    role_type: "AI / ML",
    stipend: "₹1,00,000 / month",
    location: "Bangalore / Hybrid",
    deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    eligibility: "Pre-final & Final Year Students",
    description:
      "Conduct research on multi-modal language models and efficient deep learning inference.",
    apply_link: "https://careers.microsoft.com",
  },
];

export async function fetchInternships(): Promise<QueryResult<InternshipType>> {
  try {
    const { data, error } = await supabase
      .from("internships")
      .select("*")
      .order("deadline", { ascending: true });
    if (error) {
      console.warn("fetchInternships DB error:", error.message);
      const empty: QueryResult<InternshipType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<InternshipType> = (data as InternshipType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchInternships error:", err);
    const empty: QueryResult<InternshipType> = [];
    empty.error = err?.message || "Failed to fetch internships";
    return empty;
  }
}

export async function createInternship(
  internship: Omit<InternshipType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("internships")
      .insert([internship])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as InternshipType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateInternship(
  id: number,
  updates: Partial<InternshipType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("internships")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as InternshipType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteInternship(id: number) {
  try {
    const { error } = await supabase.from("internships").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= CAMPUS SERVICES: PLACEMENTS =================

const fallbackPlacements: PlacementType[] = [
  {
    id: 1,
    company: "Atlassian",
    role: "Software Engineer (Graduate)",
    ctc: "₹45 LPA",
    eligibility: "B.Tech CSE/ECE CGPA 8.0+",
    drive_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    location: "Virtual Drive & PPT",
    description:
      "Full-time campus recruitment drive for final year batch. Online assessment followed by technical interviews.",
    apply_link: "https://tpo.iiitranchi.ac.in",
  },
  {
    id: 2,
    company: "Amazon",
    role: "SDE-1",
    ctc: "₹38 LPA",
    eligibility: "B.Tech CSE/ECE with no active backlogs",
    drive_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    location: "IIIT Ranchi Main Campus",
    description:
      "Campus recruitment for graduating engineers. Focus on DSA, System Design, and Leadership Principles.",
    apply_link: "https://tpo.iiitranchi.ac.in",
  },
  {
    id: 3,
    company: "Oracle",
    role: "Member Technical Staff",
    ctc: "₹22 LPA",
    eligibility: "B.Tech CSE/ECE CGPA 7.0+",
    drive_date: new Date(Date.now() + 28 * 86400000).toISOString(),
    location: "Virtual Drive",
    description:
      "Database and cloud infrastructure engineering roles at Oracle India Cloud Center.",
    apply_link: "https://tpo.iiitranchi.ac.in",
  },
];

export async function fetchPlacements(): Promise<QueryResult<PlacementType>> {
  try {
    const { data, error } = await supabase
      .from("placements")
      .select("*")
      .order("drive_date", { ascending: true });
    if (error) {
      console.warn("fetchPlacements DB error:", error.message);
      const empty: QueryResult<PlacementType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<PlacementType> = (data as PlacementType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchPlacements error:", err);
    const empty: QueryResult<PlacementType> = [];
    empty.error = err?.message || "Failed to fetch placements";
    return empty;
  }
}

export async function createPlacement(
  placement: Omit<PlacementType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("placements")
      .insert([placement])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as PlacementType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePlacement(
  id: number,
  updates: Partial<PlacementType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("placements")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as PlacementType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deletePlacement(id: number) {
  try {
    const { error } = await supabase.from("placements").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= NOTICES API (COLLEGE & HOSTEL) =================

const fallbackNotices: NoticeType[] = [
  {
    id: 1,
    title: "Schedule for Mid-Semester Examinations Autumn 2025",
    content:
      "The Mid-Semester Examinations for B.Tech Autumn Semester 2025 will commence from the 2nd week of next month. Students must carry their valid institute ID cards to the examination halls.",
    department: "Academic Affairs",
    priority: "High",
    notice_type: "college",
    target_audience: "All Undergraduates",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Summer Research Internship Application Guidelines",
    content:
      "Eligible undergraduate students seeking faculty-mentored summer research projects should submit their proposals by the end of this month through the academic portal.",
    department: "Dean R&D",
    priority: "Medium",
    notice_type: "college",
    target_audience: "2nd & 3rd Year Students",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Hostel Mess Menu Revision & Maintenance Guidelines",
    content:
      "The revised mess menu approved by the Student Mess Committee is effective from Monday. Hostel residents are requested to ensure all electrical appliances comply with safety regulations.",
    department: "Chief Warden Office",
    priority: "High",
    notice_type: "hostel",
    target_audience: "Hostel Residents",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 4,
    title: "Campus Wi-Fi Maintenance & Certificate Renewal",
    content:
      "Routine maintenance of campus network switches and Wi-Fi access points will take place this Sunday from 2 AM to 5 AM. Internet services may experience brief interruptions.",
    department: "IT Services Cell",
    priority: "Normal",
    notice_type: "college",
    target_audience: "All Students & Staff",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export async function fetchNotices(
  noticeType?: "college" | "hostel",
): Promise<QueryResult<NoticeType>> {
  try {
    let query = supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (noticeType) {
      query = query.eq("notice_type", noticeType);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("fetchNotices DB error:", error.message);
      const empty: QueryResult<NoticeType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<NoticeType> = (data as NoticeType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchNotices error:", err);
    const empty: QueryResult<NoticeType> = [];
    empty.error = err?.message || "Failed to fetch notices";
    return empty;
  }
}

export async function createNotice(
  notice: Omit<NoticeType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("notices")
      .insert([notice])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as NoticeType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateNotice(
  id: number,
  updates: Partial<NoticeType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("notices")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as NoticeType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteNotice(id: number) {
  try {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= ANNOUNCEMENTS API =================

const fallbackAnnouncements: AnnouncementType[] = [
  {
    id: 1,
    title: 'Annual Cultural Fest "Kavach" Dates Announced',
    content:
      "IIIT Ranchi is proud to announce Kavach 2025, taking place over three days next month with music concerts, hackathons, and guest performances!",
    category: "Events",
    urgent: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Convocation Robes & Rehearsal Schedule",
    content:
      "All graduating students are instructed to report to the Main Auditorium at 9:00 AM sharp on Saturday for the mandatory dress rehearsal and robe distribution.",
    category: "Convocation",
    urgent: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export async function fetchAnnouncements(): Promise<QueryResult<AnnouncementType>> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("fetchAnnouncements DB error:", error.message);
      const empty: QueryResult<AnnouncementType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<AnnouncementType> = (data as AnnouncementType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchAnnouncements error:", err);
    const empty: QueryResult<AnnouncementType> = [];
    empty.error = err?.message || "Failed to fetch announcements";
    return empty;
  }
}

export async function createAnnouncement(
  announcement: Omit<AnnouncementType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .insert([announcement])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as AnnouncementType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateAnnouncement(
  id: number,
  updates: Partial<AnnouncementType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("announcements")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as AnnouncementType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= INSTITUTE SERVICES: LOST AND FOUND =================

const fallbackLostFound: LostFoundItemType[] = [
  {
    id: 1,
    type: "lost",
    title: "HP Laptop Charger (65W Type-C)",
    description:
      "Left behind in Computer Lab 3 on the 2nd floor desk during the afternoon lab session.",
    category: "Electronics",
    location: "Computer Lab 3, Academic Block",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    contact: "9876543210 (Rahul)",
    status: "open",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    type: "found",
    title: "Water Bottle (Black Milton Thermosteel)",
    description: "Found near the Library reading table on ground floor.",
    category: "Stationery / Essentials",
    location: "Central Library Reception",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    contact: "Contact Librarian or security desk",
    status: "open",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    type: "lost",
    title: "Student ID Card (CSE 2023 Batch)",
    description: "Blue lanyard with ID card of CS department.",
    category: "Identification",
    location: "Near Basketball Court",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    contact: "9876543211",
    status: "open",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function fetchLostFoundItems(): Promise<QueryResult<LostFoundItemType>> {
  try {
    const { data, error } = await supabase
      .from("lost_found_items")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.warn("fetchLostFoundItems DB error:", error.message);
      const empty: QueryResult<LostFoundItemType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<LostFoundItemType> = (data as LostFoundItemType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchLostFoundItems error:", err);
    const empty: QueryResult<LostFoundItemType> = [];
    empty.error = err?.message || "Failed to fetch lost and found items";
    return empty;
  }
}

export async function createLostFoundItem(
  item: Omit<LostFoundItemType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("lost_found_items")
      .insert([item])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as LostFoundItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateLostFoundStatus(
  id: number,
  status: "open" | "claimed" | "resolved",
) {
  try {
    const { data, error } = await supabase
      .from("lost_found_items")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as LostFoundItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateLostFoundItem(
  id: number,
  updates: Partial<LostFoundItemType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    const { data, error } = await supabase
      .from("lost_found_items")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as LostFoundItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteLostFoundItem(id: number) {
  try {
    const { error } = await supabase
      .from("lost_found_items")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= INSTITUTE SERVICES: MARKETPLACE =================

const fallbackMarketplace: MarketplaceItemType[] = [
  {
    id: 1,
    title: "Standard Engineering Mathematics & DSA Textbooks",
    description:
      "Tanenbaum Computer Networks, Cormen Algorithms (CLRS), and Discrete Math in excellent condition with no markings.",
    price: 650,
    category: "Books & Notes",
    condition: "Like New",
    contact: "WhatsApp: 9876543210",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Hero Sprint Mountain Bicycle (21 Speed)",
    description:
      "Used for 1 year on campus. Front suspension, working dual disc brakes, newly serviced tires.",
    price: 3200,
    category: "Vehicles / Cycles",
    condition: "Good",
    contact: "Call: 9876543215",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Foldable Study Table & Ergonomic Study Chair",
    description:
      "Lightweight wooden folding study table with metal frame, suitable for hostel rooms.",
    price: 950,
    category: "Hostel Essentials",
    condition: "Good",
    contact: "Call: 9876543219",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export async function fetchMarketplaceItems(): Promise<QueryResult<MarketplaceItemType>> {
  try {
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("fetchMarketplaceItems DB error:", error.message);
      const empty: QueryResult<MarketplaceItemType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<MarketplaceItemType> = (data as MarketplaceItemType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchMarketplaceItems error:", err);
    const empty: QueryResult<MarketplaceItemType> = [];
    empty.error = err?.message || "Failed to fetch marketplace items";
    return empty;
  }
}

export async function createMarketplaceItem(
  item: Omit<MarketplaceItemType, "id" | "created_at">,
) {
  try {
    const is_sold = item.status === "sold";
    const { data, error } = await supabase
      .from("marketplace_items")
      .insert([{ ...item, is_sold }])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as MarketplaceItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMarketplaceStatus(
  id: number,
  status: "available" | "sold",
) {
  try {
    const is_sold = status === "sold";
    const { data, error } = await supabase
      .from("marketplace_items")
      .update({ status, is_sold })
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as MarketplaceItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMarketplaceItem(
  id: number,
  updates: Partial<MarketplaceItemType>,
) {
  try {
    const { id: _discardId, created_at: _discardCreated, ...safeUpdates } = updates as any;
    if (safeUpdates.status !== undefined) {
      safeUpdates.is_sold = safeUpdates.status === "sold";
    }
    const { data, error } = await supabase
      .from("marketplace_items")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as MarketplaceItemType };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteMarketplaceItem(id: number) {
  try {
    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= INSTITUTE SERVICES: GALLERY =================

const fallbackGallery: GalleryImageType[] = [
  {
    id: 1,
    title: "Annual Sports Day Opening Ceremony",
    description:
      "Students and faculty marching during the sports championship ceremony.",
    category: "Sports",
    event_name: "Annual Sports Meet",
    image_url:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Hackathon Coding Night",
    description:
      "Teams collaborating overnight at the campus Innovation Center during the 36-hour hackathon.",
    category: "Technical",
    event_name: "Campus Hackathon",
    image_url:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Cultural Night & Music Fest",
    description:
      "Student band performing live on the open-air auditorium stage.",
    category: "Cultural",
    event_name: "Campus Cultural Fest",
    image_url:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 4,
    title: "Tech Innovation Keynote Address",
    description:
      "Distinguished speaker presenting artificial intelligence research insights.",
    category: "Academic",
    event_name: "Tech Innovation Summit",
    image_url:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export async function fetchGalleryImages(): Promise<QueryResult<GalleryImageType>> {
  try {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("fetchGalleryImages DB error:", error.message);
      const empty: QueryResult<GalleryImageType> = [];
      empty.error = error.message;
      return empty;
    }
    const res: QueryResult<GalleryImageType> = (data as GalleryImageType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchGalleryImages error:", err);
    const empty: QueryResult<GalleryImageType> = [];
    empty.error = err?.message || "Failed to fetch gallery images";
    return empty;
  }
}

export async function createGalleryImage(
  image: Omit<GalleryImageType, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("gallery_images")
      .insert([image])
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as GalleryImageType };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ================= INSTITUTE SERVICES: HOSTEL COMPLAINTS =================

const fallbackComplaints: HostelComplaintType[] = [
  {
    id: 1,
    user_id: "demo-user-1",
    student_name: "Rahul Kumar",
    student_email: "rahul.23bcs045@iiitranchi.ac.in",
    hostel_block: "Hostel B",
    room_number: "204",
    category: "Electrical",
    title: "Ceiling fan regulator not working",
    description:
      "The fan operates only on maximum speed (5), regulator knob is unresponsive.",
    status: "In Progress",
    assigned_to: "Campus Maintenance Electrician",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    user_id: "demo-user-1",
    student_name: "Rahul Kumar",
    student_email: "rahul.23bcs045@iiitranchi.ac.in",
    hostel_block: "Hostel B",
    room_number: "204",
    category: "Internet/Wi-Fi",
    title: "Wi-Fi access point flapping on 2nd floor wing B",
    description:
      "Frequent disconnects every 15 minutes during evening study hours.",
    status: "Resolved",
    resolution_notes:
      "AP rebooted and channel 6 interference resolved with IT cell.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function fetchHostelComplaints(options?: {
  userId?: string;
  isStaff?: boolean;
  status?: string;
}): Promise<QueryResult<HostelComplaintType>> {
  try {
    let query = supabase
      .from("hostel_complaints")
      .select("*")
      .order("created_at", { ascending: false });

    // If student (not staff/admin), restrict query to their own user_id
    if (!options?.isStaff && options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    if (options?.status && options.status !== "All") {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("fetchHostelComplaints DB error:", error.message);
      const empty: QueryResult<HostelComplaintType> = [];
      empty.error = error.message;
      return empty;
    }

    const res: QueryResult<HostelComplaintType> = (data as HostelComplaintType[]) || [];
    res.error = null;
    return res;
  } catch (err: any) {
    console.error("fetchHostelComplaints error:", err);
    const empty: QueryResult<HostelComplaintType> = [];
    empty.error = err?.message || "Failed to fetch hostel complaints";
    return empty;
  }
}

export async function createHostelComplaint(
  complaint: Omit<
    HostelComplaintType,
    | "id"
    | "status"
    | "created_at"
    | "updated_at"
    | "rejection_reason"
    | "resolution_notes"
  >,
) {
  try {
    const { data, error } = await supabase
      .from("hostel_complaints")
      .insert([
        {
          ...complaint,
          status: "Open",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("createHostelComplaint DB error:", error.message);
      return { error: error.message };
    }

    return { data: data as HostelComplaintType };
  } catch (err: any) {
    return { error: err.message || "Failed to submit hostel complaint" };
  }
}

export async function updateHostelComplaintStatus(
  id: number,
  status: "Open" | "In Progress" | "Resolved" | "Rejected",
  options?: {
    rejection_reason?: string;
    resolution_notes?: string;
    assigned_to?: string;
  },
) {
  try {
    // Valid status transition validation
    const validStatuses = ["Open", "In Progress", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return { error: `Invalid status: ${status}` };
    }

    const updates: Partial<HostelComplaintType> = {
      status,
      updated_at: new Date().toISOString(),
      ...(options?.rejection_reason
        ? { rejection_reason: options.rejection_reason }
        : {}),
      ...(options?.resolution_notes
        ? { resolution_notes: options.resolution_notes }
        : {}),
      ...(options?.assigned_to ? { assigned_to: options.assigned_to } : {}),
    };

    const { data, error } = await supabase
      .from("hostel_complaints")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as HostelComplaintType };
  } catch (err: any) {
    return { error: err.message || "Failed to update complaint status" };
  }
}

export async function deleteHostelComplaint(id: number) {
  try {
    const { error } = await supabase
      .from("hostel_complaints")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
