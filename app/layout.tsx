import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import ClientLayout from "./client"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CampusOne — IIIT Ranchi",
  description: "Unified Campus Portal for Events, Services, Notices, and Clubs at IIIT Ranchi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}