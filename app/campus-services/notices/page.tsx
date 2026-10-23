"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, Search, Plus, ArrowLeft, Calendar, Building, AlertTriangle, Pencil, Trash2 } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  isStaffOrAdmin,
  type NoticeType,
} from "@/lib/supabase"

export default function CollegeNoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<NoticeType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editingNotice, setEditingNotice] = useState<NoticeType | null>(null)
  const [deletingNoticeId, setDeletingNoticeId] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: "",
    content: "",
    department: "Academic Affairs",
    priority: "Normal" as NoticeType["priority"],
    target_audience: "All Students",
    file_url: "",
  })

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    department: "",
    priority: "Normal" as NoticeType["priority"],
    target_audience: "",
    file_url: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const res = await fetchNotices("college")
    setNotices(res)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchNotices("college").then((res) => {
      if (isMounted) {
        setNotices(res)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = notices.filter((n) => {
    const matchesSearch =
      search === "" ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.department.toLowerCase().includes(search.toLowerCase())

    const matchesPriority = priorityFilter === "All" || n.priority === priorityFilter

    return matchesSearch && matchesPriority
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!isStaffOrAdmin(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only verified faculty and administrative staff may publish official college notices.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await createNotice({
        title: form.title.trim(),
        content: form.content.trim(),
        department: form.department.trim(),
        priority: form.priority,
        notice_type: "college",
        target_audience: form.target_audience.trim(),
        file_url: form.file_url.trim() || undefined,
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to publish notice", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Notice published", description: "Circular is now live on CampusOne." })
        setShowAddModal(false)
        setForm({
          title: "",
          content: "",
          department: "Academic Affairs",
          priority: "Normal",
          target_audience: "All Students",
          file_url: "",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (notice: NoticeType) => {
    setEditingNotice(notice)
    setEditForm({
      title: notice.title,
      content: notice.content,
      department: notice.department,
      priority: notice.priority,
      target_audience: notice.target_audience,
      file_url: notice.file_url || "",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNotice || !user || !isStaffOrAdmin(user.role)) return

    setIsSubmitting(true)
    try {
      const res = await updateNotice(editingNotice.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        department: editForm.department.trim(),
        priority: editForm.priority,
        target_audience: editForm.target_audience.trim(),
        file_url: editForm.file_url.trim() || undefined,
      })

      if (res.error) {
        toast({ title: "Failed to update notice", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Notice updated", description: "Changes have been saved successfully." })
        setEditingNotice(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteNotice = async () => {
    if (!deletingNoticeId || !user || !isStaffOrAdmin(user.role)) return

    try {
      const res = await deleteNotice(deletingNoticeId)
      if (res.error) {
        toast({ title: "Failed to delete notice", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Notice deleted", description: "Circular has been permanently removed." })
        setDeletingNoticeId(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
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
            <Bell className="h-3.5 w-3.5" />
            Campus Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">College Notices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official academic, examination, and administrative circulars for IIIT Ranchi
          </p>
        </div>

        {user && isStaffOrAdmin(user.role) && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Publish Notice
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices by keyword, department, or circular title..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-card border-border">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="High">High Priority</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Bell className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No notices found</h3>
          <p className="text-xs text-muted-foreground mt-1">No circulars match your current filter settings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => (
            <Card key={notice.id} className="border-border hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs uppercase font-semibold">
                      {notice.department}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Target: {notice.target_audience}</span>
                  </div>
                  <Badge
                    variant={notice.priority === "High" ? "destructive" : "secondary"}
                    className="text-xs px-2.5"
                  >
                    {notice.priority} Priority
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground">{notice.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Published on {new Date(notice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pt-2">
                {notice.content}
              </CardContent>

              {user && isStaffOrAdmin(user.role) && (
                <CardFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => openEditModal(notice)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeletingNoticeId(notice.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publish College Notice</DialogTitle>
            <DialogDescription>Submit an official circular or announcement for students</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title">Notice Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Schedule for Mid-Term Exams"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dept">Issuing Department *</Label>
                <Input
                  id="dept"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Academic Affairs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pri">Priority Level *</Label>
                <Select value={form.priority} onValueChange={(val: any) => setForm({ ...form, priority: val })}>
                  <SelectTrigger id="pri"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="aud">Target Audience</Label>
              <Input
                id="aud"
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                placeholder="e.g. B.Tech 2nd & 3rd Year"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="content">Notice Content / Instructions *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Write the full circular notice text..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Publishing..." : "Publish Circular"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Modal */}
      <Dialog open={!!editingNotice} onOpenChange={(open) => { if (!open) setEditingNotice(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit College Notice</DialogTitle>
            <DialogDescription>Modify official circular details and target recipients</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="edit-title">Notice Title *</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-dept">Issuing Department *</Label>
                <Input
                  id="edit-dept"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-pri">Priority Level *</Label>
                <Select value={editForm.priority} onValueChange={(val: any) => setEditForm({ ...editForm, priority: val })}>
                  <SelectTrigger id="edit-pri"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-aud">Target Audience</Label>
              <Input
                id="edit-aud"
                value={editForm.target_audience}
                onChange={(e) => setEditForm({ ...editForm, target_audience: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-content">Notice Content / Instructions *</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={4}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingNotice(null)}>
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
      <AlertDialog open={!!deletingNoticeId} onOpenChange={(open) => { if (!open) setDeletingNoticeId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this official circular? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNotice}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
