"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Search, Plus, Mail, Calendar, Sparkles, Filter, ExternalLink, Pencil, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchClubs, createClub, updateClub, deleteClub, isStaffOrAdmin, type ClubType } from "@/lib/supabase"

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
    if (club.lead_email && user.email && club.lead_email.toLowerCase() === user.email.toLowerCase()) return true
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
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        description: form.description.trim(),
        lead_name: form.lead_name.trim(),
        lead_email: form.lead_email.trim(),
        meeting_info: form.meeting_info.trim(),
        image: form.image.trim() || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
    setEditForm({
      name: club.name,
      code: club.code,
      category: club.category,
      description: club.description,
      lead_name: club.lead_name,
      lead_email: club.lead_email || "",
      meeting_info: club.meeting_info || "",
      image: club.image || "",
      tags: Array.isArray(club.tags) ? club.tags.join(", ") : "",
    })
  }

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClub || !user) return

    if (!editForm.name.trim() || !editForm.code.trim() || !editForm.lead_name.trim() || !editForm.description.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required club details.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        category: editForm.category,
        description: editForm.description.trim(),
        lead_name: editForm.lead_name.trim(),
        lead_email: editForm.lead_email.trim(),
        meeting_info: editForm.meeting_info.trim(),
        image: editForm.image.trim() || editingClub.image,
        tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }

      const res = await updateClub(editingClub.id, payload)
      if (res.error) {
        toast({ title: "Failed to update club", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Club updated!", description: `${payload.name} details have been saved.` })
        setEditingClub(null)
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Users className="h-3.5 w-3.5" />
            IIIT Ranchi Student Societies
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Clubs & Societies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover student clubs, upcoming sessions, workshops, and leadership contacts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              onClick={() => setShowAddModal(true)}
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
          <p className="text-xs text-muted-foreground mt-1">Try selecting another category or clear search query.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => {
            const hasPrivilege = canManageClub(club)
            return (
              <Card key={club.id} id={`club-${club.id}`} className="border-border overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img src={club.image} alt={club.name} className="h-full w-full object-cover" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs font-semibold">{club.category}</Badge>
                      <span className="text-xs font-bold text-muted-foreground">{club.code}</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">{club.name}</CardTitle>
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
                        <span>Lead: <strong>{club.lead_name}</strong></span>
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
                          title="Edit club details"
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline">{selectedClub.category}</Badge>
                <span className="text-xs font-bold text-muted-foreground">{selectedClub.code}</span>
              </div>
              <DialogTitle className="text-xl font-bold">{selectedClub.name}</DialogTitle>
              <DialogDescription className="text-xs leading-relaxed pt-2">
                {selectedClub.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 border-y border-border text-xs">
              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">Regular Meetings & Venue</p>
                <p className="font-medium text-foreground mt-0.5">{selectedClub.meeting_info || "Scheduled weekly"}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">Club Lead</p>
                <p className="font-medium text-foreground mt-0.5">{selectedClub.lead_name} ({selectedClub.lead_email || "contact via IIIT Ranchi mail"})</p>
              </div>
              {selectedClub.tags && selectedClub.tags.length > 0 && (
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] mb-1">Focus Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedClub.tags.map((t) => (
                      <span key={t} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClub(null)}
                >
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Club Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register Student Club</DialogTitle>
            <DialogDescription>Submit a new student club or chapter for IIIT Ranchi</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClub} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cname">Club Name *</Label>
              <Input
                id="cname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cyber Security Society"
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
                  placeholder="e.g. CYBER"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cat">Category *</Label>
                <Select value={form.category} onValueChange={(val: any) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
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
              <Label htmlFor="cdesc">Description *</Label>
              <Textarea
                id="cdesc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Club mission and activities"
                required
              />
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
                placeholder="e.g. security, networking, ctfs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Club: {editingClub.name}</DialogTitle>
              <DialogDescription>Update details, leadership, or meeting schedule for this club</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateClub} className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <Label htmlFor="edit-cname">Club Name *</Label>
                <Input
                  id="edit-cname"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Cyber Security Society"
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
                    placeholder="e.g. CYBER"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-cat">Category *</Label>
                  <Select value={editForm.category} onValueChange={(val: any) => setEditForm({ ...editForm, category: val })}>
                    <SelectTrigger id="edit-cat"><SelectValue /></SelectTrigger>
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
                <Label htmlFor="edit-cdesc">Description *</Label>
                <Textarea
                  id="edit-cdesc"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  placeholder="Club mission and activities"
                  required
                />
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
                  placeholder="e.g. security, networking, ctfs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingClub(null)}>
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
                Are you sure you want to delete <strong>{deletingClub.name}</strong> ({deletingClub.code})? This will permanently remove the club from CampusOne and cannot be undone.
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
