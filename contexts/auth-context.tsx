"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase, type UserType } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type SignUpResult = {
  error?: string
  session?: boolean
  requiresConfirmation?: boolean
}

type AuthContextType = {
  user: UserType | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData: Partial<UserType>) => Promise<SignUpResult>
  resendVerificationEmail: (email: string) => Promise<{ error?: string; success?: boolean }>
  signOut: () => Promise<void>
  googleSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Helper to sync or create user profile in public.users using active authenticated session
  const syncUserProfile = async (sessionUser: any): Promise<UserType | null> => {
    try {
      const meta = sessionUser.user_metadata || {}

      // 1. Fetch existing profile from the database (database is the sole authority for roles)
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle()

      if (existingProfile && !fetchError) {
        return existingProfile as UserType
      }

      if (fetchError) {
        console.error("Database error fetching profile for user:", fetchError.message)
        // If there's a DB error (such as permissions or network), do not attempt an upsert that could overwrite existing data
        return null
      }

      // 2. Profile does not exist in DB yet. Create initial profile with strictly 'student' role.
      // Never trust metadata role for privilege assignment.
      const initialProfile: UserType = {
        id: sessionUser.id,
        email: sessionUser.email || "",
        name: meta.name || sessionUser.email?.split("@")[0] || "User",
        role: "student",
        department: meta.department || undefined,
        year: meta.year || undefined,
        roll_number: meta.roll_number || undefined,
        position: meta.position || undefined,
      }

      const { data: createdProfile, error: insertError } = await supabase
        .from("users")
        .insert([initialProfile])
        .select()
        .maybeSingle()

      if (insertError) {
        console.warn("Could not insert initial profile:", insertError.message)
        return initialProfile
      }

      return (createdProfile as UserType) || initialProfile
    } catch (err) {
      console.error("Error in syncUserProfile:", err)
      return null
    }
  }

  // Explicit profile refresh function: re-queries public.users for the latest role and fields
  const refreshProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await syncUserProfile(session.user)
        if (profile) {
          setUser(profile)
        }
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Error in refreshProfile:", err)
    }
  }, [])

  useEffect(() => {
    // Check active session and set user
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await syncUserProfile(session.user)
          setUser(profile)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Error checking session:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") && session?.user) {
        const profile = await syncUserProfile(session.user)
        setUser(profile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Auto-refresh profile on window focus (e.g. if an admin changed the role in Supabase)
    const handleFocus = () => {
      refreshProfile()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus)
    }

    return () => {
      subscription.unsubscribe()
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus)
      }
    }
  }, [refreshProfile])

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) throw error

      if (data.user) {
        const profile = await syncUserProfile(data.user)
        setUser(profile)
      }

      return {}
    } catch (error: any) {
      let message = error.message || "Failed to sign in"
      if (message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please check your credentials."
      } else if (message.includes("Email not confirmed")) {
        message = "Please check your email and confirm your account before signing in."
      }
      return { error: message }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserType>
  ): Promise<SignUpResult> => {
    try {
      const cleanEmail = email.trim().toLowerCase()

      // Enforce student role for public signup.
      // Roles like admin and faculty must be assigned by authorized administrators.
      const userMetadata = {
        name: userData.name || "",
        role: "student",
        department: userData.department || null,
        year: userData.year || null,
        roll_number: userData.roll_number || null,
        position: userData.position || null,
      }

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined

      // Create Supabase Auth user
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        if (
          error.message.includes("over_email_send_rate_limit") ||
          error.message.includes("rate limit")
        ) {
          return {
            error:
              "Verification email rate limit exceeded. Supabase's default mail server limits verification emails per hour. Please wait a few minutes, or disable 'Confirm email' in Supabase Dashboard (Authentication -> Providers -> Email).",
          }
        }
        if (
          error.message.includes("already registered") ||
          error.message.includes("User already registered")
        ) {
          return {
            error: "An account with this email already exists. Please sign in instead.",
          }
        }
        if (
          error.message.includes("email_address_invalid") ||
          error.message.includes("is invalid")
        ) {
          return {
            error:
              "This email address was rejected by the authentication server. Please check the address format or use your institute email.",
          }
        }
        return { error: error.message }
      }

      // When user already exists and email confirmation is active, Supabase returns empty identities array
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        return {
          error: "An account with this email already exists. Please sign in instead.",
        }
      }

      // Scenario A: Active session returned immediately (email confirmation disabled or auto-confirmed)
      if (data.session && data.user) {
        // Safe to insert into public.users because auth.uid() = data.user.id
        const profilePayload: UserType = {
          id: data.user.id,
          email: cleanEmail,
          name: userData.name || data.user.email?.split("@")[0] || "User",
          role: "student",
          department: userData.department,
          year: userData.year,
          roll_number: userData.roll_number,
          position: userData.position,
        }

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .upsert([profilePayload], { onConflict: "id" })
          .select()
          .maybeSingle()

        if (profileError) {
          console.warn("Initial profile upsert warning:", profileError.message)
        }

        setUser((profileData as UserType) || profilePayload)
        return { session: true }
      }

      // Scenario B: Email confirmation is enabled, so no session exists yet.
      // Do NOT perform direct insert here as auth.uid() is null and violates RLS.
      // Metadata is securely preserved in auth.users and will sync upon sign in / confirmation.
      return { session: false, requiresConfirmation: true }
    } catch (error: any) {
      console.error("SignUp error:", error)
      return { error: error.message || "An unexpected error occurred during registration." }
    }
  }

  const resendVerificationEmail = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail) {
        return { error: "Please provide an email address." }
      }

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        if (
          error.message.includes("over_email_send_rate_limit") ||
          error.message.includes("rate limit")
        ) {
          return {
            error:
              "Verification email rate limit exceeded. Please wait a few minutes before requesting another email.",
          }
        }
        return { error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      return { error: err.message || "Failed to resend verification email." }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const googleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshProfile, signIn, signUp, resendVerificationEmail, signOut, googleSignIn }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
