"use client"

import type React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col bg-white text-foreground dark:bg-black">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-white dark:bg-neutral-950 py-8">
            <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-sm">CampusOne</span>
                  <span className="text-xs text-muted-foreground ml-1.5 font-medium">IIIT Ranchi</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} CampusOne — Indian Institute of Information Technology, Ranchi. All rights reserved.
              </p>
              <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                <Link href="/campus-services/notices" className="hover:text-foreground hover:underline">
                  Notices
                </Link>
                <Link href="/institute-services/lost-and-found" className="hover:text-foreground hover:underline">
                  Lost & Found
                </Link>
                <Link href="/clubs" className="hover:text-foreground hover:underline">
                  Clubs
                </Link>
                <Link href="/events" className="hover:text-foreground hover:underline">
                  Events
                </Link>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
