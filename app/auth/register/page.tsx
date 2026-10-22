"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, AtSign, Eye, EyeOff, Lock, Mail, User, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "faculty" | "guest",
    department: "",
    year: "",
    rollNumber: "",
    position: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields to continue.",
          variant: "destructive",
        })
        return
      }

      if (formData.password.length < 8) {
        toast({
          title: "Weak password",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        })
        return
      }

      if (formData.role === "guest") {
        // Guest does not require step 2 details
        proceedSignUp()
      } else {
        setStep(2)
      }
      return
    }

    proceedSignUp()
  }

  const proceedSignUp = async () => {
    setIsLoading(true)

    try {
      const userData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      }

      if (formData.role === "student") {
        if (!formData.department.trim() || !formData.year.trim() || !formData.rollNumber.trim()) {
          toast({
            title: "Missing academic details",
            description: "Please fill in department, academic year, and roll number.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        userData.department = formData.department.trim()
        userData.year = formData.year.trim()
        userData.roll_number = formData.rollNumber.trim()
      } else if (formData.role === "faculty") {
        if (!formData.department.trim() || !formData.position.trim()) {
          toast({
            title: "Missing academic details",
            description: "Please fill in department and academic position.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        userData.department = formData.department.trim()
        userData.position = formData.position.trim()
      }

      const result = await signUp(formData.email, formData.password, userData)

      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.requiresConfirmation) {
        setConfirmationSent(true)
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox to confirm your email.",
        })
        return
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to CampusOne IIIT Ranchi!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white dark:bg-black p-4 py-8">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">
                {confirmationSent ? "Verify Email" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {confirmationSent
                  ? "We sent a verification link to your email"
                  : "Join CampusOne — IIIT Ranchi Portal"}
              </CardDescription>
            </CardHeader>

            {confirmationSent ? (
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">Verification link sent</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We sent a confirmation link to <span className="font-semibold text-foreground">{formData.email}</span>. Click the link to complete your account setup.
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <Button asChild className="w-full bg-black text-white hover:bg-neutral-800">
                    <Link href="/auth/login">Proceed to Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {step === 1 ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="e.g. Priya Sharma"
                            className="pl-9"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="e.g. priya@iiitranchi.ac.in"
                            className="pl-9"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password (8+ characters) *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            className="pl-9 pr-9"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={8}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Role at IIIT Ranchi</Label>
                        <RadioGroup
                          value={formData.role}
                          onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                          className="grid grid-cols-3 gap-2"
                        >
                          <div className="flex items-center space-x-2 rounded-lg border border-border p-2">
                            <RadioGroupItem value="student" id="role-student" />
                            <Label htmlFor="role-student" className="cursor-pointer text-xs font-semibold">Student</Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border border-border p-2">
                            <RadioGroupItem value="faculty" id="role-faculty" />
                            <Label htmlFor="role-faculty" className="cursor-pointer text-xs font-semibold">Faculty</Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border border-border p-2">
                            <RadioGroupItem value="guest" id="role-guest" />
                            <Label htmlFor="role-guest" className="cursor-pointer text-xs font-semibold">Guest</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button type="submit" className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold mt-2">
                        {formData.role === "guest" ? "Create Account" : "Next: Academic Details →"}
                      </Button>
                    </>
                  ) : (
                    <>
                      {formData.role === "student" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="department">Department *</Label>
                            <Input
                              id="department"
                              placeholder="e.g. Computer Science and Engineering"
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year">Academic Year *</Label>
                            <Input
                              id="year"
                              placeholder="e.g. 2nd Year (2024-2028)"
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rollNumber">Roll Number *</Label>
                            <Input
                              id="rollNumber"
                              placeholder="e.g. 23BCS045"
                              value={formData.rollNumber}
                              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                              required
                            />
                          </div>
                        </>
                      )}

                      {formData.role === "faculty" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="department">Department *</Label>
                            <Input
                              id="department"
                              placeholder="e.g. Computer Science"
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position">Designation *</Label>
                            <Input
                              id="position"
                              placeholder="e.g. Assistant Professor"
                              value={formData.position}
                              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                              required
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading} className="flex-1">
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
                        >
                          {isLoading ? "Creating..." : "Complete Signup"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            )}

            <CardFooter className="flex flex-col space-y-2 p-6 pt-0 border-t border-border mt-2">
              <div className="text-center text-sm text-muted-foreground mt-4">
                <span>Already have an account? </span>
                <Link href="/auth/login" className="font-semibold text-black dark:text-white hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
