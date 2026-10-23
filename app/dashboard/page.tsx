"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Plus,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Info,
  Wrench,
  Percent,
  Shield,
  FileText,
  Megaphone,
  Briefcase,
  GraduationCap,
  PackageSearch,
  ShoppingBag,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { UserProfile } from "@/components/user-profile"
import { DashboardEventList } from "@/components/dashboard-event-list"
import { DashboardChart } from "@/components/dashboard-chart"
import {
  fetchUserRegistrations,
  cancelRegistration,
  deleteEvent,
  isStaffOrAdmin,
  supabase,
  type RegistrationType,
  type EventType,
} from "@/lib/supabase"
import { fetchRealProductAnalytics, type AnalyticsSummary } from "@/lib/analytics"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [registrations, setRegistrations] = useState<RegistrationType[]>([])
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [createdEvents, setCreatedEvents] = useState<EventType[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [now] = useState(() => Date.now())

  const loadDashboardData = useCallback(async (userId: string) => {
    setLoadingData(true)
    try {
      const [regs, createdRes, analyticsRes] = await Promise.all([
        fetchUserRegistrations(userId),
        supabase.from("events").select("*").eq("user_id", userId),
        fetchRealProductAnalytics(false),
      ])

      if (regs?.error) {
        setRegistrationError(regs.error)
      } else {
        setRegistrationError(null)
      }
      setRegistrations(regs || [])
      setCreatedEvents((createdRes.data as EventType[]) || [])
      setAnalytics(analyticsRes)
    } catch (err) {
      console.error("Dashboard data load error:", err)
    } finally {
      setLoadingData(false)
    }
  }, [])

  const handleToggleDemoMode = async (checked: boolean) => {
    setDemoMode(checked)
    setLoadingAnalytics(true)
    try {
      const data = await fetchRealProductAnalytics(checked)
      setAnalytics(data)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?next=/dashboard")
      } else {
        Promise.all([
          fetchUserRegistrations(user.id),
          supabase.from("events").select("*").eq("user_id", user.id),
          fetchRealProductAnalytics(false),
        ])
          .then(([regs, createdRes, analyticsRes]) => {
            if (!isMounted) return
            if (regs?.error) {
              setRegistrationError(regs.error)
            } else {
              setRegistrationError(null)
            }
            setRegistrations(regs || [])
            setCreatedEvents((createdRes.data as EventType[]) || [])
            setAnalytics(analyticsRes)
            setLoadingData(false)
          })
          .catch((err) => {
            if (!isMounted) return
            console.error("Dashboard data load error:", err)
            setLoadingData(false)
          })
      }
    }
    return () => {
      isMounted = false
    }
  }, [user, authLoading, router])

  const handleCancelRegistration = async (eventId: number) => {
    if (!user) return
    try {
      const res = await cancelRegistration(eventId, user.id)
      if (res.error) {
        toast({
          title: "Cancellation Failed",
          description: res.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registration Cancelled",
          description: "Your registration has been successfully cancelled.",
        })
        loadDashboardData(user.id)
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteCreatedEvent = async (eventId: number) => {
    if (!user) return
    try {
      const res = await deleteEvent(eventId)
      if (res.success) {
        toast({
          title: "Event deleted",
          description: "Event has been removed from CampusOne.",
        })
        loadDashboardData(user.id)
      } else {
        toast({
          title: "Delete failed",
          description: res.error,
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  if (authLoading || (loadingData && !user)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  if (!user) return null

  // Real statistics derived from database records
  const totalRegistered = registrations.length
  const upcomingRegistered = registrations.filter(
    (r) => r.event && new Date(r.event.date).getTime() >= now
  ).length
  const totalCreated = createdEvents.length

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            IIIT Ranchi Student Portal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your registered events, submissions, and campus activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
            <Link href="/events/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Top Grid: User Profile & Quick Real Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <UserProfile user={user} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Real Event Statistics</CardTitle>
              <CardDescription>Live metrics calculated from your database records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-neutral-50/60 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Registered</span>
                    <Calendar className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="text-3xl font-black text-foreground">{totalRegistered}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total registrations</p>
                </div>

                <div className="rounded-xl border border-border bg-neutral-50/60 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
                    <Clock className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="text-3xl font-black text-foreground">{upcomingRegistered}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sessions ahead</p>
                </div>

                <div className="rounded-xl border border-border bg-neutral-50/60 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Created</span>
                    <Users className="h-4 w-4 text-foreground" />
                  </div>
                  <p className="text-3xl font-black text-foreground">{totalCreated}</p>
                  <p className="text-xs text-muted-foreground mt-1">Events hosted by you</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Registrations, Created Events, Activity, and Product Analytics */}
      <div className="mt-8">
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="mb-6 bg-muted/60 p-1 rounded-lg flex flex-wrap">
            <TabsTrigger value="registrations" className="text-xs font-semibold">
              My Registrations ({totalRegistered})
            </TabsTrigger>
            <TabsTrigger value="created" className="text-xs font-semibold">
              Events Created ({totalCreated})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs font-semibold">
              Campus Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-semibold flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Platform Analytics & PM Metrics
            </TabsTrigger>
            {isStaffOrAdmin(user?.role) && (
              <TabsTrigger value="admin" className="text-xs font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Shield className="h-3.5 w-3.5" />
                Admin Management Hub
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="registrations">
            <DashboardEventList
              registrations={registrations}
              mode="registrations"
              onCancelRegistration={handleCancelRegistration}
              errorMessage={registrationError}
              onRetry={() => user && loadDashboardData(user.id)}
            />
          </TabsContent>

          <TabsContent value="created">
            <DashboardEventList
              registrations={[]}
              createdEvents={createdEvents}
              mode="created"
              onDeleteEvent={handleDeleteCreatedEvent}
            />
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Recent Campus Activity</CardTitle>
                <CardDescription>Actions and registrations logged for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {registrations.length === 0 && createdEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent activity recorded yet.</p>
                ) : (
                  <>
                    {registrations.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Registered for <strong>{r.event?.title || "Event"}</strong></span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(r.registration_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {createdEvents.slice(0, 2).map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-xs">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-blue-600" />
                          <span>Published event <strong>{ev.title}</strong></span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(ev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Header and Live / Demo Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/40 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Product Health & Conversion Dashboard</h3>
                  {analytics?.isDemoMode ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      DEMO SIMULATION DATA
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      LIVE DATABASE RECORDS
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Calculated using verified Supabase PostgreSQL records with zero hard-coded assumptions
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="demo-mode-toggle"
                  checked={demoMode}
                  onCheckedChange={handleToggleDemoMode}
                  disabled={loadingAnalytics}
                />
                <Label htmlFor="demo-mode-toggle" className="text-xs font-semibold cursor-pointer">
                  Simulate Demo Cohort Data (140+ Users)
                </Label>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Capacity Fill Rate</span>
                    <Percent className="h-4 w-4 text-blue-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black">
                    {analytics?.conversionRates.overallCapacityFillRate ?? 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-muted-foreground">
                  Registrations vs. total event venue capacity
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Avg Regs / Event</span>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black">
                    {analytics?.conversionRates.averageRegistrationsPerEvent ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-muted-foreground">
                  Mean participant uptake per published event
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Hostel Ticket Resolution</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black">
                    {analytics?.complaintStats.resolutionRate ?? 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-muted-foreground">
                  {analytics?.complaintStats.resolved ?? 0} of {analytics?.complaintStats.total ?? 0} hostel repairs resolved
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Total Active Users</span>
                    <Users className="h-4 w-4 text-amber-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black">
                    {analytics?.totalUsers ?? 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-[11px] text-muted-foreground">
                  Registered accounts with verified auth records
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Event Participation by Category
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribution of attendee registrations across event genres
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardChart
                    type="pie"
                    data={analytics?.categoryDistribution || []}
                    emptyMessage="No category records yet. Create an event to begin tracking."
                  />
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    Monthly Registration Velocity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Volume of student registrations completed by calendar month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardChart
                    type="bar"
                    data={analytics?.monthlyTrends || []}
                    emptyMessage="No monthly registration records recorded yet."
                  />
                </CardContent>
              </Card>
            </div>

            {/* PM Methodology & Metric Integrity Notes */}
            <Card className="border-border bg-neutral-50/40 dark:bg-neutral-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Product Manager Data Integrity & Metric Definitions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <p>
                  <strong>• Registration ≠ Attendance:</strong> An event registration reserves a ticket in PostgreSQL, but physical attendance requires check-in verification at the venue.
                </p>
                <p>
                  <strong>• Registered Account ≠ Active User:</strong> User counts reflect identity records in <code className="bg-muted px-1 rounded">public.users</code>. Engagement is measured via active session tokens and registration timestamps.
                </p>
                <p>
                  <strong>• Empty State Representation:</strong> Zero counts reflect actual database states and are never substituted with fabricated numbers in production mode.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management Hub Tab */}
          {isStaffOrAdmin(user?.role) && (
            <TabsContent value="admin" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-bold text-foreground">University Admin Command Center</h3>
                    <Badge className="bg-blue-600 text-white text-[10px]">Staff / Admin Access</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage records, edit content, moderate listings, and resolve tickets across all 9 CampusOne modules.
                  </p>
                </div>
                <Button asChild size="sm" className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black shrink-0">
                  <Link href="/events/create">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create New Event
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Module 1: Events */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-bold">Campus Events</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Active</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Manage, edit, publish and delete campus workshops, seminars & hackathons
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="text-xs flex-1">
                      <Link href="/events">View Directory</Link>
                    </Button>
                    <Button asChild size="sm" className="text-xs flex-1 bg-black text-white hover:bg-neutral-800">
                      <Link href="/events/create">New Event</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 2: Clubs */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <CardTitle className="text-sm font-bold">Student Clubs</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Active</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Update club leads, verified cover photos, meeting schedules and metadata
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/clubs">Manage Clubs Portal</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 3: Official Notices */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <CardTitle className="text-sm font-bold">Official Notices</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Admin CRUD</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Publish administrative circulars with High / Urgent priority banners
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/campus-services/notices">Manage Notices</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 4: Announcements */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-purple-600" />
                        <CardTitle className="text-sm font-bold">Announcements</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Admin CRUD</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Post department announcements, exam updates, and guest lectures
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/campus-services/announcements">Manage Announcements</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 5: Internships */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-cyan-600" />
                        <CardTitle className="text-sm font-bold">Internship Listings</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">TPO Cell</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Post stipend-bearing industry internships and research opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/campus-services/internships">Manage Internships</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 6: Placements */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-indigo-600" />
                        <CardTitle className="text-sm font-bold">Placement Drives</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">TPO Cell</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Add corporate recruitment drives, CTC packages, criteria, and TPO links
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/campus-services/placements">Manage Placement Drives</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 7: Lost & Found */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageSearch className="h-4 w-4 text-rose-600" />
                        <CardTitle className="text-sm font-bold">Lost & Found</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Moderation</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Review student reports, mark items resolved, or delete improper submissions
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/institute-services/lost-and-found">Moderate Lost & Found</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 8: Campus Marketplace */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-teal-600" />
                        <CardTitle className="text-sm font-bold">Campus Marketplace</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Moderation</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Oversee peer listings for books, cycles, and electronics; mark sold or remove
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/institute-services/marketplace">Moderate Marketplace</Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Module 9: Hostel Maintenance */}
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-orange-600" />
                        <CardTitle className="text-sm font-bold">Hostel Maintenance</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Warden / Staff</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Assign maintenance technicians, update complaint progress and resolve tickets
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs w-full">
                      <Link href="/institute-services/hostel-complaints">Manage Hostel Tickets</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
