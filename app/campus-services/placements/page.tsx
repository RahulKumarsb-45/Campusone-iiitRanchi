"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { GraduationCap, Search, Plus, MapPin, Calendar, ExternalLink, ArrowLeft, Building2, Pencil, Trash2, AlertCircle, RefreshCw } from "lucide-react"

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchPlacements, createPlacement, updatePlacement, deletePlacement, isStaffOrAdmin, type PlacementType } from "@/lib/supabase"

export default function PlacementsPage() {
  const { user } = useAuth()
  const [placements, setPlacements] = useState<PlacementType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PlacementType | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    company: "",
    role: "",
    ctc: "",
    eligibility: "",
    drive_date: "",
    location: "IIIT Ranchi Campus / Virtual",
    description: "",
    apply_link: "",
  })

  const [editForm, setEditForm] = useState({
    company: "",
    role: "",
    ctc: "",
    eligibility: "",
    drive_date: "",
    location: "",
    description: "",
    apply_link: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const res = await fetchPlacements()
    if (res.error) {
      setLoadError(res.error)
      setPlacements([])
    } else {
      setPlacements(res)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchPlacements().then((res) => {
      if (isMounted) {
        if (res.error) {
          setLoadError(res.error)
          setPlacements([])
        } else {
          setPlacements(res)
        }
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = placements.filter(
    (item) =>
      search === "" ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.ctc.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isStaffOrAdmin(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only verified TPO staff, faculty, and administrators may post placement drives.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)

    try {
      const res = await createPlacement({
        company: form.company.trim(),
        role: form.role.trim(),
        ctc: form.ctc.trim(),
        eligibility: form.eligibility.trim(),
        drive_date: new Date(form.drive_date).toISOString(),
        location: form.location.trim(),
        description: form.description.trim(),
        apply_link: form.apply_link.trim() || undefined,
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to post drive", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Placement drive added", description: "Schedule is now available to students." })
        setShowAddModal(false)
        setForm({
          company: "",
          role: "",
          ctc: "",
          eligibility: "",
          drive_date: "",
          location: "IIIT Ranchi Campus / Virtual",
          description: "",
          apply_link: "",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (item: PlacementType) => {
    setEditingItem(item)
    setEditForm({
      company: item.company,
      role: item.role,
      ctc: item.ctc,
      eligibility: item.eligibility,
      drive_date: item.drive_date ? item.drive_date.split("T")[0] : "",
      location: item.location,
      description: item.description,
      apply_link: item.apply_link || "",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setIsSubmitting(true)
    try {
      const res = await updatePlacement(editingItem.id, {
        company: editForm.company.trim(),
        role: editForm.role.trim(),
        ctc: editForm.ctc.trim(),
        eligibility: editForm.eligibility.trim(),
        drive_date: new Date(editForm.drive_date).toISOString(),
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        apply_link: editForm.apply_link.trim() || undefined,
      })

      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Drive updated", description: "Changes saved successfully." })
        setEditingItem(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsSubmitting(true)
    try {
      const res = await deletePlacement(deletingId)
      if (res.error) {
        toast({ title: "Deletion failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Drive deleted", description: "Placement drive removed successfully." })
        setDeletingId(null)
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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <GraduationCap className="h-3.5 w-3.5" />
            Training & Placement Cell
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Placement Drives</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official recruitment drives, packages, and eligibility for graduating batches at IIIT Ranchi
          </p>
        </div>

        {isStaffOrAdmin(user?.role) && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Placement Drive
          </Button>
        )}
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, role, or CTC..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-semibold text-base">Unable to load placement drives</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No active placement drives</h3>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for new recruiting notices.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border-border flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge className="bg-black text-white text-xs font-semibold">Campus Drive</Badge>
                  <span className="text-base font-black text-foreground">{item.ctc}</span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{item.company}</CardTitle>
                <CardDescription className="font-semibold text-muted-foreground text-xs">{item.role}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
                <p className="line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>Drive Date: <strong>{new Date(item.drive_date).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  <p className="text-[11px] pt-1">
                    <strong>Eligibility:</strong> {item.eligibility}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 pt-3 border-t border-border">
                {item.apply_link ? (
                  <Button asChild size="sm" className="w-full bg-black text-white hover:bg-neutral-800 text-xs gap-1.5">
                    <a href={item.apply_link} target="_blank" rel="noopener noreferrer">
                      Registration Portal <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                    Register via TPO Cell
                  </Button>
                )}

                {isStaffOrAdmin(user?.role) && (
                  <div className="flex items-center gap-2 w-full pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                      className="flex-1 text-xs gap-1 h-8"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingId(item.id)}
                      className="flex-1 text-xs gap-1 h-8"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Placement Drive</DialogTitle>
            <DialogDescription>Submit a corporate campus recruitment drive schedule</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="comp">Company Name *</Label>
                <Input
                  id="comp"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Atlassian"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">Designation / Role *</Label>
                <Input
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. SDE Graduate"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ctc">Package (CTC) *</Label>
                <Input
                  id="ctc"
                  value={form.ctc}
                  onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                  placeholder="e.g. ₹32 LPA"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ddate">Drive Date *</Label>
                <Input
                  id="ddate"
                  type="date"
                  value={form.drive_date}
                  onChange={(e) => setForm({ ...form, drive_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="elig">Eligibility Criteria *</Label>
              <Input
                id="elig"
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                placeholder="e.g. B.Tech CSE/ECE CGPA 7.5+ with no active backlogs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="loc">Venue / Drive Mode *</Label>
                <Input
                  id="loc"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Virtual Assessment & Campus Interviews"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link">Registration / TPO Link</Label>
                <Input
                  id="link"
                  value={form.apply_link}
                  onChange={(e) => setForm({ ...form, apply_link: e.target.value })}
                  placeholder="https://tpo.iiitranchi.ac.in"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc">Drive Details & Procedure *</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Online test details, PPT timing, and interview rounds..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Publishing..." : "Publish Drive"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Placement Drive</DialogTitle>
            <DialogDescription>Update corporate drive details and registration requirements</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-comp">Company Name *</Label>
                <Input
                  id="edit-comp"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-role">Designation / Role *</Label>
                <Input
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-ctc">Package (CTC) *</Label>
                <Input
                  id="edit-ctc"
                  value={editForm.ctc}
                  onChange={(e) => setEditForm({ ...editForm, ctc: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-ddate">Drive Date *</Label>
                <Input
                  id="edit-ddate"
                  type="date"
                  value={editForm.drive_date}
                  onChange={(e) => setEditForm({ ...editForm, drive_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-elig">Eligibility Criteria *</Label>
              <Input
                id="edit-elig"
                value={editForm.eligibility}
                onChange={(e) => setEditForm({ ...editForm, eligibility: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-loc">Venue / Drive Mode *</Label>
                <Input
                  id="edit-loc"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-link">Registration / TPO Link</Label>
                <Input
                  id="edit-link"
                  value={editForm.apply_link}
                  onChange={(e) => setEditForm({ ...editForm, apply_link: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc">Drive Details & Procedure *</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Placement Drive?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This corporate recruitment drive will be permanently removed from the portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Drive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
