"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkConnectionStatus()
    
    // Check for success/error messages from OAuth callback
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success) {
      toast.success(decodeURIComponent(success))
      router.replace('/dashboard/settings')
    }
    if (error) {
      toast.error(decodeURIComponent(error))
      router.replace('/dashboard/settings')
    }
  }, [searchParams, router])

  async function checkConnectionStatus() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsConnected(false)
        setIsChecking(false)
        return
      }

      const { data, error } = await supabase
        .from('youtube_oauth_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setIsConnected(!!data && !error)
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  async function handleConnectYouTube() {
    setIsLoading(true)
    try {
      window.location.href = '/api/auth/youtube'
    } catch (error) {
      toast.error('Failed to initiate YouTube connection')
      setIsLoading(false)
    }
  }

  async function handleDisconnect() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Not authenticated')
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from('youtube_oauth_tokens')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('YouTube account disconnected')
      setIsConnected(false)
    } catch (error) {
      toast.error('Failed to disconnect YouTube account')
    } finally {
      setIsLoading(false)
    }
  }

  // const handleSave = () => {
  //   toast.success("Settings saved successfully!")
  // }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">YouTube Integration</h2>
        <p className="text-muted-foreground">
          Connect your YouTube account to enable video analysis and comment extraction. Your account credentials are securely stored and used only to access the YouTube API.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section - Commented out */}
        {/* <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" className="rounded-xl" />
              </div>
            </div>
            <Button onClick={handleSave} className="rounded-xl">
              Save Changes
            </Button>
          </CardContent>
        </Card> */}

        {/* Notifications Section - Commented out */}
        {/* <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about new leads.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Digest</Label>
                <p className="text-sm text-muted-foreground">Get a summary of your leads every day.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card> */}

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>YouTube Integration</CardTitle>
            <CardDescription>Connect your YouTube account to access the API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isChecking ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking connection status...</span>
              </div>
            ) : isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">YouTube account connected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your YouTube account is connected and ready to use. You can now fetch comments from any public YouTube video.
                </p>
                <Button 
                  onClick={handleDisconnect} 
                  variant="destructive"
                  disabled={isLoading}
                  className="rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect YouTube'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span>YouTube account not connected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your YouTube account to use the YouTube API. This allows you to fetch comments from any public video.
                </p>
                <Button 
                  onClick={handleConnectYouTube} 
                  disabled={isLoading}
                  className="rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect YouTube Account'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
