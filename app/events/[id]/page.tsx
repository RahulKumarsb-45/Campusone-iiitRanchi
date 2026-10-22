"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Share2,
  User,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchEventById,
  checkUserRegistration,
  registerForEvent,
  cancelRegistration,
  deleteEvent,
  type EventType,
} from "@/lib/supabase"

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = Number.parseInt(resolvedParams.id, 10)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [event, setEvent] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isVolunteer, setIsVolunteer] = useState(false)
  const [selectedVolunteerRole, setSelectedVolunteerRole] = useState("")

  useEffect(() => {
    async function loadData() {
      if (isNaN(eventId)) {
        setLoading(false)
        return
      }

      setLoading(true)
      const ev = await fetchEventById(eventId)
      setEvent(ev)

      if (user && ev) {
        const regStatus = await checkUserRegistration(eventId, user.id)
        setIsRegistered(regStatus)
      }

      setLoading(false)
    }

    loadData()
  }, [eventId, user])

  const handleRegisterClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for this event.",
      })
      router.push(`/auth/login?next=/events/${eventId}`)
      return
    }

    if (isRegistered) {
      handleCancelRegistration()
      return
    }

    // Open confirmation dialog
    setShowRegModal(true)
  }

  const handleConfirmRegistration = async () => {
    if (!user || !event) return
    setIsRegistering(true)

    try {
      const res = await registerForEvent(
        eventId,
        user.id,
        isVolunteer,
        isVolunteer ? selectedVolunteerRole : undefined
      )

      if (res.error) {
        toast({
          title: "Registration Failed",
          description: res.error,
          variant: "destructive",
        })
      } else {
        setIsRegistered(true)
        setShowRegModal(false)
        // Refresh event to get updated participant count
        const updated = await fetchEventById(eventId)
        if (updated) setEvent(updated)

        toast({
          title: "Registration Successful!",
          description: `You are now registered for "${event.title}".`,
        })
      }
    } catch (err: any) {
      toast({
        title: "Registration Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!user || !event) return
    setIsRegistering(true)

    try {
      const res = await cancelRegistration(eventId, user.id)
      if (res.error) {
        toast({
          title: "Cancellation Failed",
          description: res.error,
          variant: "destructive",
        })
      } else {
        setIsRegistered(false)
        const updated = await fetchEventById(eventId)
        if (updated) setEvent(updated)

        toast({
          title: "Registration Cancelled",
          description: "Your registration has been successfully cancelled.",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event) return
    try {
      const res = await deleteEvent(event.id)
      if (res.success) {
        toast({
          title: "Event deleted",
          description: "Event has been removed from the platform.",
        })
        router.push("/events")
      } else {
        toast({
          title: "Delete failed",
          description: res.error,
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error deleting event",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const shareEvent = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this event with your peers.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white" />
        <p className="mt-4 text-sm text-muted-foreground">Loading event details...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Event Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The event you are looking for does not exist or may have been removed.
        </p>
        <Button asChild className="mt-6 bg-black text-white hover:bg-neutral-800">
          <Link href="/events">Back to All Events</Link>
        </Button>
      </div>
    )
  }

  const eventDate = new Date(event.date)
  const isFull = event.max_participants > 0 && event.current_participants >= event.max_participants
  const isPast = eventDate.getTime() < Date.now()
  const isCreatorOrAdmin = user && (user.id === event.user_id || user.role === "admin" || user.role === "faculty")

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Navigation & Header Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="self-start gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </Button>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCreatorOrAdmin && (
              <>
                <Button asChild variant="outline" size="sm" className="gap-1.5 border-border">
                  <Link href={`/events/${event.id}/edit`}>
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-950 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={shareEvent} className="gap-1.5 border-border">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Banner Image */}
            <div className="overflow-hidden rounded-2xl border border-border bg-neutral-100 dark:bg-neutral-900 max-h-[420px]">
              <img
                src={event.image || "/placeholder.svg?height=400&width=800"}
                alt={event.title}
                className="w-full h-full object-cover max-h-[420px]"
              />
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs uppercase font-semibold">
                  {event.category}
                </Badge>
                {event.is_paid ? (
                  <Badge className="bg-amber-500 text-black text-xs font-semibold">
                    Paid ₹{event.price}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Free Registration</Badge>
                )}
                {isPast ? (
                  <Badge variant="destructive" className="text-xs">Past Event</Badge>
                ) : isFull ? (
                  <Badge variant="destructive" className="text-xs">Full Capacity</Badge>
                ) : (
                  <Badge className="bg-emerald-600 text-white text-xs">Open for Registration</Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                {event.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Organized by <strong className="text-foreground">{event.organizer}</strong>
              </p>
            </div>

            {/* Description & Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-muted/60 p-1 rounded-lg">
                <TabsTrigger value="about" className="text-xs font-semibold">About Event</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs font-semibold">Timing & Venue</TabsTrigger>
                <TabsTrigger value="organizers" className="text-xs font-semibold">Organizing Team</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="pt-4 space-y-4">
                <div className="prose dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {event.long_description || event.description}
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {event.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-xs text-foreground font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="pt-4 space-y-4">
                <Card className="border-border">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Date</p>
                        <p className="text-xs text-muted-foreground">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Time</p>
                        <p className="text-xs text-muted-foreground">{format(eventDate, "h:mm a")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Location / Venue</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                        {event.address && <p className="text-xs text-muted-foreground mt-0.5">{event.address}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organizers" className="pt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Organizing Entity</p>
                    <p className="text-sm font-bold text-foreground mt-1">{event.organizer}</p>
                  </div>
                  {event.lead_organizer && (
                    <div className="p-4 rounded-xl border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Lead Organizer</p>
                      <p className="text-sm font-bold text-foreground mt-1">{event.lead_organizer}</p>
                    </div>
                  )}
                  {event.convener && (
                    <div className="p-4 rounded-xl border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Convener</p>
                      <p className="text-sm font-bold text-foreground mt-1">{event.convener}</p>
                    </div>
                  )}
                  {event.contact_number && (
                    <div className="p-4 rounded-xl border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Contact Phone</p>
                      <p className="text-sm font-bold text-foreground mt-1">{event.contact_number}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar: Registration Box & Info */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm sticky top-20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Event Registration</CardTitle>
                <CardDescription>
                  {isPast
                    ? "This event has already concluded."
                    : isRegistered
                    ? "You are registered for this event."
                    : "Reserve your seat for this session."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Participation stats */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                    <span>Attendance Spots</span>
                    <span>
                      {event.current_participants} / {event.max_participants || 100} filled
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-black dark:bg-white transition-all"
                      style={{
                        width: `${Math.min(
                          ((event.current_participants || 0) / (event.max_participants || 100)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Price display */}
                {event.is_paid && (
                  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-3 border border-border/80">
                    <p className="text-xs text-muted-foreground">Registration Fee</p>
                    <p className="text-xl font-bold text-foreground">₹{event.price}</p>
                  </div>
                )}

                {/* Registration action */}
                {event.registration_link ? (
                  <Button asChild className="w-full bg-black text-white hover:bg-neutral-800">
                    <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                      Register Externally
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : isPast ? (
                  <Button disabled className="w-full">
                    Event Ended
                  </Button>
                ) : isRegistered ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Registration Confirmed</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleCancelRegistration}
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Cancelling..." : "Cancel My Registration"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleRegisterClick}
                    disabled={isFull || isRegistering}
                    className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
                  >
                    {isFull ? "Event Full" : isRegistering ? "Registering..." : "Register Now"}
                  </Button>
                )}

                {/* Quick Info Points */}
                <div className="pt-3 border-t border-border space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-foreground shrink-0" />
                    <span>{format(eventDate, "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground shrink-0" />
                    <span>{format(eventDate, "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-foreground shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Confirmation Dialog */}
      <Dialog open={showRegModal} onOpenChange={setShowRegModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Confirm your registration for <strong>{event.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border p-3 text-xs space-y-1">
              <p><strong>Participant:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              {user?.roll_number && <p><strong>Roll No:</strong> {user.roll_number}</p>}
              {user?.department && <p><strong>Department:</strong> {user.department}</p>}
            </div>

            {/* Volunteer Option if enabled */}
            {event.needs_volunteers && event.volunteer_roles && event.volunteer_roles.length > 0 && (
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="volunteer-check"
                    checked={isVolunteer}
                    onCheckedChange={(checked) => setIsVolunteer(!!checked)}
                  />
                  <Label htmlFor="volunteer-check" className="text-xs font-semibold cursor-pointer">
                    I would like to volunteer for this event
                  </Label>
                </div>

                {isVolunteer && (
                  <div className="space-y-1.5 pl-6">
                    <Label className="text-xs text-muted-foreground">Select Volunteer Role:</Label>
                    <RadioGroup
                      value={selectedVolunteerRole}
                      onValueChange={setSelectedVolunteerRole}
                      className="space-y-1"
                    >
                      {event.volunteer_roles.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <RadioGroupItem value={role} id={`role-${role}`} />
                          <Label htmlFor={`role-${role}`} className="text-xs cursor-pointer">
                            {role}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRegModal(false)} disabled={isRegistering}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRegistration}
              disabled={isRegistering}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
            >
              {isRegistering ? "Confirming..." : "Confirm & Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Alert */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{event.title}" and remove all registered participant records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
