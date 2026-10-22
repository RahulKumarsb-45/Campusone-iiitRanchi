"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, Search, Plus, MapPin, Calendar, ExternalLink, ArrowLeft, Clock } from "lucide-react"

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
import { fetchInternships, createInternship, isStaffOrAdmin, type InternshipType } from "@/lib/supabase"

export default function InternshipsPage() {
  const { user } = useAuth()
  const [internships, setInternships] = useState<InternshipType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "",
    company: "",
    role_type: "Software Engineering",
    stipend: "",
    location: "",
    deadline: "",
    eligibility: "",
    description: "",
    apply_link: "",
  })

  const loadData = async () => {
    setLoading(true)
    const res = await fetchInternships()
    setInternships(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = internships.filter(
    (item) =>
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.role_type.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isStaffOrAdmin(user.role)) {
      toast({
        title: "Permission Denied",
        description: "Only verified campus coordinators, faculty, and administrators may post research or corporate internships.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)

    try {
      const res = await createInternship({
        title: form.title.trim(),
        company: form.company.trim(),
        role_type: form.role_type.trim(),
        stipend: form.stipend.trim(),
        location: form.location.trim(),
        deadline: new Date(form.deadline).toISOString(),
        eligibility: form.eligibility.trim(),
        description: form.description.trim(),
        apply_link: form.apply_link.trim() || undefined,
        user_id: user.id,
      })

      if (res.error) {
        toast({ title: "Failed to post internship", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Internship posted", description: "Opportunity is now listed on CampusOne." })
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
            <Briefcase className="h-3.5 w-3.5" />
            Campus Services
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Internship Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Research and corporate internships curated for IIIT Ranchi students
          </p>
        </div>

        {isStaffOrAdmin(user?.role) && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Post Opportunity
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, role, or location..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-semibold text-base">No internships currently listed</h3>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for new recruitment updates.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border-border flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="text-xs font-semibold">{item.role_type}</Badge>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.stipend}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground">{item.title}</CardTitle>
                <CardDescription className="font-semibold text-foreground text-xs">{item.company}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-muted-foreground pt-0">
                <p className="line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="space-y-1 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-foreground shrink-0" />
                    <span>Deadline: <strong>{new Date(item.deadline).toLocaleDateString()}</strong></span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    <strong>Eligibility:</strong> {item.eligibility}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border">
                {item.apply_link ? (
                  <Button asChild size="sm" className="w-full bg-black text-white hover:bg-neutral-800 text-xs gap-1.5">
                    <a href={item.apply_link} target="_blank" rel="noopener noreferrer">
                      Apply Now <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                    Apply on Campus Notice Board
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Post Internship Opportunity</DialogTitle>
            <DialogDescription>Submit a research or corporate internship drive for students</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="title">Role Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. SDE Intern"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="comp">Company *</Label>
                <Input
                  id="comp"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Google India"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="stipend">Stipend *</Label>
                <Input
                  id="stipend"
                  value={form.stipend}
                  onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                  placeholder="₹80,000 / month"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="loc">Location *</Label>
                <Input
                  id="loc"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Bangalore / Hybrid"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dead">Application Deadline *</Label>
                <Input
                  id="dead"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link">Application Link</Label>
                <Input
                  id="link"
                  value={form.apply_link}
                  onChange={(e) => setForm({ ...form, apply_link: e.target.value })}
                  placeholder="https://careers..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="elig">Eligibility Criteria *</Label>
              <Input
                id="elig"
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                placeholder="B.Tech 3rd year CSE/ECE CGPA 7.5+"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc">Description *</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Responsibilities, technical stack, interview stages"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-black text-white hover:bg-neutral-800">
                {isSubmitting ? "Publishing..." : "Publish Internship"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
