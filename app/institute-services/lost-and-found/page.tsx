"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PackageSearch, Search, Plus, MapPin, Calendar, Phone, ArrowLeft, CheckCircle2, Trash2, Pencil } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchLostFoundItems,
  createLostFoundItem,
  updateLostFoundItem,
  updateLostFoundStatus,
  deleteLostFoundItem,
  type LostFoundItemType,
} from "@/lib/supabase"

export default function LostAndFoundPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<LostFoundItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LostFoundItemType | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    category: "Electronics",
    description: "",
    location: "",
    contact: "",
  })

  const [editForm, setEditForm] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    category: "Electronics",
    description: "",
    location: "",
    contact: "",
    status: "open" as "open" | "claimed" | "resolved",
  })

  const loadData = async () => {
    setLoading(true)
    const res = await fetchLostFoundItems()
    setItems(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())

    const matchesType = filterType === "all" || item.type === filterType

    return matchesSearch && matchesType
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to report a lost or found item." })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createLostFoundItem({
        type: form.type,
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        contact: form.contact.trim() || user.email,
        date: new Date().toISOString(),
        status: "open",
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to submit report", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Report submitted", description: `Item has been listed as ${form.type.toUpperCase()}.` })
        setShowAddModal(false)
        setForm({
          type: "lost",
          title: "",
          category: "Electronics",
          description: "",
          location: "",
          contact: "",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (item: LostFoundItemType) => {
    setEditingItem(item)
    setEditForm({
      type: item.type,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      contact: item.contact,
      status: item.status,
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setIsSubmitting(true)
    try {
      const res = await updateLostFoundItem(editingItem.id, {
        type: editForm.type,
        title: editForm.title.trim(),
        category: editForm.category.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        contact: editForm.contact.trim(),
        status: editForm.status,
      })

      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Report updated", description: "Item details updated successfully." })
        setEditingItem(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: "open" | "claimed" | "resolved") => {
    try {
      const res = await updateLostFoundStatus(id, newStatus)
      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Status updated", description: `Item marked as ${newStatus}.` })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsSubmitting(true)
    try {
      const res = await deleteLostFoundItem(deletingId)
      if (res.error) {
        toast({ title: "Delete failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Item deleted", description: "Listing has been removed." })
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
            <PackageSearch className="h-3.5 w-3.5" />
            Institute Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Lost & Found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Report misplaced belongings or help reunite found items with their owners across IIIT Ranchi
          </p>
        </div>

        <Button
          onClick={() => {
            if (!user) {
              toast({ title: "Sign in required", description: "Please sign in to report items." })
              return
            }
            setShowAddModal(true)
          }}
          className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Report Item
        </Button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item name, location, or description..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
          <SelectTrigger className="w-full sm:w-[150px] bg-card border-border">
            <SelectValue placeholder="All Items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="lost">Lost Items</SelectItem>
            <SelectItem value="found">Found Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-60 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No items reported</h3>
          <p className="text-xs text-muted-foreground mt-1">No lost or found reports match your search criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isOwnerOrAdmin = user && (user.id === item.user_id || user.role === "admin")
            const isResolved = item.status === "claimed" || item.status === "resolved"

            return (
              <Card key={item.id} className="border-border flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge
                      variant={item.type === "lost" ? "destructive" : "default"}
                      className={`text-xs uppercase font-bold ${
                        item.type === "found" ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {item.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Category: {item.category}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
                  <p className="line-clamp-3 leading-relaxed text-foreground/90">{item.description}</p>
                  <div className="space-y-1 pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Contact: <strong>{item.contact}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  {isOwnerOrAdmin && !isResolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1 gap-1 border-border"
                      onClick={() => handleStatusChange(item.id, "resolved")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Resolved
                    </Button>
                  )}
                  {isOwnerOrAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-2 gap-1"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingId(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  {!isOwnerOrAdmin && (
                    <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                      <a href={`tel:${item.contact.replace(/[^0-9]/g, "")}`}>
                        Contact Person
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Report Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Report Item</DialogTitle>
            <DialogDescription>Submit details about a lost or found personal item</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label>Report Type *</Label>
              <RadioGroup
                value={form.type}
                onValueChange={(val: any) => setForm({ ...form, type: val })}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 rounded-lg border border-border p-2">
                  <RadioGroupItem value="lost" id="type-lost" />
                  <Label htmlFor="type-lost" className="cursor-pointer text-xs font-semibold text-red-600">
                    I Lost an Item
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-border p-2">
                  <RadioGroupItem value="found" id="type-found" />
                  <Label htmlFor="type-found" className="cursor-pointer text-xs font-semibold text-emerald-600">
                    I Found an Item
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-1">
              <Label htmlFor="title">Item Name / Summary *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Black Dell Laptop Charger"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="cat">Category *</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Identification">ID Cards & Wallets</SelectItem>
                    <SelectItem value="Stationery / Essentials">Stationery & Essentials</SelectItem>
                    <SelectItem value="Clothing & Accessories">Clothing & Accessories</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="loc">Location *</Label>
                <Input
                  id="loc"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Lab 2, 2nd Floor"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Contact Details *</Label>
              <Input
                id="phone"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Phone or WhatsApp number"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc">Detailed Description *</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Distinctive marks, color, brand, exact time..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Item Details</DialogTitle>
            <DialogDescription>Modify report details, category or status</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Report Type</Label>
                <Select value={editForm.type} onValueChange={(val: any) => setEditForm({ ...editForm, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Resolution Status</Label>
                <Select value={editForm.status} onValueChange={(val: any) => setEditForm({ ...editForm, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-title">Item Name / Summary *</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-cat">Category *</Label>
                <Select value={editForm.category} onValueChange={(val) => setEditForm({ ...editForm, category: val })}>
                  <SelectTrigger id="edit-cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Identification">ID Cards & Wallets</SelectItem>
                    <SelectItem value="Stationery / Essentials">Stationery & Essentials</SelectItem>
                    <SelectItem value="Clothing & Accessories">Clothing & Accessories</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-loc">Location *</Label>
                <Input
                  id="edit-loc"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-phone">Contact Details *</Label>
              <Input
                id="edit-phone"
                value={editForm.contact}
                onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc">Detailed Description *</Label>
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
            <AlertDialogTitle>Delete Lost & Found Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
