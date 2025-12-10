"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import {
  updateUserName,
  updateUserEmail,
  updateUserPassword,
  getUserProfile,
} from "@/lib/profile"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Name state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSavingName, setIsSavingName] = useState(false)
  
  // Email state
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    loadUserData()
    
    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Reload profile data when auth changes
        loadUserData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadUserData() {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return
      }

      setUser(user)

      // Try to load from profiles table first
      const profile = await getUserProfile()
      
      if (profile) {
        // Use profile data from profiles table
        setFirstName(profile.first_name || "")
        setLastName(profile.last_name || "")
        
        // If profile was loaded from metadata (backfill flag), create profile record
        if (profile.from_metadata && (profile.first_name || profile.last_name)) {
          // Backfill: Create profile record from user_metadata
          await updateUserName(
            profile.first_name || "",
            profile.last_name || ""
          )
        }
      } else {
        // Fallback to user_metadata if profile doesn't exist
        const firstNameFromMetadata = user.user_metadata?.first_name || ""
        const lastNameFromMetadata = user.user_metadata?.last_name || ""
        
        setFirstName(firstNameFromMetadata)
        setLastName(lastNameFromMetadata)
        
        // If we have names in metadata but no profile, create profile record (backfill)
        if (firstNameFromMetadata || lastNameFromMetadata) {
          try {
            await updateUserName(firstNameFromMetadata, lastNameFromMetadata)
          } catch (error) {
            // Silently fail - profile will be created on next update
            console.error("Failed to backfill profile:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      toast.error("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required")
      return
    }

    setIsSavingName(true)
    try {
      const result = await updateUserName(firstName.trim(), lastName.trim())
      
      if (result.success) {
        toast.success("Name updated successfully!")
        // Reload user data to get updated profile
        await loadUserData()
      } else {
        toast.error(result.error || "Failed to update name")
      }
    } catch (error) {
      console.error("Error saving name:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newEmail.trim()) {
      toast.error("Please enter a new email address")
      return
    }

    if (!emailPassword) {
      toast.error("Please enter your current password")
      return
    }

    setIsSavingEmail(true)
    try {
      const result = await updateUserEmail(newEmail.trim(), emailPassword)
      
      if (result.success) {
        if (result.requiresConfirmation) {
          toast.success("Email update initiated! Please check your new email for a confirmation link.")
          setNewEmail("")
          setEmailPassword("")
        } else {
          toast.success("Email updated successfully!")
          await loadUserData()
        }
      } else {
        toast.error(result.error || "Failed to update email")
      }
    } catch (error) {
      console.error("Error saving email:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingEmail(false)
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }

    if (!newPassword) {
      toast.error("Please enter a new password")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password")
      return
    }

    setIsSavingPassword(true)
    try {
      const result = await updateUserPassword(currentPassword, newPassword)
      
      if (result.success) {
        toast.success("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(result.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error saving password:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">User not found. Please sign in.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your name and personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="rounded-xl"
                    disabled={isSavingName}
                    autoComplete="given-name"
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
                    className="rounded-xl"
                    disabled={isSavingName}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSavingName}
                className="rounded-xl"
              >
                {isSavingName ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Section */}
        {/* <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Address</CardTitle>
            </div>
            <CardDescription>
              Change your email address. You'll receive a confirmation email at the new address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentEmail">Current Email</Label>
                <Input
                  id="currentEmail"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="rounded-xl bg-muted"
                />
              </div>
              <form onSubmit={handleSaveEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="rounded-xl"
                    disabled={isSavingEmail}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="emailPassword"
                      type={showEmailPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      required
                      className="rounded-xl pr-10"
                      disabled={isSavingEmail}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSavingEmail}
                    >
                      {showEmailPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Note:</strong> You'll need to confirm your new email address by clicking the link sent to your new email.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isSavingEmail}
                  className="rounded-xl"
                >
                  {isSavingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Email"
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card> */}

        {/* Password Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Password</CardTitle>
            </div>
            <CardDescription>
              Change your password. Make sure to use a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="rounded-xl pr-10"
                      disabled={isSavingPassword}
                      autoComplete="current-password"
                    />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSavingPassword}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="rounded-xl pr-10"
                      disabled={isSavingPassword}
                      autoComplete="new-password"
                    />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSavingPassword}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="rounded-xl pr-10"
                      disabled={isSavingPassword}
                      autoComplete="new-password"
                    />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSavingPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSavingPassword}
                className="rounded-xl"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

