"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Event {
  id: number
  title: string
  description: string
  image: string
  date: string
  location: string
  category: string
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchEvents = async () => {
      setLoading(true)

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data
      const upcomingEvents = [
        {
          id: 1,
          title: "Tech Innovation Summit",
          description: "Join industry leaders to explore cutting-edge technologies and innovations.",
          image: "/placeholder.svg?height=200&width=400",
          date: "2025-04-15T10:00:00",
          location: "Main Auditorium",
          category: "seminars",
        },
        {
          id: 2,
          title: "Annual Sports Tournament",
          description: "Compete in various sports activities and win exciting prizes.",
          image: "/placeholder.svg?height=200&width=400",
          date: "2025-04-20T09:00:00",
          location: "University Sports Complex",
          category: "sports",
        },
        {
          id: 3,
          title: "Web Development Workshop",
          description: "Learn modern web development techniques with hands-on exercises.",
          image: "/placeholder.svg?height=200&width=400",
          date: "2025-04-25T14:00:00",
          location: "Computer Lab 101",
          category: "workshops",
        },
      ]

      setEvents(upcomingEvents)
      setLoading(false)
    }

    fetchEvents()
  }, [])

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {events.map((event, index) => {
        const eventDate = new Date(event.date)

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute right-2 top-2">
                  <Badge className="bg-primary/90 backdrop-blur-sm">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(eventDate, "MMMM d, yyyy")}
                  <span className="mx-1">•</span>
                  <Clock className="h-3.5 w-3.5" />
                  {format(eventDate, "h:mm a")}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <div className="mb-3 flex items-start gap-1">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{event.location}</span>
                </div>
                <p className="line-clamp-2 text-sm">{event.description}</p>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
