"use client"

import { useState, useEffect } from "react"
import { UrlInput } from "@/components/url-input"
import { CommentsTable } from "@/components/comments-table"
import { ReplyModal } from "@/components/reply-modal"
import { StatsCards } from "@/components/stats-cards"
import { Spinner } from "@/components/ui/spinner"
import { type Comment } from "@/lib/dummy-data"
import { toast } from "sonner"
import { Youtube, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  saveToSessionStorage,
  saveToSupabase,
  loadLastAnalysis,
  clearSessionStorage,
  type AnalysisData,
} from "@/lib/storage"

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /m\.youtube\.com\/watch\?v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim()
  }

  return null
}

export default function DashboardPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("")

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!mounted) return
      
      setUser(user)
      setIsAuthenticated(!!user)

      // Load last analysis if exists (only for authenticated users)
      if (user) {
        const lastAnalysis = await loadLastAnalysis(true)
        if (lastAnalysis && mounted) {
          setComments(lastAnalysis.results_json)
          setCurrentVideoUrl(lastAnalysis.video_url)
        }
      }
    }
    
    checkAuth()

    // Listen for auth state changes (e.g., logout)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // User logged out - redirect to landing page
        window.location.href = '/'
      } else if (mounted) {
        setUser(session?.user ?? null)
        setIsAuthenticated(!!session?.user)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleFetch = async (url: string) => {
    setIsLoading(true)
    setCurrentVideoUrl(url)
    try {
      // Step 1: Fetch comments from YouTube
      const videoId = extractVideoId(url)
      const fetchResponse = await fetch(`/api/youtube/fetch-comments?url=${encodeURIComponent(url)}`)
      
      if (!fetchResponse.ok) {
        const error = await fetchResponse.json().catch(() => ({}))
        throw new Error(error.error || "Failed to fetch comments")
      }

      const fetchData = await fetchResponse.json()
      const rawComments = fetchData.comments || []

      if (rawComments.length === 0) {
        toast.error("No comments found for this video.")
        setIsLoading(false)
        return
      }

      // Step 2: Classify comments using AI
      const classifyResponse = await fetch("/api/ai/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments: rawComments }),
      })

      if (!classifyResponse.ok) {
        const error = await classifyResponse.json().catch(() => ({}))
        throw new Error(error.error || "Failed to classify comments")
      }

      const classifyData = await classifyResponse.json()
      const classifiedComments = classifyData.comments || rawComments

      setComments(classifiedComments)
      toast.success(`Successfully analyzed ${classifiedComments.length} comments!`)

      // Step 3: Auto-save analysis (only for authenticated users)
      if (isAuthenticated) {
        const hotLeads = classifiedComments.filter((c: Comment) => c.leadType === "hot").length
        const warmLeads = classifiedComments.filter((c: Comment) => c.leadType === "warm").length
        const coldLeads = classifiedComments.filter((c: Comment) => c.leadType === "cold").length

        const analysisData: AnalysisData = {
          video_url: url,
          video_id: videoId || undefined,
          results_json: classifiedComments,
          total_comments: classifiedComments.length,
          hot_leads: hotLeads,
          warm_leads: warmLeads,
          cold_leads: coldLeads,
        }

        await saveToSupabase(analysisData)
      }
    } catch (error) {
      console.error("Error in handleFetch:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch comments. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeAnother = () => {
    setComments([])
    setCurrentVideoUrl("")
    clearSessionStorage()
  }

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment)
    setIsModalOpen(true)
  }

  const handleSendReply = (commentId: string, reply: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replied: true } : c)))
    toast.success("Reply sent successfully!")
    console.log("Reply sent:", { commentId, reply })
  }

  const repliedCount = comments.filter((c) => c.replied).length
  const hasResults = comments.length > 0

  // MVP: Page 1 - Input Screen (shown when no results)
  if (!hasResults && !isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Paste your YouTube video link to find hot leads
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              AI analyzes comments and classifies them as hot, warm, or cold leads
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <UrlInput onFetch={handleFetch} isLoading={isLoading} />
          </div>

          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Youtube className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Ready to analyze</p>
              <p className="text-sm text-muted-foreground">Enter a YouTube video URL above to get started</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MVP: Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <UrlInput onFetch={handleFetch} isLoading={isLoading} />
          </div>
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card">
            <Spinner className="h-12 w-12 text-primary" />
            <div>
              <p className="font-medium text-muted-foreground">Analyzing comments...</p>
              <p className="mt-1 text-sm text-muted-foreground">This usually takes under 10 seconds</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MVP: Page 2 - Result Screen (shown after analysis)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
          <p className="text-muted-foreground">Found {comments.length} comments with lead classifications</p>
        </div>
        <Button onClick={handleAnalyzeAnother} variant="outline" className="rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" />
          Analyze another video
        </Button>
      </div>

      <StatsCards
        totalComments={comments.length}
        leadsFound={comments.filter((c) => !c.replied).length}
        repliesSent={repliedCount}
      />

      <CommentsTable comments={comments} onReply={handleReply} />

      <ReplyModal comment={selectedComment} open={isModalOpen} onOpenChange={setIsModalOpen} onSend={handleSendReply} />
    </div>
  )
}
