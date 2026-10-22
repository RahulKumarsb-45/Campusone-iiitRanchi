"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Wrench,
  Search,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building,
  User,
  ShieldAlert,
  ChevronRight,
  Filter,
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
  fetchHostelComplaints,
  createHostelComplaint,
  updateHostelComplaintStatus,
  deleteHostelComplaint,
  isStaffOrAdmin,
  type HostelComplaintType,
} from "@/lib/supabase"

export default function HostelComplaintsPage() {
  const { user, loading: authLoading } = useAuth()
  const [complaints, setComplaints] = useState<HostelComplaintType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Status update modal for wardens/admin
  const [selectedComplaint, setSelectedComplaint] = useState<HostelComplaintType | null>(null)
  const [updateStatus, setUpdateStatus] = useState<"In Progress" | "Resolved" | "Rejected">("In Progress")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCancelAlert, setShowCancelAlert] = useState<number | null>(null)

  const [form, setForm] = useState({
    hostel_block: "Hostel B" as HostelComplaintType["hostel_block"],
    room_number: "",
    category: "Electrical" as HostelComplaintType["category"],
    title: "",
    description: "",
  })

  const loadData = async () => {
    setLoading(true)
    const isStaff = isStaffOrAdmin(user?.role)
    const res = await fetchHostelComplaints({
      userId: user?.id,
      isStaff,
      status: statusFilter,
    })
    setComplaints(res)
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading) {
      loadData()
    }
  }, [user, authLoading, statusFilter])

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.room_number.toLowerCase().includes(search.toLowerCase()) ||
      c.student_name.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a hostel maintenance complaint.",
      })
      return
    }

    if (!form.room_number.trim() || !form.title.trim() || !form.description.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in your room number, complaint title, and description.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await createHostelComplaint({
        user_id: user.id,
        student_name: user.name || "Student",
        student_email: user.email || "",
        hostel_block: form.hostel_block,
        room_number: form.room_number.trim(),
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
      })

      if (res.error) {
        toast({ title: "Submission failed", description: res.error, variant: "destructive" })
      } else {
        toast({
          title: "Complaint registered",
          description: "Your hostel maintenance request has been submitted to the hostel warden.",
        })
        setShowAddModal(false)
        setForm({
          hostel_block: "Hostel B",
          room_number: "",
          category: "Electrical",
          title: "",
          description: "",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdateSubmit = async () => {
    if (!selectedComplaint) return

    if (updateStatus === "Rejected" && !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please explain why the complaint cannot be addressed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateHostelComplaintStatus(selectedComplaint.id, updateStatus, {
        rejection_reason: updateStatus === "Rejected" ? rejectionReason.trim() : undefined,
        resolution_notes: updateStatus === "Resolved" ? resolutionNotes.trim() : undefined,
        assigned_to: assignedTo.trim() || undefined,
      })

      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({
          title: "Complaint updated",
          description: `Ticket #${selectedComplaint.id} marked as ${updateStatus}.`,
        })
        setShowStatusModal(false)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelComplaint = async (id: number) => {
    try {
      const res = await deleteHostelComplaint(id)
      if (res.error) {
        toast({ title: "Cancellation failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Complaint cancelled", description: "Your ticket has been removed." })
        setShowCancelAlert(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const getStatusBadge = (status: HostelComplaintType["status"]) => {
    switch (status) {
      case "Open":
        return (
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold gap-1">
            <Clock className="h-3 w-3" /> Open
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold gap-1">
            <Wrench className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "Resolved":
        return (
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isStaff = isStaffOrAdmin(user?.role)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-foreground mb-2">
            <Wrench className="h-3.5 w-3.5" />
            Institute & Hostel Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Hostel Complaints & Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official ticketing system for hostel room maintenance, electrical, plumbing, and facility repairs at IIIT Ranchi
          </p>
        </div>

        {user ? (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Lodge Complaint
          </Button>
        ) : (
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/auth/login?next=/institute-services/hostel-complaints">Sign In to Lodge Complaint</Link>
          </Button>
        )}
      </div>

      {/* Role notice banner if staff/admin */}
      {isStaff && (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Warden / Staff Console Active:</strong> You are viewing complaints across all hostel wings with authority to update ticket statuses and assign repair personnel.
            </span>
          </div>
          <Badge className="bg-blue-600 text-white shrink-0 capitalize">{user?.role}</Badge>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by keyword, room, or issue..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-card border-border">
            <SelectValue placeholder="Category Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Electrical">Electrical</SelectItem>
            <SelectItem value="Plumbing">Plumbing</SelectItem>
            <SelectItem value="Carpentry">Carpentry</SelectItem>
            <SelectItem value="Internet/Wi-Fi">Internet/Wi-Fi</SelectItem>
            <SelectItem value="Cleanliness">Cleanliness</SelectItem>
            <SelectItem value="Mess">Mess</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Wrench className="h-10 w-10 text-muted-foreground mb-3 opacity-60" />
          <h3 className="text-base font-bold">No complaints found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {complaints.length === 0
              ? "You have not lodged any maintenance complaints yet."
              : "No complaints match your active search filters."}
          </p>
          {user && complaints.length === 0 && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Lodge a Maintenance Request
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="border-border overflow-hidden transition-all hover:border-foreground/30">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground">#{item.id}</span>
                    <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {item.category}
                    </Badge>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <CardDescription className="flex flex-wrap items-center gap-3 text-xs mt-1">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.hostel_block} — Room {item.room_number}
                  </span>
                  <span>•</span>
                  <span>Reported by {item.student_name}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-3 text-sm">
                <p className="text-muted-foreground whitespace-pre-line text-xs">{item.description}</p>

                {item.assigned_to && (
                  <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 p-2 text-xs flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span><strong>Assigned Staff:</strong> {item.assigned_to}</span>
                  </div>
                )}

                {item.status === "Resolved" && item.resolution_notes && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolution Details
                    </p>
                    <p className="text-foreground/90">{item.resolution_notes}</p>
                  </div>
                )}

                {item.status === "Rejected" && item.rejection_reason && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs space-y-1">
                    <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> Rejection Notice
                    </p>
                    <p className="text-foreground/90">{item.rejection_reason}</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 pb-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>

                <div className="flex items-center gap-2">
                  {/* Student cancellation of open complaint */}
                  {user && user.id === item.user_id && item.status === "Open" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCancelAlert(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 text-xs"
                    >
                      Withdraw Request
                    </Button>
                  )}

                  {/* Warden / Admin Status Update Button */}
                  {isStaff && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComplaint(item)
                        setUpdateStatus(item.status === "Open" ? "In Progress" : (item.status as any))
                        setAssignedTo(item.assigned_to || "")
                        setResolutionNotes(item.resolution_notes || "")
                        setRejectionReason(item.rejection_reason || "")
                        setShowStatusModal(true)
                      }}
                      className="h-7 text-xs gap-1 border-border"
                    >
                      Update Status
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Lodge New Complaint */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lodge Hostel Maintenance Complaint</DialogTitle>
            <DialogDescription>
              Submit an issue for repair. The hostel maintenance caretaker will review and schedule an inspection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hostel_block">Hostel Block *</Label>
                <Select
                  value={form.hostel_block}
                  onValueChange={(val: any) => setForm({ ...form, hostel_block: val })}
                >
                  <SelectTrigger id="hostel_block">
                    <SelectValue placeholder="Select Hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hostel A">Hostel A (Boys)</SelectItem>
                    <SelectItem value="Hostel B">Hostel B (Boys)</SelectItem>
                    <SelectItem value="Hostel C">Hostel C (Boys)</SelectItem>
                    <SelectItem value="Girls Hostel">Girls Hostel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  placeholder="e.g. 204 or B-312"
                  value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Issue Category *</Label>
              <Select
                value={form.category}
                onValueChange={(val: any) => setForm({ ...form, category: val })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrical">Electrical (Fan, Switch, Light, Socket)</SelectItem>
                  <SelectItem value="Plumbing">Plumbing (Tap, Washroom, Geyser, Drain)</SelectItem>
                  <SelectItem value="Carpentry">Carpentry (Bed, Chair, Door Lock, Almirah)</SelectItem>
                  <SelectItem value="Internet/Wi-Fi">Internet / Wi-Fi Access Point</SelectItem>
                  <SelectItem value="Cleanliness">Corridor / Common Area Hygiene</SelectItem>
                  <SelectItem value="Mess">Mess Facility / Food Complaint</SelectItem>
                  <SelectItem value="Other">Other Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Issue Summary *</Label>
              <Input
                id="title"
                placeholder="Brief summary of the defect"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Explain the specific issue, when it started, and your preferred inspection time..."
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Warden Status Update */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Ticket #{selectedComplaint?.id} — {selectedComplaint?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Target Status</Label>
              <Select value={updateStatus} onValueChange={(val: any) => setUpdateStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Progress">In Progress (Assigned to technician)</SelectItem>
                  <SelectItem value="Resolved">Resolved (Work completed)</SelectItem>
                  <SelectItem value="Rejected">Rejected (Out of scope or invalid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assigned">Assigned Repair Personnel / Cell</Label>
              <Input
                id="assigned"
                placeholder="e.g. Electrician Sharma / IT Cell"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>

            {updateStatus === "Resolved" && (
              <div className="space-y-1.5">
                <Label htmlFor="resolution">Resolution Notes *</Label>
                <Textarea
                  id="resolution"
                  placeholder="Describe the action taken (e.g. replaced capacitor, serviced regulator)..."
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            )}

            {updateStatus === "Rejected" && (
              <div className="space-y-1.5">
                <Label htmlFor="rejection">Rejection Reason *</Label>
                <Textarea
                  id="rejection"
                  placeholder="Explain why this request is declined..."
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdateSubmit}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
            >
              {isSubmitting ? "Saving..." : "Update Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert to withdraw complaint */}
      <AlertDialog open={showCancelAlert !== null} onOpenChange={(open) => !open && setShowCancelAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel ticket #{showCancelAlert}? This will remove it from the warden's repair queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Ticket</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showCancelAlert && handleCancelComplaint(showCancelAlert)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Withdraw Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
