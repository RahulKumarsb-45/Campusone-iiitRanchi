"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Home,
  LogOut,
  Plus,
  User,
  Users,
  Briefcase,
  GraduationCap,
  Bell,
  Megaphone,
  PackageSearch,
  ShoppingBag,
  Image as ImageIcon,
  Building2,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  trigger: React.ReactNode
}

export function Sidebar({ trigger }: SidebarProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    setOpen(false)
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  const mainItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: User, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clubs", path: "/clubs" },
    { icon: Plus, label: "Create Event", path: "/events/create" },
  ]

  const campusServices = [
    { icon: Briefcase, label: "Internships", path: "/campus-services/internships" },
    { icon: GraduationCap, label: "Placements", path: "/campus-services/placements" },
    { icon: Bell, label: "College Notices", path: "/campus-services/notices" },
    { icon: Megaphone, label: "Announcements", path: "/campus-services/announcements" },
  ]

  const instituteServices = [
    { icon: PackageSearch, label: "Lost & Found", path: "/institute-services/lost-and-found" },
    { icon: ShoppingBag, label: "Marketplace", path: "/institute-services/marketplace" },
    { icon: ImageIcon, label: "Gallery", path: "/institute-services/gallery" },
    { icon: Building2, label: "Hostel Notices", path: "/institute-services/hostel-notices" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white dark:bg-white dark:text-black">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-black text-base">CampusOne</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">IIIT Ranchi</span>
            </SheetTitle>
          </SheetHeader>

          {user ? (
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                  <AvatarFallback className="bg-black text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-semibold">{user.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{user.role}</Badge>
              </div>

              {user.department && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>{user.department}</p>
                  {user.roll_number && <p>Roll: {user.roll_number}</p>}
                </div>
              )}

              <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => navigateTo("/profile")}>
                View Profile
              </Button>
            </div>
          ) : (
            <div className="border-b p-4">
              <p className="mb-3 text-xs text-muted-foreground">Sign in to access your portal registrations and features</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-800 text-xs" onClick={() => navigateTo("/auth/login")}>
                  Sign In
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigateTo("/auth/register")}>
                  Register
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto py-2 px-2 space-y-4">
            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Main Navigation</p>
              {mainItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-medium"
                  onClick={() => navigateTo(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <Separator />

            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campus Services</p>
              {campusServices.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => navigateTo(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <Separator />

            <nav className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Institute Services</p>
              {instituteServices.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => navigateTo(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {user && (
            <div className="border-t p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
