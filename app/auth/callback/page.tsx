"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code")
        const error = searchParams.get("error_description") || searchParams.get("error")

        if (error) {
          setStatus("error")
          setErrorMessage(error)
          return
        }

        // If PKCE code is present in query parameters, exchange it for session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setStatus("error")
            setErrorMessage(exchangeError.message)
            return
          }
        }

        // Verify active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          setStatus("error")
          setErrorMessage(sessionError.message)
          return
        }

        if (session) {
          setStatus("success")
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          // In hash-based redirect, give client a moment to parse hash tokens
          const hash = window.location.hash
          if (hash && hash.includes("access_token")) {
            setTimeout(async () => {
              const { data: refreshed } = await supabase.auth.getSession()
              if (refreshed.session) {
                setStatus("success")
                setTimeout(() => router.push("/dashboard"), 1200)
              } else {
                setStatus("error")
                setErrorMessage("Authentication session could not be established from confirmation link.")
              }
            }, 800)
          } else {
            setStatus("error")
            setErrorMessage("No confirmation token or authentication session was found in the URL.")
          }
        }
      } catch (err: any) {
        setStatus("error")
        setErrorMessage(err?.message || "Unexpected authentication error.")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <Card className="border border-border shadow-sm bg-card w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">
          {status === "verifying" && "Confirming Account..."}
          {status === "success" && "Account Verified!"}
          {status === "error" && "Verification Issue"}
        </CardTitle>
        <CardDescription>
          {status === "verifying" && "Please wait while we verify your CampusOne account..."}
          {status === "success" && "Your email has been confirmed. Redirecting to your dashboard..."}
          {status === "error" && "We could not automatically confirm your verification link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0 text-center">
        {status === "verifying" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-foreground" />
            <p className="text-xs text-muted-foreground">Connecting to Supabase Auth...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
            <p className="text-sm font-medium">Welcome to CampusOne IIIT Ranchi!</p>
            <Button asChild className="w-full mt-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <p className="text-xs text-destructive font-medium max-w-xs">{errorMessage}</p>
            <div className="flex flex-col gap-2 w-full pt-2">
              <Button asChild className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
                <Link href="/auth/login">Proceed to Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/register">Back to Register</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white dark:bg-black p-4">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading confirmation...</div>}>
          <AuthCallbackContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
