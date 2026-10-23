"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Pencil, Save, CheckCircle2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { updateUserProfile, fetchUserRegistrations, type RegistrationType } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [registrations, setRegistrations] = useState<RegistrationType[]>([])

  const [formData, setFormData] = useState(() => ({
    name: user?.name || "",
    department: user?.department || "",
    year: user?.year || "",
    roll_number: user?.roll_number || "",
    position: user?.position || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
  }))

  const [prevUserId, setPrevUserId] = useState(user?.id)
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id)
    setFormData({
      name: user.name || "",
      department: user.department || "",
      year: user.year || "",
      roll_number: user.roll_number || "",
      position: user.position || "",
      phone: user.phone || "",
      address: user.address || "",
      bio: user.bio || "",
    })
  }

  useEffect(() => {
    let isMounted = true
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?next=/profile")
      } else {
        fetchUserRegistrations(user.id).then((regs) => {
          if (isMounted) {
            setRegistrations(regs || [])
          }
        })
      }
    }
    return () => {
      isMounted = false
    }
  }, [user, authLoading, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)

    try {
      // Security: Disallow tampering with role or id
      const updates = {
        name: formData.name.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
        roll_number: formData.roll_number.trim(),
        position: formData.position.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim(),
      }

      const res = await updateUserProfile(user.id, updates)
      if (res.error) {
        toast({
          title: "Update failed",
          description: res.error,
          variant: "destructive",
        })
      } else {
        await refreshProfile()
        toast({
          title: "Profile updated",
          description: "Your profile details have been saved.",
        })
        setIsEditing(false)
      }
    } catch (err: any) {
      toast({
        title: "Error saving profile",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent dark:border-white" />
        <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal and academic information on CampusOne
          </p>
        </div>

        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={!isEditing ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5" : "gap-1.5"}
        >
          <Pencil className="h-4 w-4" />
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar & Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border text-center">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black text-3xl font-black">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <CardTitle className="text-xl font-bold">{formData.name || user.name}</CardTitle>
              <CardDescription className="text-xs break-all">{user.email}</CardDescription>
              <div className="mt-2 flex justify-center">
                <Badge variant="outline" className="capitalize text-xs font-semibold">
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pt-1 pb-4">
              <p>CampusOne Member since {new Date().getFullYear()}</p>
              <p className="mt-1 font-medium text-foreground">IIIT Ranchi</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="md:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Personal & Academic Details</CardTitle>
              <CardDescription>
                {isEditing ? "Make changes and click Save to update your profile" : "Your official portal records"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Input
                      id="dept"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>

                  {user.role === "student" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="roll">Roll Number</Label>
                        <Input
                          id="roll"
                          value={formData.roll_number}
                          onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                          placeholder="e.g. 23BCS045"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Academic Year</Label>
                        <Input
                          id="year"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          placeholder="e.g. 2nd Year"
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "faculty" && (
                    <div className="space-y-2">
                      <Label htmlFor="pos">Designation</Label>
                      <Input
                        id="pos"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="e.g. Assistant Professor"
                      />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Hostel / Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Hostel B, Room 204"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me / Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      placeholder="Write a brief introduction about your interests and goals..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Full Name</span>
                    <span className="col-span-2 font-semibold text-foreground">{user.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Email</span>
                    <span className="col-span-2 font-semibold text-foreground">{user.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Role</span>
                    <span className="col-span-2 capitalize font-semibold text-foreground">{user.role}</span>
                  </div>

                  {user.department && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                      <span className="text-muted-foreground font-medium">Department</span>
                      <span className="col-span-2 font-semibold text-foreground">{user.department}</span>
                    </div>
                  )}

                  {user.role === "student" && (
                    <>
                      {user.roll_number && (
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                          <span className="text-muted-foreground font-medium">Roll Number</span>
                          <span className="col-span-2 font-semibold text-foreground">{user.roll_number}</span>
                        </div>
                      )}
                      {user.year && (
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                          <span className="text-muted-foreground font-medium">Year</span>
                          <span className="col-span-2 font-semibold text-foreground">{user.year}</span>
                        </div>
                      )}
                    </>
                  )}

                  {user.role === "faculty" && user.position && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                      <span className="text-muted-foreground font-medium">Designation</span>
                      <span className="col-span-2 font-semibold text-foreground">{user.position}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                      <span className="text-muted-foreground font-medium">Phone</span>
                      <span className="col-span-2 font-semibold text-foreground">{user.phone}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/60">
                      <span className="text-muted-foreground font-medium">Address</span>
                      <span className="col-span-2 font-semibold text-foreground">{user.address}</span>
                    </div>
                  )}

                  {user.bio && (
                    <div className="grid grid-cols-3 gap-2 py-2">
                      <span className="text-muted-foreground font-medium">Bio</span>
                      <span className="col-span-2 text-foreground whitespace-pre-line">{user.bio}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
