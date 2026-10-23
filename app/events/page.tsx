"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Filter, Plus, Search, Calendar, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { EventCard } from "@/components/event-card"
import { fetchEvents, type EventType } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">("all")
  const [sortBy, setSortBy] = useState("date-asc")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const data = await fetchEvents()
      setEvents(data)
    } catch (err: any) {
      console.error("Failed to fetch events:", err)
      setErrorMsg(err?.message || "Failed to load campus events. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchEvents()
      .then((data) => {
        if (isMounted) {
          setEvents(data)
          setLoading(false)
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error("Failed to fetch events:", err)
          setErrorMsg(err?.message || "Failed to load campus events. Please try again.")
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const [now] = useState(() => Date.now())

  // Filter and sort events based on search, categories, and status
  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.tags && event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((sc) => {
          const scLower = sc.toLowerCase()
          const evCatLower = (event.category || "").toLowerCase()
          return (
            evCatLower === scLower ||
            (scLower === "hackathon" && evCatLower.includes("hack")) ||
            (scLower === "workshops" && (evCatLower.includes("workshop") || evCatLower.includes("lab"))) ||
            (scLower === "seminars" && (evCatLower.includes("seminar") || evCatLower.includes("summit")))
          )
        })

      const eventTime = new Date(event.date).getTime()
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" && eventTime >= now) ||
        (statusFilter === "past" && eventTime < now)

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort events
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()

      switch (sortBy) {
        case "date-asc":
          return dateA - dateB
        case "date-desc":
          return dateB - dateA
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
  }, [events, searchQuery, selectedCategories, statusFilter, sortBy, now])

  const categories = [
    { id: "workshops", label: "Workshops" },
    { id: "seminars", label: "Seminars" },
    { id: "sports", label: "Sports" },
    { id: "cultural", label: "Cultural" },
    { id: "hackathon", label: "Hackathons" },
    { id: "academic", label: "Academic" },
  ]

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Calendar className="h-3.5 w-3.5" />
            IIIT Ranchi Events Directory
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">All Campus Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, and register for student and department events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
            <Link href="/events/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by event title, speaker, department, or keywords..."
              className="pl-9 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 border-border">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Events</SheetTitle>
                <SheetDescription>Filter events by category and timeline</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Timeline</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className={`text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                        statusFilter === "all" ? "bg-black text-white dark:bg-white dark:text-black font-semibold" : "bg-muted text-foreground"
                      }`}
                    >
                      All Events
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("upcoming")}
                      className={`text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                        statusFilter === "upcoming" ? "bg-black text-white dark:bg-white dark:text-black font-semibold" : "bg-muted text-foreground"
                      }`}
                    >
                      Upcoming Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("past")}
                      className={`text-left px-3 py-1.5 rounded-md text-xs font-medium ${
                        statusFilter === "past" ? "bg-black text-white dark:bg-white dark:text-black font-semibold" : "bg-muted text-foreground"
                      }`}
                    >
                      Past Events
                    </button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-semibold">Categories</h3>
                  <div className="space-y-2.5">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCategories([])
                      setStatusFilter("all")
                      setSortBy("date-asc")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Status quick select */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="w-[130px] border-border bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px] border-border bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Earliest first)</SelectItem>
              <SelectItem value="date-desc">Date (Latest first)</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {selectedCategories.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {selectedCategories.map((category) => {
            const categoryLabel = categories.find((c) => c.id === category)?.label || category
            return (
              <Button
                key={category}
                variant="secondary"
                size="sm"
                className="h-7 text-xs gap-1 rounded-full px-3"
                onClick={() => toggleCategory(category)}
              >
                {categoryLabel}
                <span className="ml-1 text-xs">&times;</span>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedCategories([])}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Error Banner State if fetch failed */}
      {errorMsg && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <span className="font-bold">Database Notice:</span>
            <span>{errorMsg}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadEvents}
            className="self-start sm:self-auto border-red-300 bg-white hover:bg-red-100 text-red-900 dark:border-red-900 dark:bg-black dark:text-red-200"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Events Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No events matching criteria</h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-sm">
            {events.length > 0
              ? `None of the ${events.length} available campus events match your selected filters.`
              : "No campus events are currently listed in the directory."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategories([])
                setStatusFilter("all")
              }}
            >
              Reset Filters
            </Button>
            <Button asChild size="sm" className="bg-black text-white hover:bg-neutral-800">
              <Link href="/events/create">Create New Event</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
