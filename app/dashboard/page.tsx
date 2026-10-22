"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Plus, Users, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { UserProfile } from "@/components/user-profile"
import { DashboardEventList } from "@/components/dashboard-event-list"
import {
  fetchUserRegistrations,
  cancelRegistration,
  deleteEvent,
  supabase,
  type RegistrationType,
  type EventType,
} from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [registrations, setRegistrations] = useState<RegistrationType[]>([])
  const [createdEvents, setCreatedEvents] = useState<EventType[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const loadDashboardData = async (userId: string) => {
    setLoadingData(true)
    try {
      const [regs, createdRes] = await Promise.all([
        fetchUserRegistrations(userId),
        supabase.from("events").select("*").eq("user_id", userId),
      ])

      setRegistrations(regs || [])
      setCreatedEvents((createdRes.data as EventType[]) || [])
    } catch (err) {
      console.error("Dashboard data load error:", err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?next=/dashboard")
      } else {
        loadDashboardData(user.id)
      }
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
  const now = Date.now()
  const totalRegistered = registrations.length
  const upcomingRegistered = registrations.filter(
    (r) => r.event && new Date(r.event.date).getTime() >= now
  ).length
  const attendedOrPast = registrations.filter(
    (r) => r.event && new Date(r.event.date).getTime() < now
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

      {/* Tabs for Registrations & Created Events */}
      <div className="mt-8">
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="mb-6 bg-muted/60 p-1 rounded-lg">
            <TabsTrigger value="registrations" className="text-xs font-semibold">
              My Registrations ({totalRegistered})
            </TabsTrigger>
            <TabsTrigger value="created" className="text-xs font-semibold">
              Events Created ({totalCreated})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs font-semibold">
              Campus Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations">
            <DashboardEventList
              registrations={registrations}
              mode="registrations"
              onCancelRegistration={handleCancelRegistration}
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
        </Tabs>
      </div>
    </div>
  )
}
