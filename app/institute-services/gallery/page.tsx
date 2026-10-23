"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Image as ImageIcon, Plus, ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { fetchGalleryImages, createGalleryImage, type GalleryImageType } from "@/lib/supabase"

export default function GalleryPage() {
  const { user } = useAuth()
  const [images, setImages] = useState<GalleryImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [previewImage, setPreviewImage] = useState<GalleryImageType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Campus Life",
    event_name: "",
    image_url: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const res = await fetchGalleryImages()
    setImages(res)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchGalleryImages().then((res) => {
      if (isMounted) {
        setImages(res)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = images.filter((img) => categoryFilter === "All" || img.category === categoryFilter)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const res = await createGalleryImage({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category.trim(),
        event_name: form.event_name.trim() || undefined,
        image_url: form.image_url.trim(),
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to upload", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Photo added!", description: "Image is now visible in the campus gallery." })
        setShowAddModal(false)
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
            <ImageIcon className="h-3.5 w-3.5" />
            Institute Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Glimpses of cultural fests, technical hackathons, sports tournaments, and convocations at IIIT Ranchi
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["All", "Technical", "Cultural", "Sports", "Academic", "Campus Life"].map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? "default" : "outline"}
            className={categoryFilter === cat ? "bg-black text-white hover:bg-neutral-800 text-xs" : "text-xs border-border"}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No gallery photos in this category</h3>
          <p className="text-xs text-muted-foreground mt-1">Upload event snapshots to preserve memories.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => setPreviewImage(item)}
              className="border-border overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
            >
              <div className="h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-[10px] bg-black/60 text-white backdrop-blur border-none">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h3>
                {item.event_name && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.event_name}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-black text-white">
            <DialogHeader className="sr-only">
              <DialogTitle>{previewImage.title}</DialogTitle>
              <DialogDescription>{previewImage.description || previewImage.title}</DialogDescription>
            </DialogHeader>
            <div className="relative h-[60vh] max-h-[70vh] w-full overflow-hidden flex items-center justify-center bg-black">
              <Image
                src={previewImage.image_url}
                alt={previewImage.title}
                fill
                sizes="700px"
                className="object-contain"
              />
            </div>
            <div className="p-5 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-white border-neutral-700">{previewImage.category}</Badge>
                <span className="text-xs text-neutral-400">{previewImage.event_name}</span>
              </div>
              <h3 className="text-lg font-bold">{previewImage.title}</h3>
              {previewImage.description && (
                <p className="text-xs text-neutral-300 leading-relaxed pt-1">{previewImage.description}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Photo Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Campus Photo</DialogTitle>
            <DialogDescription>Submit photos from recent college fests, sports, or hackathons</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title">Photo Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Cultural Fest Dance Performance"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="cat">Category *</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Campus Life">Campus Life</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ev">Event Name</Label>
                <Input
                  id="ev"
                  value={form.event_name}
                  onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                  placeholder="e.g. Kavach 2025"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="url">Image URL *</Label>
              <Input
                id="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc">Caption / Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Brief caption..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Adding..." : "Upload Photo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
