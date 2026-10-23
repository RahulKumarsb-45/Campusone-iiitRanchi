"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, MoreHorizontal, Trash2, Eye, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RegistrationType, EventType } from "@/lib/supabase"

interface DashboardEventListProps {
  registrations: RegistrationType[]
  createdEvents?: EventType[]
  mode?: "registrations" | "created"
  onCancelRegistration?: (eventId: number) => void
  onDeleteEvent?: (eventId: number) => void
  errorMessage?: string | null
  onRetry?: () => void
}

export function DashboardEventList({
  registrations,
  createdEvents = [],
  mode = "registrations",
  onCancelRegistration,
  onDeleteEvent,
  errorMessage,
  onRetry,
}: DashboardEventListProps) {
  const [now] = useState(() => Date.now())

  if (mode === "registrations") {
    if (errorMessage) {
      return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
          <AlertCircle className="h-8 w-8 text-destructive mb-2 opacity-90" />
          <p className="text-sm font-semibold text-destructive">Could not load registrations</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {errorMessage}
          </p>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Connection
            </Button>
          )}
        </div>
      )
    }

    if (registrations.length === 0) {
      return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm font-semibold">No registered events found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Browse upcoming workshops and hackathons on CampusOne to register.
          </p>
          <Button asChild size="sm" className="mt-4 bg-black text-white hover:bg-neutral-800">
            <Link href="/events">Explore Events</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => {
              const ev = reg.event
              if (!ev) return null
              const eventDate = new Date(ev.date)
              const isPast = eventDate.getTime() < now

              return (
                <TableRow key={reg.id}>
                  <TableCell className="font-semibold text-sm">
                    <Link href={`/events/${ev.id}`} className="hover:underline">
                      {ev.title}
                    </Link>
                    <p className="text-xs text-muted-foreground font-normal">{ev.organizer}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <p className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(eventDate, "MMM d, yyyy")}
                      </p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(eventDate, "h:mm a")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {ev.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isPast ? "secondary" : "default"} className="text-[10px]">
                      {isPast ? "Concluded" : "Upcoming"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reg.is_volunteer ? (
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Volunteer ({reg.volunteer_role || "General"})
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Attendee</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/events/${ev.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        {!isPast && onCancelRegistration && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onCancelRegistration(ev.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Cancel Registration
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Mode: Created Events
  if (errorMessage) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
        <AlertCircle className="h-8 w-8 text-destructive mb-2 opacity-90" />
        <p className="text-sm font-semibold text-destructive">Could not load campus events</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          {errorMessage}
        </p>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </Button>
        )}
      </div>
    )
  }

  if (createdEvents.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm font-semibold">You haven&apos;t created any events yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Schedule and manage workshops, seminars, and campus drives.
        </p>
        <Button asChild size="sm" className="mt-4 bg-black text-white hover:bg-neutral-800">
          <Link href="/events/create">Create New Event</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Title</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {createdEvents.map((event) => {
            const eventDate = new Date(event.date)
            return (
              <TableRow key={event.id}>
                <TableCell className="font-semibold text-sm">
                  <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{event.location}</p>
                </TableCell>
                <TableCell className="text-xs">
                  {format(eventDate, "MMM d, yyyy · h:mm a")}
                </TableCell>
                <TableCell className="text-xs font-semibold">
                  {event.current_participants} / {event.max_participants || 100}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {event.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}/edit`}>Edit Event</Link>
                      </DropdownMenuItem>
                      {onDeleteEvent && (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDeleteEvent(event.id)}
                        >
                          Delete Event
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
