"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, Settings, LogOut, User } from "lucide-react"
import { MobileSidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/client"

export function TopBar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsAuthenticated(!!user)
    }
    checkAuth()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      // Clear any client-side state
      setUser(null)
      setIsAuthenticated(false)
      
      // Redirect to landing page
      router.push("/")
      router.refresh()
    }
  }

  const userInitials = user?.email
    ? user.email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "AN"

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <h1 className="text-lg font-semibold sm:text-xl">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline-block">
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
