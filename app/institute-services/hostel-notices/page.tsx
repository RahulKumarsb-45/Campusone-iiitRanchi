"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Building2,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Utensils,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react"

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

export default function HostelNoticesPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<NoticeType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<NoticeType | null>(null)
  const [deletingNoticeId, setDeletingNoticeId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isStaff = isStaffOrAdmin(user?.role)

  const [form, setForm] = useState({
    title: "",
    content: "",
    department: "Chief Warden Office",
    priority: "Normal" as NoticeType["priority"],
    target_audience: "Hostel Residents",
  })

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    department: "",
    priority: "Normal" as NoticeType["priority"],
    target_audience: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const res = await fetchNotices("hostel")
    if (res.error) {
      setLoadError(res.error)
      setNotices([])
    } else {
      setNotices(res)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchNotices("hostel").then((res) => {
      if (isMounted) {
        if (res.error) {
          setLoadError(res.error)
          setNotices([])
        } else {
          setNotices(res)
        }
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

    if (!isStaff) {
      toast({
        title: "Permission Denied",
        description: "Only authorized wardens and staff may publish official hostel notices.",
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
        notice_type: "hostel",
        target_audience: form.target_audience.trim(),
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to post hostel notice", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Hostel notice published", description: "Notice is now visible to residents." })
        setShowAddModal(false)
        setForm({
          title: "",
          content: "",
          department: "Chief Warden Office",
          priority: "Normal",
          target_audience: "Hostel Residents",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (notice: NoticeType) => {
    setEditingNotice(notice)
    setEditForm({
      title: notice.title,
      content: notice.content,
      department: notice.department,
      priority: notice.priority,
      target_audience: notice.target_audience || "Hostel Residents",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNotice) return

    if (!isStaff) {
      toast({
        title: "Permission Denied",
        description: "Only authorized staff can edit hostel notices.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateNotice(editingNotice.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        department: editForm.department.trim(),
        priority: editForm.priority,
        target_audience: editForm.target_audience.trim(),
      })

      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Notice updated", description: "Hostel circular has been updated." })
        setEditingNotice(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!deletingNoticeId) return
    const targetId = deletingNoticeId

    if (!isStaff) {
      toast({
        title: "Permission Denied",
        description: "Only authorized staff can delete hostel notices.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await deleteNotice(targetId)
      if (res.error) {
        toast({ title: "Delete failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Notice deleted", description: "Hostel circular has been removed." })
        setNotices((prev) => prev.filter((n) => n.id !== targetId))
        setDeletingNoticeId(null)
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
            <Building2 className="h-3.5 w-3.5" />
            Institute Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Hostel Notices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hostel rules, mess menu revisions, room maintenance, and warden circulars for IIIT Ranchi residents
          </p>
        </div>

        {/* Role-governed action button: Only staff/warden/admin can publish */}
        {isStaff && (
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
            placeholder="Search hostel or mess notices..."
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
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-semibold text-base">Unable to load hostel notices</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No hostel notices</h3>
          <p className="text-xs text-muted-foreground mt-1">No circulars currently issued for hostel residents.</p>
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={notice.priority === "High" ? "destructive" : "secondary"}
                      className="text-xs px-2.5"
                    >
                      {notice.priority} Priority
                    </Badge>

                    {/* Staff/Admin Edit & Delete controls */}
                    {isStaff && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(notice)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => setDeletingNoticeId(notice.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground">{notice.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Published on {new Date(notice.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pt-2">
                {notice.content}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publish Hostel Circular</DialogTitle>
            <DialogDescription>Submit circulars regarding hostel timings, maintenance, or mess</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title">Notice Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mess Fee Schedule & Menu Revision"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dept">Issuing Authority *</Label>
                <Input
                  id="dept"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Chief Warden Office"
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
                placeholder="e.g. Boys Hostel 1 / Girls Hostel"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="content">Notice Text *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Write the full instructions or details..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Publishing..." : "Publish Hostel Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Modal */}
      <Dialog open={!!editingNotice} onOpenChange={() => setEditingNotice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Hostel Notice</DialogTitle>
            <DialogDescription>Modify notice title, department, priority or content</DialogDescription>
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
                <Label htmlFor="edit-dept">Issuing Authority *</Label>
                <Input
                  id="edit-dept"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-pri">Priority Level *</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(val: any) => setEditForm({ ...editForm, priority: val })}
                >
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
              <Label htmlFor="edit-content">Notice Text *</Label>
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

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingNoticeId} onOpenChange={(open) => !open && setDeletingNoticeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete hostel notice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this notice from the hostel circulars board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleDelete(e)}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Notice"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
