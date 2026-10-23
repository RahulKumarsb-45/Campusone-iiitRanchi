"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Search,
  Plus,
  Mail,
  Calendar,
  Sparkles,
  Filter,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchClubs,
  createClub,
  updateClub,
  deleteClub,
  isStaffOrAdmin,
  type ClubType,
} from "@/lib/supabase"
import {
  getClubImage,
  getFallbackClubImage,
  isGenericPlaceholderImage,
} from "@/lib/club-images"

export default function ClubsPage() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<ClubType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState<ClubType | null>(null)
  const [editingClub, setEditingClub] = useState<ClubType | null>(null)
  const [deletingClub, setDeletingClub] = useState<ClubType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createImageError, setCreateImageError] = useState(false)
  const [editImageError, setEditImageError] = useState(false)

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "Technical" as ClubType["category"],
    description: "",
    lead_name: "",
    lead_email: "",
    meeting_info: "",
    image: "",
    tags: "",
  })

  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    category: "Technical" as ClubType["category"],
    description: "",
    lead_name: "",
    lead_email: "",
    meeting_info: "",
    image: "",
    tags: "",
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchClubs()
      setClubs(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Check if current user has permission to edit or delete a club
  const canManageClub = (club: ClubType) => {
    if (!user) return false
    if (isStaffOrAdmin(user.role)) return true
    if (club.lead_email && user.email && club.lead_email.toLowerCase() === user.email.toLowerCase())
      return true
    return false
  }

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === "All" || c.category === category

    return matchesSearch && matchesCategory
  })

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register a club.",
      })
      return
    }

    if (!form.name.trim() || !form.code.trim() || !form.lead_name.trim() || !form.description.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required club details.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      // Resolve appropriate image if not provided or invalid
      const resolvedImage =
        form.image.trim() && !isGenericPlaceholderImage(form.image.trim())
          ? form.image.trim()
          : getFallbackClubImage(form.name, form.description, form.category, form.code, tagsArray)

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        description: form.description.trim(),
        lead_name: form.lead_name.trim(),
        lead_email: form.lead_email.trim(),
        meeting_info: form.meeting_info.trim(),
        image: resolvedImage,
        tags: tagsArray,
      }

      const res = await createClub(payload)
      if (res.error) {
        toast({ title: "Failed to create club", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Club created!", description: `${payload.name} has been added.` })
        setShowAddModal(false)
        setForm({
          name: "",
          code: "",
          category: "Technical",
          description: "",
          lead_name: "",
          lead_email: "",
          meeting_info: "",
          image: "",
          tags: "",
        })
        setCreateImageError(false)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditClub = (club: ClubType) => {
    setEditingClub(club)
    setEditImageError(false)
    setEditForm({
      name: club.name,
      code: club.code,
      category: club.category,
      description: club.description,
      lead_name: club.lead_name,
      lead_email: club.lead_email || "",
      meeting_info: club.meeting_info || "",
      image: isGenericPlaceholderImage(club.image) ? "" : club.image,
      tags: Array.isArray(club.tags) ? club.tags.join(", ") : "",
    })
  }

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClub || !user) return

    if (
      !editForm.name.trim() ||
      !editForm.code.trim() ||
      !editForm.lead_name.trim() ||
      !editForm.description.trim()
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required club details.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const tagsArray = editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const resolvedImage =
        editForm.image.trim() && !isGenericPlaceholderImage(editForm.image.trim())
          ? editForm.image.trim()
          : getFallbackClubImage(
              editForm.name,
              editForm.description,
              editForm.category,
              editForm.code,
              tagsArray
            )

      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        category: editForm.category,
        description: editForm.description.trim(),
        lead_name: editForm.lead_name.trim(),
        lead_email: editForm.lead_email.trim(),
        meeting_info: editForm.meeting_info.trim(),
        image: resolvedImage,
        tags: tagsArray,
      }

      const res = await updateClub(editingClub.id, payload)
      if (res.error) {
        toast({ title: "Failed to update club", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Club updated!", description: `${payload.name} details have been saved.` })
        setEditingClub(null)
        setEditImageError(false)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClub = async () => {
    if (!deletingClub || !user) return

    setIsSubmitting(true)
    try {
      const res = await deleteClub(deletingClub.id)
      if (res.error) {
        toast({ title: "Failed to delete club", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Club deleted", description: `${deletingClub.name} has been removed.` })
        setDeletingClub(null)
        if (selectedClub?.id === deletingClub.id) {
          setSelectedClub(null)
        }
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper for computing active preview URL in create form
  const getCreatePreviewUrl = () => {
    if (form.image.trim() && !createImageError) {
      return form.image.trim()
    }
    const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    return getFallbackClubImage(form.name, form.description, form.category, form.code, tagsArray)
  }

  // Helper for computing active preview URL in edit form
  const getEditPreviewUrl = () => {
    if (editForm.image.trim() && !editImageError) {
      return editForm.image.trim()
    }
    const tagsArray = editForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
    return getFallbackClubImage(
      editForm.name,
      editForm.description,
      editForm.category,
      editForm.code,
      tagsArray
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Users className="h-3.5 w-3.5" />
            IIIT Ranchi Student Societies
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Campus Clubs & Societies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover student clubs, workshops, arts, photography, sports, and technical chapters
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              onClick={() => {
                setShowAddModal(true)
                setCreateImageError(false)
              }}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Register Club
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs by name, category, or code..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Cultural">Cultural</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Literary">Literary</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No clubs found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try selecting another category or clear your search query.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => {
            const hasPrivilege = canManageClub(club)
            const clubImage = getClubImage(club)

            return (
              <Card
                key={club.id}
                id={`club-${club.id}`}
                className="group border-border overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedClub(club)}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={clubImage}
                      alt={`${club.name} banner`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackClubImage(
                          club.name,
                          club.description,
                          club.category,
                          club.code,
                          club.tags
                        )
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        {club.code}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {club.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {club.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                      {club.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                    {club.meeting_info && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-foreground shrink-0" />
                        <span>{club.meeting_info}</span>
                      </div>
                    )}
                    {club.lead_name && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-foreground shrink-0" />
                        <span>
                          Lead: <strong>{club.lead_name}</strong>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClub(club)}
                      className="flex-1 text-xs font-semibold border-border"
                    >
                      View Details & Contact
                    </Button>
                    {hasPrivilege && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditClub(club)}
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border"
                          title="Edit club details and image"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingClub(club)}
                          className="h-8 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-border"
                          title="Delete club"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Club Details Modal */}
      {selectedClub && (
        <Dialog open={!!selectedClub} onOpenChange={() => setSelectedClub(null)}>
          <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
            <div className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800">
              <img
                src={getClubImage(selectedClub)}
                alt={selectedClub.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getFallbackClubImage(
                    selectedClub.name,
                    selectedClub.description,
                    selectedClub.category,
                    selectedClub.code,
                    selectedClub.tags
                  )
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <Badge className="bg-white/90 text-black text-[10px] font-bold mb-1">
                    {selectedClub.category}
                  </Badge>
                  <h2 className="text-xl font-black text-white">{selectedClub.name}</h2>
                </div>
                <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white border border-white/20">
                  {selectedClub.code}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <DialogDescription className="text-xs leading-relaxed text-foreground">
                {selectedClub.description}
              </DialogDescription>

              <div className="space-y-3 py-3 border-y border-border">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Regular Meetings & Venue
                  </p>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedClub.meeting_info || "Scheduled weekly"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Club Leadership Contact
                  </p>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedClub.lead_name} (
                    {selectedClub.lead_email || "contact via IIIT Ranchi official mail"})
                  </p>
                </div>
                {selectedClub.tags && selectedClub.tags.length > 0 && (
                  <div>
                    <p className="font-semibold text-muted-foreground uppercase text-[10px] mb-1">
                      Focus Areas & Activities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedClub.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center pt-1">
                <div>
                  {canManageClub(selectedClub) && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const target = selectedClub
                          setSelectedClub(null)
                          startEditClub(target)
                        }}
                        className="text-xs gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Club
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const target = selectedClub
                          setSelectedClub(null)
                          setDeletingClub(target)
                        }}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedClub(null)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
                    onClick={() => {
                      toast({
                        title: "Inquiry Sent",
                        description: `Your interest in ${selectedClub.name} has been notified to ${selectedClub.lead_name}.`,
                      })
                      setSelectedClub(null)
                    }}
                  >
                    Connect with Club
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Club Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Student Club</DialogTitle>
            <DialogDescription>
              Submit a new student club, chapter, or society for IIIT Ranchi
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClub} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cname">Club Name *</Label>
              <Input
                id="cname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kriti Art Society or Piccell Photography"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="code">Code / Abbr *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. KRITI or PICCELL"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cat">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val: any) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger id="cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Literary">Literary</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cdesc">Description & Activities *</Label>
              <Textarea
                id="cdesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Describe club activities (e.g. painting, sketching, robotics, photography)"
                required
              />
            </div>

            {/* Club Image Input with Live Activity-Aware Preview */}
            <div className="space-y-1.5 rounded-lg border border-border bg-neutral-50/50 dark:bg-neutral-900/40 p-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="cimage" className="font-semibold flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Club Image URL (Optional)
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {form.image.trim() ? "Custom URL" : "Auto smart image"}
                </span>
              </div>
              <Input
                id="cimage"
                value={form.image}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value })
                  setCreateImageError(false)
                }}
                placeholder="https://images.unsplash.com/... (optional)"
              />
              <div className="relative mt-2 h-24 w-full overflow-hidden rounded-md border border-border bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={getCreatePreviewUrl()}
                  alt="Club preview"
                  className="h-full w-full object-cover"
                  onError={() => {
                    setCreateImageError(true)
                  }}
                />
                <div className="absolute bottom-1 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm flex items-center gap-1">
                  {form.image.trim() && !createImageError ? (
                    <>
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                      Custom URL
                    </>
                  ) : createImageError ? (
                    <>
                      <AlertCircle className="h-2.5 w-2.5 text-amber-400" />
                      Invalid URL — Using Fallback
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                      Auto-Matched Activity Image
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="lead">Lead Student *</Label>
                <Input
                  id="lead"
                  value={form.lead_name}
                  onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                  placeholder="Lead full name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mail">Lead Email</Label>
                <Input
                  id="mail"
                  value={form.lead_email}
                  onChange={(e) => setForm({ ...form, lead_email: e.target.value })}
                  placeholder="club@iiitranchi.ac.in"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="meet">Meeting Schedule</Label>
              <Input
                id="meet"
                value={form.meeting_info}
                onChange={(e) => setForm({ ...form, meeting_info: e.target.value })}
                placeholder="e.g. Every Thursday 5 PM, Lab 1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tags">Focus Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. photography, sketching, robotics, debate"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save Club"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Club Modal */}
      {editingClub && (
        <Dialog open={!!editingClub} onOpenChange={() => setEditingClub(null)}>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Club: {editingClub.name}</DialogTitle>
              <DialogDescription>
                Update details, leadership, or custom cover image for this club
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateClub} className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <Label htmlFor="edit-cname">Club Name *</Label>
                <Input
                  id="edit-cname"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Kriti Art Society"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-code">Code / Abbr *</Label>
                  <Input
                    id="edit-code"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    placeholder="e.g. KRITI"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-cat">Category *</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(val: any) => setEditForm({ ...editForm, category: val })}
                  >
                    <SelectTrigger id="edit-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Literary">Literary</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-cdesc">Description & Activities *</Label>
                <Textarea
                  id="edit-cdesc"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  placeholder="Club mission and activities"
                  required
                />
              </div>

              {/* Edit Image Input with Live Activity-Aware Preview */}
              <div className="space-y-1.5 rounded-lg border border-border bg-neutral-50/50 dark:bg-neutral-900/40 p-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-image" className="font-semibold flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    Cover Image URL (Optional)
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {editForm.image.trim() ? "Custom URL" : "Auto smart image"}
                  </span>
                </div>
                <Input
                  id="edit-image"
                  value={editForm.image}
                  onChange={(e) => {
                    setEditForm({ ...editForm, image: e.target.value })
                    setEditImageError(false)
                  }}
                  placeholder="https://images.unsplash.com/... (optional)"
                />
                <div className="relative mt-2 h-24 w-full overflow-hidden rounded-md border border-border bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={getEditPreviewUrl()}
                    alt="Club preview"
                    className="h-full w-full object-cover"
                    onError={() => {
                      setEditImageError(true)
                    }}
                  />
                  <div className="absolute bottom-1 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm flex items-center gap-1">
                    {editForm.image.trim() && !editImageError ? (
                      <>
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                        Custom URL
                      </>
                    ) : editImageError ? (
                      <>
                        <AlertCircle className="h-2.5 w-2.5 text-amber-400" />
                        Invalid URL — Using Fallback
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                        Auto-Matched Activity Image
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-lead">Lead Student *</Label>
                  <Input
                    id="edit-lead"
                    value={editForm.lead_name}
                    onChange={(e) => setEditForm({ ...editForm, lead_name: e.target.value })}
                    placeholder="Lead full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-mail">Lead Email</Label>
                  <Input
                    id="edit-mail"
                    value={editForm.lead_email}
                    onChange={(e) => setEditForm({ ...editForm, lead_email: e.target.value })}
                    placeholder="club@iiitranchi.ac.in"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-meet">Meeting Schedule</Label>
                <Input
                  id="edit-meet"
                  value={editForm.meeting_info}
                  onChange={(e) => setEditForm({ ...editForm, meeting_info: e.target.value })}
                  placeholder="e.g. Every Thursday 5 PM, Lab 1"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-tags">Focus Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="e.g. photography, sketching, robotics, debate"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingClub(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Club"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Club Confirmation Dialog */}
      {deletingClub && (
        <Dialog open={!!deletingClub} onOpenChange={() => setDeletingClub(null)}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-1.5">
                <Trash2 className="h-5 w-5" />
                Delete Club
              </DialogTitle>
              <DialogDescription className="text-xs pt-1.5 leading-relaxed">
                Are you sure you want to delete <strong>{deletingClub.name}</strong> (
                {deletingClub.code})? This will permanently remove the club from CampusOne and
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingClub(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isSubmitting}
                onClick={handleDeleteClub}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
