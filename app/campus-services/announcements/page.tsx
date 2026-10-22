"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Megaphone, Search, Plus, ArrowLeft, Calendar, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchAnnouncements, createAnnouncement, type AnnouncementType } from "@/lib/supabase"

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    urgent: false,
  })

  const loadData = async () => {
    setLoading(true)
    const res = await fetchAnnouncements()
    setAnnouncements(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = announcements.filter(
    (a) =>
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const res = await createAnnouncement({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        urgent: form.urgent,
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to broadcast announcement", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Announcement posted", description: "Broadcasted on CampusOne." })
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
            <Megaphone className="h-3.5 w-3.5" />
            Campus Broadcasts
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Campus Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            General institute broadcasts, fest announcements, and student notices at IIIT Ranchi
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Broadcast Update
          </Button>
        )}
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No announcements</h3>
          <p className="text-xs text-muted-foreground mt-1">Check back later for campus broadcasts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="border-border hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    {item.urgent && (
                      <Badge className="bg-red-600 text-white text-xs">Urgent Alert</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pt-1">
                {item.content}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Broadcast Announcement</DialogTitle>
            <DialogDescription>Submit a campus-wide notification for students and faculty</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title">Headline / Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Annual Fest Dates Finalized"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cat">Category *</Label>
              <Input
                id="cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Events, Academic, Sports"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Switch
                id="urg"
                checked={form.urgent}
                onCheckedChange={(val) => setForm({ ...form, urgent: val })}
              />
              <Label htmlFor="urg" className="font-semibold text-xs cursor-pointer">
                Mark as Urgent Alert
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="content">Announcement Message *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Details of the announcement..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Broadcasting..." : "Broadcast Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
