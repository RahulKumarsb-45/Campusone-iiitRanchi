"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Users, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createEvent } from "@/lib/supabase"

export default function CreateEventPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isPaid, setIsPaid] = useState(false)
  const [needsVolunteers, setNeedsVolunteers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
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
    tags: [] as string[],
    maxParticipants: 100,
    image: "",
    volunteerRoles: [""],
  })

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create and host events on CampusOne.",
      })
      router.push("/auth/login?next=/events/create")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!eventForm.title || !eventForm.description || !eventForm.category || !eventForm.date || !eventForm.time || !eventForm.location || !eventForm.organizer) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields indicated with an asterisk (*).",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (eventForm.category === "other" && !eventForm.otherCategoryDetails) {
      toast({
        title: "Missing category details",
        description: "Please provide details for the 'Other' category.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const dateTime = new Date(`${eventForm.date}T${eventForm.time}`)

      const newEvent = await createEvent({
        title: eventForm.title,
        description: eventForm.description,
        long_description: eventForm.longDescription || undefined,
        image: eventForm.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
        date: dateTime.toISOString(),
        location: eventForm.location,
        address: eventForm.address || undefined,
        category: eventForm.category,
        other_category_details: eventForm.otherCategoryDetails || undefined,
        tags: eventForm.tags,
        organizer: eventForm.organizer,
        lead_organizer: eventForm.leadOrganizer || undefined,
        convener: eventForm.convener || undefined,
        coordinator: eventForm.coordinator || undefined,
        contact_number: eventForm.contactNumber || undefined,
        registration_link: eventForm.registrationLink || undefined,
        is_paid: isPaid,
        price: isPaid ? eventForm.price : undefined,
        max_participants: eventForm.maxParticipants || 100,
        user_id: user?.id,
        needs_volunteers: needsVolunteers,
        volunteer_roles: needsVolunteers ? eventForm.volunteerRoles.filter((role) => role.trim() !== "") : undefined,
      })

      if (!newEvent) {
        throw new Error("Failed to create event in database")
      }

      toast({
        title: "Event created successfully!",
        description: `"${newEvent.title}" is now published on CampusOne.`,
      })

      router.push(`/events/${newEvent.id}`)
    } catch (error: any) {
      console.error("Error creating event:", error)
      toast({
        title: "Error creating event",
        description: error.message || "An error occurred while creating your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVolunteerRole = () => {
    setEventForm({
      ...eventForm,
      volunteerRoles: [...eventForm.volunteerRoles, ""],
    })
  }

  const updateVolunteerRole = (index: number, value: string) => {
    const updatedRoles = [...eventForm.volunteerRoles]
    updatedRoles[index] = value
    setEventForm({
      ...eventForm,
      volunteerRoles: updatedRoles,
    })
  }

  const removeVolunteerRole = (index: number) => {
    const updatedRoles = [...eventForm.volunteerRoles]
    updatedRoles.splice(index, 1)
    setEventForm({
      ...eventForm,
      volunteerRoles: updatedRoles,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white" />
        <p className="mt-4 text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            IIIT Ranchi Event Host
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Create New Event</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish an upcoming workshop, hackathon, seminar, or competition
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Event title, category, description, and timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. HackIIIT Hackathon 2025"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={eventForm.category}
                  onValueChange={(value) => setEventForm({ ...eventForm, category: value })}
                  required
                >
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

            {eventForm.category === "other" && (
              <div className="space-y-2">
                <Label htmlFor="otherCategoryDetails">
                  Category Details <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherCategoryDetails"
                  placeholder="Specify custom category"
                  value={eventForm.otherCategoryDetails}
                  onChange={(e) => setEventForm({ ...eventForm, otherCategoryDetails: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">
                Short Summary <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="A brief teaser for event cards (1-2 sentences)"
                rows={2}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Detailed Description & Rules</Label>
              <Textarea
                id="longDescription"
                placeholder="Comprehensive agenda, guidelines, eligibility, and prize distribution..."
                rows={4}
                value={eventForm.longDescription}
                onChange={(e) => setEventForm({ ...eventForm, longDescription: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">
                  Venue / Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Auditorium / Lab 2 / Virtual"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants Spot</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="100"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({ ...eventForm, maxParticipants: Number.parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. coding, ai, hackathon"
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Cover Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://... (leave blank for default cover)"
                  value={eventForm.image}
                  onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="paid-event" checked={isPaid} onCheckedChange={setIsPaid} />
              <Label htmlFor="paid-event" className="cursor-pointer font-semibold text-sm">
                This is a paid event (requires registration fee)
              </Label>
            </div>

            {isPaid && (
              <div className="space-y-2 max-w-xs pl-6">
                <Label htmlFor="price">Fee Amount (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="199"
                  value={eventForm.price}
                  onChange={(e) => setEventForm({ ...eventForm, price: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="needs-volunteers" checked={needsVolunteers} onCheckedChange={setNeedsVolunteers} />
              <Label htmlFor="needs-volunteers" className="cursor-pointer font-semibold text-sm">
                Recruit student volunteers for this event
              </Label>
            </div>

            {needsVolunteers && (
              <div className="space-y-3 pl-6">
                <Label className="text-xs text-muted-foreground">Volunteer Roles Needed:</Label>
                {eventForm.volunteerRoles.map((role, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`e.g. Registration Desk, Tech Setup`}
                      value={role}
                      onChange={(e) => updateVolunteerRole(index, e.target.value)}
                    />
                    {eventForm.volunteerRoles.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeVolunteerRole(index)}>
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addVolunteerRole} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add Another Role
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Organizer Information</CardTitle>
            <CardDescription>Department, student club, or faculty coordinators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organizer">
                  Department / Club <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="organizer"
                  placeholder="e.g. Computer Science Department / House of Geeks"
                  value={eventForm.organizer}
                  onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadOrganizer">Lead Organizer Name</Label>
                <Input
                  id="leadOrganizer"
                  placeholder="e.g. Dr. Rajesh Kumar / Aarav Singh"
                  value={eventForm.leadOrganizer}
                  onChange={(e) => setEventForm({ ...eventForm, leadOrganizer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Phone</Label>
                <Input
                  id="contactNumber"
                  placeholder="e.g. +91 9876543210"
                  value={eventForm.contactNumber}
                  onChange={(e) => setEventForm({ ...eventForm, contactNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationLink">External Registration Form (Optional)</Label>
                <Input
                  id="registrationLink"
                  placeholder="https://forms.gle/... (optional)"
                  value={eventForm.registrationLink}
                  onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
          >
            {isSubmitting ? "Creating Event..." : "Publish Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
