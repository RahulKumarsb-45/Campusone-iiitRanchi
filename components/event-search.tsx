"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Calendar, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: number
  title: string
  description: string
  date: string
  location: string
  category: string
}

export function EventSearch() {
  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Event[]>([])
  const [query, setQuery] = useState("")

  // Mock events data
  const events: Event[] = [
    {
      id: 1,
      title: "Tech Innovation Summit",
      description: "Join industry leaders to explore cutting-edge technologies and innovations.",
      date: "2025-04-15T10:00:00",
      location: "Main Auditorium",
      category: "seminars",
    },
    {
      id: 2,
      title: "Annual Sports Tournament",
      description: "Compete in various sports activities and win exciting prizes.",
      date: "2025-04-20T09:00:00",
      location: "University Sports Complex",
      category: "sports",
    },
    {
      id: 3,
      title: "Web Development Workshop",
      description: "Learn modern web development techniques with hands-on exercises.",
      date: "2025-04-25T14:00:00",
      location: "Computer Lab 101",
      category: "workshops",
    },
    {
      id: 4,
      title: "Cultural Festival",
      description: "Celebrate diversity through music, dance, and art performances.",
      date: "2025-05-05T18:00:00",
      location: "University Amphitheater",
      category: "cultural",
    },
    {
      id: 5,
      title: "Career Fair 2025",
      description: "Connect with top employers and explore career opportunities.",
      date: "2025-05-10T10:00:00",
      location: "University Hall",
      category: "seminars",
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (query) {
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.category.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [query])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search events...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search events..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Events">
            {searchResults.map((event) => {
              const eventDate = new Date(event.date)
              return (
                <CommandItem
                  key={event.id}
                  onSelect={() => {
                    window.location.href = `/events/${event.id}`
                    setOpen(false)
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="mt-1 flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(eventDate, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(eventDate, "h:mm a")}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
