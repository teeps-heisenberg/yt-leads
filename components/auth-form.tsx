"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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
    ? "Enter your email and password"
    : "Enter your email and password to get started"
  const buttonText = isLogin ? "Login" : "Sign up"
  const altText = isLogin ? "Don't have an account?" : "Already have an account?"
  const altLink = isLogin ? "/signup" : "/login"
  const altLinkText = isLogin ? "Sign up" : "Login"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate name fields for signup
      if (!isLogin) {
        if (!firstName.trim()) {
          toast.error("First name is required")
          setIsLoading(false)
          return
        }
        if (!lastName.trim()) {
          toast.error("Last name is required")
          setIsLoading(false)
          return
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match")
          setIsLoading(false)
          return
        }
      }

      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        setIsLoading(false)
        return
      }

      const supabase = createClient()

      if (isLogin) {
        // Login with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error(error.message || "Failed to login. Please check your credentials.")
          setIsLoading(false)
          return
        }

        toast.success("Login successful!")
        router.push("/dashboard")
      } else {
        // Signup with email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            }
          }
        })

        if (error) {
          toast.error(error.message || "Failed to create account. Please try again.")
          setIsLoading(false)
          return
        }

        toast.success("Account created successfully!")
        router.push("/dashboard")
      }
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
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
            )}
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
