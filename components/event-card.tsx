"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Clock, Heart, MapPin, Share2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { EventType } from "@/lib/supabase"
import { getEventImage, getFallbackEventImage } from "@/lib/event-images"

interface EventCardProps {
  event: EventType
  className?: string
}

// Define color schemes for different event categories
const categoryColors = {
  workshops: {
    bg: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  seminars: {
    bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  },
  sports: {
    bg: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
  },
  cultural: {
    bg: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
    border: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-300",
  },
  academic: {
    bg: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  hackathon: {
    bg: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
    border: "border-pink-200 dark:border-pink-800",
    badge: "bg-pink-500",
    text: "text-pink-700 dark:text-pink-300",
  },
  default: {
    bg: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-500",
    text: "text-gray-700 dark:text-gray-300",
  },
}

export function EventCard({ event, className }: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imgSrc, setImgSrc] = useState(() => getEventImage(event))
  const eventDate = new Date(event.date)

  // Get color scheme based on event category (case-insensitive)
  const catKey = (event.category || "").toLowerCase()
  const colorScheme = categoryColors[catKey as keyof typeof categoryColors] || categoryColors.default

  const isFull = event.max_participants > 0 && event.current_participants >= event.max_participants
  const spotsLeft = event.max_participants > 0 ? Math.max(0, event.max_participants - event.current_participants) : null

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? `${event.title} has been removed from your favorites.`
        : `${event.title} has been added to your favorites.`,
      duration: 3000,
    })
  }

  const shareEvent = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: event.description,
          url: window.location.origin + `/events/${event.id}`,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      toast({
        title: "Share event",
        description: `Link to ${event.title} copied.`,
        duration: 3000,
      })
    }
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
        className={cn("", className)}
      >
        <Card className={cn("h-full overflow-hidden border bg-gradient-to-br flex flex-col justify-between", colorScheme.border, colorScheme.bg)}>
          <div>
            <div className="relative h-48 overflow-hidden bg-neutral-900 group">
              <Link href={`/events/${event.id}`} className="block h-full w-full cursor-pointer">
                <img
                  src={imgSrc}
                  alt={event.title}
                  onError={() => {
                    setImgSrc(getFallbackEventImage(event.category, event.title, event.description, event.tags))
                  }}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="absolute right-2 top-2 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={toggleFavorite}
                    >
                      <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={shareEvent}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share event</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share event</TooltipContent>
                </Tooltip>
              </div>

              <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                <Badge className={cn("backdrop-blur-sm text-xs font-semibold", colorScheme.badge)}>
                  {event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : "General"}
                </Badge>

                {event.is_paid ? (
                  <Badge variant="outline" className="bg-background/90 font-bold backdrop-blur-sm">
                    ₹{event.price}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold backdrop-blur-sm border-emerald-500/30">
                    Free
                  </Badge>
                )}

                {isFull && (
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                    Full
                  </Badge>
                )}
                {!isFull && spotsLeft !== null && spotsLeft <= 15 && (
                  <Badge className="bg-amber-500 text-black text-[10px] font-bold">
                    {spotsLeft} spots left
                  </Badge>
                )}
              </div>
            </div>

          <CardHeader className="p-4 pb-2">
            <CardTitle className={cn("line-clamp-1 text-xl", colorScheme.text)}>
              <Link href={`/events/${event.id}`} className="hover:underline">
                {event.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {format(eventDate, "MMMM d, yyyy")}
              <span className="mx-1">•</span>
              <Clock className="h-3.5 w-3.5" />
              {format(eventDate, "h:mm a")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <div className="mb-3 flex items-start gap-1">
              <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{event.location}</span>
            </div>
            <p className="line-clamp-2 text-sm">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {event.tags &&
                event.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </div>

        <CardFooter className="flex justify-between p-4 pt-0">
            <div className="text-xs text-muted-foreground">By {event.organizer}</div>
            <Button asChild size="sm">
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
