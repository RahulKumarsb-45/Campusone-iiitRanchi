"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Bell,
  Megaphone,
  Search,
  Building2,
  PackageSearch,
  ShoppingBag,
  Image as ImageIcon,
  Home,
  Users,
  Plus,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Bot,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [campusServicesOpen, setCampusServicesOpen] = useState(false)
  const [instituteServicesOpen, setInstituteServicesOpen] = useState(false)

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const campusServices = [
    {
      title: "Internships",
      href: "/campus-services/internships",
      description: "Research & corporate internships for students",
      icon: Briefcase,
    },
    {
      title: "Placements",
      href: "/campus-services/placements",
      description: "Campus recruitment drives & corporate schedules",
      icon: GraduationCap,
    },
    {
      title: "College Notices",
      href: "/campus-services/notices",
      description: "Official academic and administrative circulars",
      icon: Bell,
    },
    {
      title: "Announcements",
      href: "/campus-services/announcements",
      description: "Institute broadcasts, alerts, and student updates",
      icon: Megaphone,
    },
  ]

  const instituteServices = [
    {
      title: "Lost & Found",
      href: "/institute-services/lost-and-found",
      description: "Report and recover lost items across campus",
      icon: PackageSearch,
    },
    {
      title: "Marketplace",
      href: "/institute-services/marketplace",
      description: "Buy & sell books, cycles, electronics, and essentials",
      icon: ShoppingBag,
    },
    {
      title: "Gallery",
      href: "/institute-services/gallery",
      description: "Moments, convocations, and cultural fests",
      icon: ImageIcon,
    },
    {
      title: "Hostel Notices",
      href: "/institute-services/hostel-notices",
      description: "Hostel allocations, mess updates, and regulations",
      icon: Building2,
    },
    {
      title: "Hostel Complaints",
      href: "/institute-services/hostel-complaints",
      description: "Submit & track maintenance, electrical, and mess issues",
      icon: Wrench,
    },
  ]

  const isCampusServicesActive = campusServices.some((s) => pathname.startsWith(s.href))
  const isInstituteServicesActive = instituteServices.some((s) => pathname.startsWith(s.href))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:bg-black/90">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-black dark:text-white">
                CampusOne
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                IIIT Ranchi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              Home
            </Link>

            <Link
              href="/events"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/events")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              Events
            </Link>

            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              Dashboard
            </Link>

            {/* Campus Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    isCampusServicesActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Campus Services
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 p-2 bg-white dark:bg-neutral-900 border border-border shadow-lg rounded-xl z-50 animate-in fade-in-80"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Campus Opportunities & Updates
                </div>
                {campusServices.map((item) => (
                  <DropdownMenuItem key={item.title} asChild className="focus:bg-muted rounded-lg cursor-pointer">
                    <Link href={item.href} className="flex items-start gap-3 p-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Institute Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    isInstituteServicesActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Institute Services
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 p-2 bg-white dark:bg-neutral-900 border border-border shadow-lg rounded-xl z-50 animate-in fade-in-80"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Student Utilities & Facilities
                </div>
                {instituteServices.map((item) => (
                  <DropdownMenuItem key={item.title} asChild className="focus:bg-muted rounded-lg cursor-pointer">
                    <Link href={item.href} className="flex items-start gap-3 p-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clubs Main Section */}
            <Link
              href="/clubs"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/clubs")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              Clubs
            </Link>

            {/* AI Campus Assistant */}
            <Link
              href="/assistant"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/assistant")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              <Bot className="h-4 w-4" />
              AI Assistant
              <span className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.2 text-[10px] font-bold text-foreground">
                AI
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex border-border text-foreground hover:bg-muted"
          >
            <Link href="/events/create">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Event
            </Link>
          </Button>

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                    <AvatarFallback className="bg-black text-white text-xs font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-neutral-900 border border-border shadow-lg rounded-xl z-50">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none overflow-hidden">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <Badge variant="outline" className="mt-1 w-fit text-[10px] capitalize">
                      {user.role || "student"}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/events/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut()
                    router.push("/")
                  }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                <Link href="/auth/register">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Register
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer / Expandable Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white dark:bg-black px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/events")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Events
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/dashboard")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <User className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Mobile Campus Services Collapsible */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCampusServicesOpen(!campusServicesOpen)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Briefcase className="h-4 w-4" />
                  Campus Services
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${campusServicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {campusServicesOpen && (
                <div className="pl-6 pt-1 space-y-1 border-l-2 border-muted ml-3 my-1">
                  {campusServices.map((sub) => (
                    <Link
                      key={sub.title}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                        pathname === sub.href
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Institute Services Collapsible */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setInstituteServicesOpen(!instituteServicesOpen)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4" />
                  Institute Services
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${instituteServicesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {instituteServicesOpen && (
                <div className="pl-6 pt-1 space-y-1 border-l-2 border-muted ml-3 my-1">
                  {instituteServices.map((sub) => (
                    <Link
                      key={sub.title}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                        pathname === sub.href
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Clubs Link */}
            <Link
              href="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/clubs")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" />
              Clubs
            </Link>

            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/assistant")
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </span>
              <span className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold">
                AI
              </span>
            </Link>

            <Link
              href="/events/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </div>

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {!user ? (
              <>
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center bg-black text-white">
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    Register Account
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={async () => {
                  setMobileMenuOpen(false)
                  await signOut()
                  router.push("/")
                }}
                className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out ({user.name})
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
