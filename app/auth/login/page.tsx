"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, AtSign, Eye, EyeOff, Lock, Sparkles, AlertCircle, RefreshCw, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/dashboard"
  const { signIn, resendVerificationEmail } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setErrorMessage(null)
    setResendSuccess(false)

    try {
      const { error } = await signIn(formData.email, formData.password)

      if (error) {
        setErrorMessage(error)
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Login Successful",
        description: "Welcome back to CampusOne IIIT Ranchi!",
      })

      router.push(nextUrl)
    } catch (error: any) {
      const msg = error?.message || "An unexpected error occurred. Please try again."
      setErrorMessage(msg)
      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!formData.email.trim() || isResending) return
    setIsResending(true)
    setResendSuccess(false)

    const res = await resendVerificationEmail(formData.email)
    setIsResending(false)

    if (res.error) {
      toast({
        title: "Could Not Resend Email",
        description: res.error,
        variant: "destructive",
      })
    } else {
      setResendSuccess(true)
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox (and spam folder) for the verification link.",
      })
    }
  }

  const isEmailUnconfirmed = errorMessage?.toLowerCase().includes("not confirmed") || errorMessage?.toLowerCase().includes("confirm your account")

  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black mb-2">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Access your CampusOne IIIT Ranchi account
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 p-3 text-left space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                {errorMessage}
              </p>
            </div>
            {isEmailUnconfirmed && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending confirmation email...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3 w-3" />
                      Resend confirmation email to {formData.email || "this address"}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 p-3 text-left flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-snug">
              Verification email sent! Check your inbox and spam folder, then click the link to confirm.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Institute / Personal Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="e.g. yourname@iiitranchi.ac.in"
                className="pl-9"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errorMessage) setErrorMessage(null)
                }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-9 pr-9"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errorMessage) setErrorMessage(null)
                }}
                required
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 p-6 pt-0 border-t border-border mt-2">
        <div className="text-center text-sm text-muted-foreground mt-4">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/auth/register" className="font-semibold text-black dark:text-white hover:underline">
            Register here
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading login...</div>}>
            <LoginForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
