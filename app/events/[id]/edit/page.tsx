"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Users, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchEventById, updateEvent, isStaffOrAdmin, type EventType } from "@/lib/supabase"

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = Number.parseInt(resolvedParams.id, 10)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [needsVolunteers, setNeedsVolunteers] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "workshops",
    otherCategoryDetails: "",
    date: "",
    time: "",
    location: "",
    address: "",
    organizer: "",
    leadOrganizer: "",
    convener: "",
    coordinator: "",
    contactNumber: "",
    registrationLink: "",
    price: 0,
    tags: "" as string,
    maxParticipants: 100,
    image: "",
    volunteerRoles: [""] as string[],
  })

  useEffect(() => {
    async function load() {
      if (authLoading) return

      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to edit events.",
        })
        router.push(`/auth/login?next=/events/${eventId}/edit`)
        return
      }

      if (isNaN(eventId)) {
        setLoading(false)
        return
      }

      const ev = await fetchEventById(eventId)
      if (!ev) {
        toast({
          title: "Event not found",
          variant: "destructive",
        })
        router.push("/events")
        return
      }

      // Check authorization: must be creator or admin/faculty
      const isCreator = ev.user_id === user.id
      const isPrivileged = isStaffOrAdmin(user.role)

      if (!isCreator && !isPrivileged) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to edit this event.",
          variant: "destructive",
        })
        router.push(`/events/${eventId}`)
        return
      }

      const d = new Date(ev.date)
      const dateStr = d.toISOString().split("T")[0]
      const timeStr = d.toTimeString().split(" ")[0].substring(0, 5)

      setIsPaid(ev.is_paid || false)
      setNeedsVolunteers(ev.needs_volunteers || false)

      setForm({
        title: ev.title || "",
        description: ev.description || "",
        longDescription: ev.long_description || "",
        category: ev.category || "workshops",
        otherCategoryDetails: ev.other_category_details || "",
        date: dateStr,
        time: timeStr,
        location: ev.location || "",
        address: ev.address || "",
        organizer: ev.organizer || "",
        leadOrganizer: ev.lead_organizer || "",
        convener: ev.convener || "",
        coordinator: ev.coordinator || "",
        contactNumber: ev.contact_number || "",
        registrationLink: ev.registration_link || "",
        price: ev.price || 0,
        tags: ev.tags ? ev.tags.join(", ") : "",
        maxParticipants: ev.max_participants || 100,
        image: ev.image || "",
        volunteerRoles: ev.volunteer_roles && ev.volunteer_roles.length > 0 ? ev.volunteer_roles : [""],
      })

      setLoading(false)
    }

    load()
  }, [eventId, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const dateTime = new Date(`${form.date}T${form.time}`)

      const updates: Partial<EventType> = {
        title: form.title,
        description: form.description,
        long_description: form.longDescription,
        category: form.category,
        other_category_details: form.otherCategoryDetails,
        date: dateTime.toISOString(),
        location: form.location,
        address: form.address,
        organizer: form.organizer,
        lead_organizer: form.leadOrganizer,
        convener: form.convener,
        coordinator: form.coordinator,
        contact_number: form.contactNumber,
        registration_link: form.registrationLink,
        is_paid: isPaid,
        price: isPaid ? form.price : 0,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        max_participants: form.maxParticipants,
        needs_volunteers: needsVolunteers,
        volunteer_roles: needsVolunteers ? form.volunteerRoles.filter((r) => r.trim() !== "") : [],
      }

      if (form.image.trim()) {
        updates.image = form.image.trim()
      }

      const res = await updateEvent(eventId, updates)
      if (!res) {
        throw new Error("Failed to update event")
      }

      toast({
        title: "Event updated",
        description: "Your changes have been saved successfully.",
      })

      router.push(`/events/${eventId}`)
    } catch (err: any) {
      toast({
        title: "Error updating event",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white" />
        <p className="mt-4 text-sm text-muted-foreground">Loading event...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground">
        <Link href={`/events/${eventId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Edit Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Update event information, schedule, and volunteer requirements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Primary details about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshops">Workshops</SelectItem>
                    <SelectItem value="seminars">Seminars</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Short Description *</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDesc">Detailed Description</Label>
              <Textarea
                id="longDesc"
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={5}
                placeholder="Full agenda, eligibility, rules, etc."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loc">Location / Venue *</Label>
                <Input
                  id="loc"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cap">Maximum Capacity</Label>
                <Input
                  id="cap"
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: Number.parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tech, ai, coding, competition"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="img">Image URL</Label>
              <Input
                id="img"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Organizer Details</CardTitle>
            <CardDescription>Department, lead contact, and external links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org">Organizing Department / Club *</Label>
                <Input
                  id="org"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead">Lead Organizer</Label>
                <Input
                  id="lead"
                  value={form.leadOrganizer}
                  onChange={(e) => setForm({ ...form, leadOrganizer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conv">Convener</Label>
                <Input
                  id="conv"
                  value={form.convener}
                  onChange={(e) => setForm({ ...form, convener: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href={`/events/${eventId}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold gap-1.5"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
