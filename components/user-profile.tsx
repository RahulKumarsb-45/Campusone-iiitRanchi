"use client"

import Link from "next/link"
import { Mail, User, Building, Award, Phone, MapPin, Pencil } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UserType } from "@/lib/supabase"

interface UserProfileProps {
  user: UserType | null
}

export function UserProfile({ user }: UserProfileProps) {
  if (!user) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Sign in to view your profile</p>
          <Button asChild size="sm" className="mt-3 bg-black text-white hover:bg-neutral-800">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black text-2xl font-black">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
        <CardDescription className="flex items-center justify-center gap-1.5 text-xs">
          <Mail className="h-3 w-3" />
          {user.email}
        </CardDescription>
        <div className="mt-2 flex justify-center">
          <Badge variant="outline" className="text-xs uppercase font-semibold">
            {user.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        <div className="space-y-2 text-xs border-t border-border pt-3">
          {user.department && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-semibold text-foreground text-right">{user.department}</span>
            </div>
          )}

          {user.role === "student" && (
            <>
              {user.roll_number && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Roll Number:</span>
                  <span className="font-semibold text-foreground">{user.roll_number}</span>
                </div>
              )}
              {user.year && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Academic Year:</span>
                  <span className="font-semibold text-foreground">{user.year}</span>
                </div>
              )}
            </>
          )}

          {user.role === "faculty" && user.position && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Designation:</span>
              <span className="font-semibold text-foreground">{user.position}</span>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold text-foreground">{user.phone}</span>
            </div>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full gap-1.5 border-border">
          <Link href="/profile">
            <Pencil className="h-3.5 w-3.5" />
            Manage Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
