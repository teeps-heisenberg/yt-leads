"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface AuthFormProps {
  mode: "login" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  // Check for error messages from URL params (e.g., from auth callback)
  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error && message) {
      toast.error(decodeURIComponent(message))
      // Clean up URL by removing query params
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const isLogin = mode === "login"
  const title = isLogin ? "Welcome back" : "Create an account"
  const description = isLogin
    ? "Enter your email to receive a magic link"
    : "Enter your email to get started"
  const buttonText = isLogin ? "Send Magic Link" : "Start"
  const altText = isLogin ? "Don't have an account?" : "Already have an account?"
  const altLink = isLogin ? "/signup" : "/login"
  const altLinkText = isLogin ? "Sign up" : "Login"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Check for rate limit errors
        const errorMessage = error.message?.toLowerCase() || ''
        const isRateLimit = errorMessage.includes('rate limit') || 
                           errorMessage.includes('too many') ||
                           error.status === 429 ||
                           errorMessage.includes('email rate limit exceeded')
        
        if (isRateLimit) {
          toast.error("Too many requests. Please wait 1 hour before requesting another magic link.")
        } else {
          toast.error(error.message || "Failed to send magic link. Please try again.")
        }
        setIsLoading(false)
        return
      }

      toast.success("Check your email for the magic link!")
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight">YTLeadBoost</span>
      </Link>

      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="h-11 w-full rounded-xl">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {altText}{" "}
            <Link href={altLink} className="font-medium text-primary hover:underline">
              {altLinkText}
            </Link>
          </p>
          <div className="pt-2">
            <Link href="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
              ← Go to home page
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="#" className="underline hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
