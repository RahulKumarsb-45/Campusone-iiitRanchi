import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Bell,
  Megaphone,
  PackageSearch,
  ShoppingBag,
  Image as ImageIcon,
  Building2,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/event-card"
import { EventSearch } from "@/components/event-search"
import { HeroSection } from "@/components/hero-section"
import {
  fetchEvents,
  fetchNotices,
  fetchAnnouncements,
  fetchInternships,
  fetchPlacements,
  fetchClubs,
} from "@/lib/supabase"

export const revalidate = 60 // Revalidate this page frequently for fresh data

export default async function HomePage() {
  // Fetch real data from Supabase (with fallbacks if tables are freshly initializing)
  const [
    upcomingEvents,
    recentEvents,
    notices,
    announcements,
    internships,
    placements,
    clubs,
  ] = await Promise.all([
    fetchEvents({ upcoming: true, orderBy: "date", limit: 6 }),
    fetchEvents({ orderBy: "created_at.desc", limit: 6 }),
    fetchNotices("college"),
    fetchAnnouncements(),
    fetchInternships(),
    fetchPlacements(),
    fetchClubs(),
  ])

  const featuredEvent = upcomingEvents[0] || recentEvents[0] || null

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      {/* 1. Hero Section */}
      <HeroSection featuredEvent={featuredEvent} />

      {/* 2. Urgent Announcements Strip (if any) */}
      {announcements.length > 0 && (
        <section className="border-b border-border bg-neutral-50 dark:bg-neutral-900/60 py-3">
          <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-6 items-center rounded-full bg-black px-2.5 text-[11px] font-semibold text-white dark:bg-white dark:text-black shrink-0">
                <Megaphone className="mr-1.5 h-3 w-3" />
                Latest Update
              </span>
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                {announcements[0].title} — <span className="text-muted-foreground">{announcements[0].content}</span>
              </p>
            </div>
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs shrink-0 font-semibold text-black dark:text-white">
              <Link href="/campus-services/announcements">
                All Announcements
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* 3. Quick Institute Services Links */}
      <section className="container mx-auto px-4 sm:px-6 py-10 border-b border-border">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Institute Services</h2>
            <p className="text-sm text-muted-foreground">Everyday essentials and student services at IIIT Ranchi</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/institute-services/lost-and-found"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-black/50 dark:hover:border-white/50 transition-all hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mb-3 group-hover:scale-105 transition-transform">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Lost & Found</h3>
              <p className="text-xs text-muted-foreground mt-1">Report or find misplaced items on campus</p>
            </div>
          </Link>

          <Link
            href="/institute-services/marketplace"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-black/50 dark:hover:border-white/50 transition-all hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Campus Marketplace</h3>
              <p className="text-xs text-muted-foreground mt-1">Buy and sell books, cycles, and stationery</p>
            </div>
          </Link>

          <Link
            href="/institute-services/gallery"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-black/50 dark:hover:border-white/50 transition-all hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mb-3 group-hover:scale-105 transition-transform">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Campus Gallery</h3>
              <p className="text-xs text-muted-foreground mt-1">Glimpses of cultural fests, sports, & events</p>
            </div>
          </Link>

          <Link
            href="/institute-services/hostel-notices"
            className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-black/50 dark:hover:border-white/50 transition-all hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Hostel Notices</h3>
              <p className="text-xs text-muted-foreground mt-1">Hostel circulars, mess menu, & maintenance</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Events Discovery Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
              <Calendar className="h-3.5 w-3.5" />
              Live Campus Calendar
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Discover Events</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse, filter, and register for workshops, hackathons, and seminars</p>
          </div>
          <EventSearch />
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6 bg-muted/60 p-1 rounded-lg">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs font-semibold">
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs font-semibold">
              Recently Added ({recentEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-60" />
                <h3 className="font-semibold text-lg">No upcoming events scheduled</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Be the first to schedule an event for IIIT Ranchi students and faculty.
                </p>
                <Button asChild className="mt-4 bg-black text-white hover:bg-neutral-800">
                  <Link href="/events/create">Create New Event</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {recentEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground text-sm">No recent events recorded yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-10 flex justify-center">
          <Button asChild className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
            <Link href="/events">
              View All Campus Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 5. Dual Section: College Notices & Career Opportunities */}
      <section className="border-t border-border bg-neutral-50/50 dark:bg-neutral-950/40 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Notices Column */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Official College Notices</h3>
                    <p className="text-xs text-muted-foreground">Academic & administrative circulars</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
                  <Link href="/campus-services/notices">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="p-3.5 rounded-lg border border-border/80 bg-background hover:border-black/30 dark:hover:border-white/30 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {notice.department}
                      </span>
                      <Badge
                        variant={notice.priority === "High" ? "destructive" : "secondary"}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">{notice.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career: Internships & Placements Column */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Internships & Placements</h3>
                    <p className="text-xs text-muted-foreground">Latest recruiting drives for IIIT Ranchi</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
                  <Link href="/campus-services/internships">
                    Explore
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {internships.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg border border-border/80 bg-background flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.company}</span>
                        <Badge variant="outline" className="text-[10px]">{item.role_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{item.title}</p>
                      <p className="text-xs font-semibold text-black dark:text-white mt-1">Stipend: {item.stipend}</p>
                    </div>
                    {item.apply_link && (
                      <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
                        <a href={item.apply_link} target="_blank" rel="noopener noreferrer">
                          Apply <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}

                {placements.slice(0, 1).map((item) => (
                  <div key={item.id} className="p-3.5 rounded-lg border border-border/80 bg-background flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.company}</span>
                        <Badge className="bg-black text-white text-[10px]">Placement Drive</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{item.role}</p>
                      <p className="text-xs font-semibold text-black dark:text-white mt-1">Package: {item.ctc}</p>
                    </div>
                    {item.apply_link && (
                      <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
                        <a href={item.apply_link} target="_blank" rel="noopener noreferrer">
                          Apply <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Clubs Preview Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
              <Users className="h-3.5 w-3.5" />
              Student Life & Societies
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Campus Clubs</h2>
            <p className="text-sm text-muted-foreground mt-1">Explore student-led technical, cultural, and sports societies</p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto border-border">
            <Link href="/clubs">
              View All Clubs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.slice(0, 3).map((club) => (
            <div key={club.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={club.image}
                  alt={club.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{club.category}</Badge>
                  <span className="text-xs font-semibold text-muted-foreground">{club.code}</span>
                </div>
                <h3 className="font-bold text-base text-foreground">{club.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{club.description}</p>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Lead: <strong>{club.lead_name}</strong></span>
                  <Link href={`/clubs#club-${club.id}`} className="font-semibold text-black dark:text-white hover:underline">
                    Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
