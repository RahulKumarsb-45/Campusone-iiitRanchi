"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GraduationCap, Search, Plus, MapPin, Calendar, ExternalLink, ArrowLeft, Building2 } from "lucide-react"

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
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fetchPlacements, createPlacement, type PlacementType } from "@/lib/supabase"

export default function PlacementsPage() {
  const { user } = useAuth()
  const [placements, setPlacements] = useState<PlacementType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
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

  const loadData = async () => {
    setLoading(true)
    const res = await fetchPlacements()
    setPlacements(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
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
    if (!user) return
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

        {user && (
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

              <CardFooter className="pt-3 border-t border-border">
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
    </div>
  )
}
