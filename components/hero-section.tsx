"use client"

import { useRef, useMemo } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Calendar, Sparkles, MapPin, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CountdownTimer } from "@/components/countdown-timer"
import type { EventType } from "@/lib/supabase"

interface HeroSectionProps {
  featuredEvent?: EventType | null
}

export function HeroSection({ featuredEvent }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 350], [1, 0])

  const eventDate = useMemo(() => {
    if (featuredEvent?.date) return new Date(featuredEvent.date)
    return new Date("2026-11-01T10:00:00Z")
  }, [featuredEvent])

  return (
    <div ref={ref} className="relative min-h-[580px] overflow-hidden border-b border-border bg-neutral-950 text-white">
      {/* Background subtle mesh & dark aesthetic for contrast */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black"
        style={{ y }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Content */}
      <motion.div
        className="container relative z-10 mx-auto flex min-h-[580px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-1.5 text-xs font-medium text-neutral-300 shadow-sm backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span>IIIT Ranchi Official Student & Campus Portal</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
            Campus<span className="text-neutral-400">One</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-neutral-300 font-normal leading-relaxed">
            Your single unified hub for campus events, student clubs, internships, placement schedules, and institute services at IIIT Ranchi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          <Button asChild size="lg" className="h-11 px-6 bg-white text-black hover:bg-neutral-200 font-semibold shadow-sm">
            <Link href="/events">
              Explore Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-11 px-6 border-neutral-700 bg-neutral-900/60 text-white hover:bg-neutral-800">
            <Link href="/campus-services/notices">College Notices</Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="h-11 px-6 text-neutral-300 hover:text-white hover:bg-neutral-900">
            <Link href="/clubs">Discover Clubs</Link>
          </Button>
        </motion.div>

        {/* Featured event banner */}
        {featuredEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 text-left shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                <Tag className="h-3 w-3" />
                Featured Event
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                {featuredEvent.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              {featuredEvent.title}
            </h2>
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2 leading-relaxed">
              {featuredEvent.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span>
                  {eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{featuredEvent.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">Time Remaining</span>
                <CountdownTimer targetDate={eventDate} />
              </div>
              <Button asChild size="sm" className="bg-white text-black hover:bg-neutral-200 font-semibold self-start sm:self-auto">
                <Link href={`/events/${featuredEvent.id}`}>
                  View Details & Register
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
