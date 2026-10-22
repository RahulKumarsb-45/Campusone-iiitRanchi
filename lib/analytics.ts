import { supabase, type EventType, type RegistrationType, type HostelComplaintType } from "./supabase.ts"

export type AnalyticsSummary = {
  totalUsers: number
  activeRegistrations: number
  totalEventsPublished: number
  totalComplaintsLogged: number
  categoryDistribution: { name: string; value: number }[]
  monthlyTrends: { name: string; value: number }[]
  complaintStats: {
    total: number
    resolved: number
    open: number
    inProgress: number
    rejected: number
    resolutionRate: number
  }
  conversionRates: {
    overallCapacityFillRate: number
    averageRegistrationsPerEvent: number
  }
  isDemoMode: boolean
}

/**
 * Pure function: Calculates event capacity fill / conversion rate
 * Prevents divide-by-zero, bounds between 0% and 100%
 */
export function calculateConversionRate(registrationsCount: number, totalCapacity: number): number {
  if (totalCapacity <= 0 || registrationsCount < 0) return 0
  const rate = (registrationsCount / totalCapacity) * 100
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1))
}

/**
 * Pure function: Calculates event distribution by category
 */
export function calculateParticipationByCategory(
  events: EventType[]
): { name: string; value: number }[] {
  if (!events || events.length === 0) return []

  const counts: Record<string, number> = {}
  for (const ev of events) {
    const cat = ev.category ? ev.category.charAt(0).toUpperCase() + ev.category.slice(1) : "Other"
    counts[cat] = (counts[cat] || 0) + (ev.current_participants || 1)
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

/**
 * Pure function: Aggregates registration occurrences into month buckets
 */
export function calculateMonthlyRegistrations(
  registrations: { registration_date: string }[]
): { name: string; value: number }[] {
  if (!registrations || registrations.length === 0) return []

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const counts: Record<string, number> = {}

  for (const r of registrations) {
    if (!r.registration_date) continue
    const d = new Date(r.registration_date)
    if (isNaN(d.getTime())) continue
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`
    counts[key] = (counts[key] || 0) + 1
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

/**
 * Pure function: Calculates hostel complaint resolution metrics
 */
export function calculateHostelResolutionMetrics(
  complaints: HostelComplaintType[]
): {
  total: number
  resolved: number
  open: number
  inProgress: number
  rejected: number
  resolutionRate: number
} {
  const total = complaints.length
  if (total === 0) {
    return { total: 0, resolved: 0, open: 0, inProgress: 0, rejected: 0, resolutionRate: 0 }
  }

  const resolved = complaints.filter((c) => c.status === "Resolved").length
  const open = complaints.filter((c) => c.status === "Open").length
  const inProgress = complaints.filter((c) => c.status === "In Progress").length
  const rejected = complaints.filter((c) => c.status === "Rejected").length
  const resolutionRate = Number(((resolved / total) * 100).toFixed(1))

  return { total, resolved, open, inProgress, rejected, resolutionRate }
}

/**
 * Fetches real production analytics from Supabase
 * If no records exist yet, returns real zeros unless fallback demo data is requested
 */
export async function fetchRealProductAnalytics(useDemoFallback = false): Promise<AnalyticsSummary> {
  try {
    const [eventsRes, regsRes, usersRes, complaintsRes] = await Promise.all([
      supabase.from("events").select("*"),
      supabase.from("registrations").select("id, registration_date, event_id"),
      supabase.from("users").select("id, created_at"),
      supabase.from("hostel_complaints").select("*"),
    ])

    const events = (eventsRes.data as EventType[]) || []
    const registrations = regsRes.data || []
    const usersCount = usersRes.data ? usersRes.data.length : 0
    const complaints = (complaintsRes.data as HostelComplaintType[]) || []

    const hasRealData = events.length > 0 || registrations.length > 0 || complaints.length > 0

    if (!hasRealData && useDemoFallback) {
      // Clearly labeled demo metrics for exhibition/portfolio review when zero records exist in cloud Supabase
      return {
        totalUsers: 142,
        activeRegistrations: 89,
        totalEventsPublished: 12,
        totalComplaintsLogged: 24,
        categoryDistribution: [
          { name: "Seminars", value: 38 },
          { name: "Workshops", value: 45 },
          { name: "Sports", value: 29 },
          { name: "Cultural", value: 20 },
        ],
        monthlyTrends: [
          { name: "May", value: 14 },
          { name: "Jun", value: 22 },
          { name: "Jul", value: 18 },
          { name: "Aug", value: 35 },
          { name: "Sep", value: 42 },
          { name: "Oct", value: 28 },
        ],
        complaintStats: {
          total: 24,
          resolved: 19,
          open: 3,
          inProgress: 2,
          rejected: 0,
          resolutionRate: 79.2,
        },
        conversionRates: {
          overallCapacityFillRate: 64.5,
          averageRegistrationsPerEvent: 7.4,
        },
        isDemoMode: true,
      }
    }

    // Real production metrics calculated from database rows
    const totalCapacity = events.reduce((acc, ev) => acc + (ev.max_participants || 0), 0)
    const totalParticipants = events.reduce((acc, ev) => acc + (ev.current_participants || 0), 0)

    const categoryDistribution = calculateParticipationByCategory(events)
    const monthlyTrends = calculateMonthlyRegistrations(registrations)
    const complaintStats = calculateHostelResolutionMetrics(complaints)

    const overallCapacityFillRate = calculateConversionRate(totalParticipants, totalCapacity)
    const averageRegistrationsPerEvent =
      events.length > 0 ? Number((totalParticipants / events.length).toFixed(1)) : 0

    return {
      totalUsers: usersCount,
      activeRegistrations: registrations.length,
      totalEventsPublished: events.length,
      totalComplaintsLogged: complaints.length,
      categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [],
      monthlyTrends: monthlyTrends.length > 0 ? monthlyTrends : [],
      complaintStats,
      conversionRates: {
        overallCapacityFillRate,
        averageRegistrationsPerEvent,
      },
      isDemoMode: false,
    }
  } catch (err) {
    console.error("fetchRealProductAnalytics error:", err)
    return {
      totalUsers: 0,
      activeRegistrations: 0,
      totalEventsPublished: 0,
      totalComplaintsLogged: 0,
      categoryDistribution: [],
      monthlyTrends: [],
      complaintStats: { total: 0, resolved: 0, open: 0, inProgress: 0, rejected: 0, resolutionRate: 0 },
      conversionRates: { overallCapacityFillRate: 0, averageRegistrationsPerEvent: 0 },
      isDemoMode: false,
    }
  }
}
