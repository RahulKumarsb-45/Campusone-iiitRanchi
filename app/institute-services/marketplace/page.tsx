"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Search, Plus, Tag, Phone, ArrowLeft, Trash2, CheckCircle2, Pencil, AlertCircle, RefreshCw } from "lucide-react"

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
  fetchMarketplaceItems,
  createMarketplaceItem,
  updateMarketplaceItem,
  updateMarketplaceStatus,
  deleteMarketplaceItem,
  isStaffOrAdmin,
  type MarketplaceItemType,
} from "@/lib/supabase"

const FALLBACK_MARKETPLACE_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"

export default function MarketplacePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<MarketplaceItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceItemType | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "Books & Notes",
    condition: "Good",
    contact: "",
    image: "",
  })

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "Books & Notes",
    condition: "Good",
    contact: "",
    image: "",
    status: "available" as "available" | "sold",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const res = await fetchMarketplaceItems()
    if (res.error) {
      setLoadError(res.error)
      setItems([])
    } else {
      setItems(res)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchMarketplaceItems().then((res) => {
      if (isMounted) {
        if (res.error) {
          setLoadError(res.error)
          setItems([])
        } else {
          setItems(res)
        }
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to list items for sale." })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createMarketplaceItem({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        category: form.category.trim(),
        condition: form.condition.trim(),
        contact: form.contact.trim() || user.email,
        status: "available",
        image: form.image.trim() || undefined,
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to list item", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Item listed!", description: "Your item is now live on Campus Marketplace." })
        setShowAddModal(false)
        setForm({
          title: "",
          description: "",
          price: 0,
          category: "Books & Notes",
          condition: "Good",
          contact: "",
          image: "",
        })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (item: MarketplaceItemType) => {
    setEditingItem(item)
    setEditForm({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      condition: item.condition,
      contact: item.contact,
      image: item.image || "",
      status: item.status,
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setIsSubmitting(true)
    try {
      const res = await updateMarketplaceItem(editingItem.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price) || 0,
        category: editForm.category.trim(),
        condition: editForm.condition.trim(),
        contact: editForm.contact.trim(),
        image: editForm.image.trim() || undefined,
        status: editForm.status,
      })

      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Listing updated", description: "Marketplace item has been updated." })
        setEditingItem(null)
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: number, status: "available" | "sold") => {
    try {
      const res = await updateMarketplaceStatus(id, status)
      if (res.error) {
        toast({ title: "Update failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Status updated", description: `Item marked as ${status}.` })
        loadData()
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!deletingId) return
    const targetId = deletingId
    setIsSubmitting(true)
    try {
      const res = await deleteMarketplaceItem(targetId)
      if (res.error) {
        toast({ title: "Delete failed", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Item removed", description: "Listing deleted from marketplace." })
        setItems((prev) => prev.filter((item) => item.id !== targetId))
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
            <ShoppingBag className="h-3.5 w-3.5" />
            Institute Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buy and sell books, mountain cycles, electronics, and hostel essentials inside IIIT Ranchi
          </p>
        </div>

        <Button
          onClick={() => {
            if (!user) {
              toast({ title: "Sign in required", description: "Please sign in to list items for sale." })
              return
            }
            setShowAddModal(true)
          }}
          className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Sell an Item
        </Button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books, bicycles, furniture, calculators..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Books & Notes">Books & Notes</SelectItem>
            <SelectItem value="Vehicles / Cycles">Vehicles / Cycles</SelectItem>
            <SelectItem value="Hostel Essentials">Hostel Essentials</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-semibold text-base">Unable to load marketplace items</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadData} className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No items listed</h3>
          <p className="text-xs text-muted-foreground mt-1">Be the first to list an item for sale in your batch.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isOwnerOrAdmin = user && (user.id === item.user_id || isStaffOrAdmin(user.role))
            const isSold = item.status === "sold"

            return (
              <Card key={item.id} className="border-border flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
                <div>
                  {item.image && (
                    <div className="relative h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={failedImages[item.id] ? FALLBACK_MARKETPLACE_IMAGE : item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <span className="text-lg font-black text-foreground">₹{item.price}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">{item.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Condition: <strong>{item.condition}</strong> · Status: <span className="capitalize font-semibold">{item.status}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
                    <p className="line-clamp-2 leading-relaxed text-foreground/90">{item.description}</p>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                      <Phone className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>{item.contact}</span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  {isOwnerOrAdmin && !isSold && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1 gap-1"
                      onClick={() => handleStatusChange(item.id, "sold")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Sold
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
                        Contact Seller
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Sell Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>List Item for Sale</DialogTitle>
            <DialogDescription>Sell your books, cycle, or essentials to fellow students</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title">Item Name *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Hero Mountain Cycle (21 gear)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 2500"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cat">Category *</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Books & Notes">Books & Notes</SelectItem>
                    <SelectItem value="Vehicles / Cycles">Vehicles / Cycles</SelectItem>
                    <SelectItem value="Hostel Essentials">Hostel Essentials</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="cond">Item Condition *</Label>
                <Select value={form.condition} onValueChange={(val) => setForm({ ...form, condition: val })}>
                  <SelectTrigger id="cond"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair / Usable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact">Contact Details *</Label>
                <Input
                  id="contact"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="Phone / WhatsApp / Room No"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="img">Image URL (Optional)</Label>
              <Input
                id="img"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc">Description *</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Include condition, accessories included, reason for sale..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Listing..." : "Post Listing"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>Modify details, price, condition or listing status</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-title">Item Name *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Listing Status</Label>
                <Select value={editForm.status} onValueChange={(val: any) => setEditForm({ ...editForm, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-cat">Category *</Label>
                <Select value={editForm.category} onValueChange={(val) => setEditForm({ ...editForm, category: val })}>
                  <SelectTrigger id="edit-cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Books & Notes">Books & Notes</SelectItem>
                    <SelectItem value="Vehicles / Cycles">Vehicles / Cycles</SelectItem>
                    <SelectItem value="Hostel Essentials">Hostel Essentials</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="edit-cond">Condition *</Label>
                <Select value={editForm.condition} onValueChange={(val) => setEditForm({ ...editForm, condition: val })}>
                  <SelectTrigger id="edit-cond"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair / Usable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-contact">Contact Details *</Label>
                <Input
                  id="edit-contact"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-img">Image URL (Optional)</Label>
              <Input
                id="edit-img"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc">Description *</Label>
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
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This item will be permanently removed from the Campus Marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleDelete(e)}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
