"use client"

import { useState, useEffect } from "react"
import { UrlInput } from "@/components/url-input"
import { CommentsTable } from "@/components/comments-table"
import { ReplyModal } from "@/components/reply-modal"
import { FeedbackModal } from "@/components/feedback-modal"
import { FeedbackBanner } from "@/components/feedback-banner"
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
  const [loadingStep, setLoadingStep] = useState<"fetching" | "analyzing" | null>(null)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!mounted) return
      
      setUser(user)
      setIsAuthenticated(!!user)

      // Removed auto-loading of last analysis - dashboard should start fresh
      // Results will only show when user explicitly analyzes a video
      // if (user) {
      //   const lastAnalysis = await loadLastAnalysis(true)
      //   if (lastAnalysis && mounted) {
      //     setComments(lastAnalysis.results_json)
      //     setCurrentVideoUrl(lastAnalysis.video_url)
      //   }
      // }
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
    // Validate URL first
    const videoId = extractVideoId(url)
    if (!videoId) {
      toast.error("Invalid YouTube link. Please check the URL and try again.")
      return
    }

    setIsLoading(true)
    setLoadingStep("fetching")
    setCurrentVideoUrl(url)
    
    try {
      // Step 1: Fetch comments from YouTube API
      const fetchResponse = await fetch(`/api/youtube/fetch-comments?url=${encodeURIComponent(url)}`)
      
      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || "Failed to fetch comments from YouTube."
        
        if (fetchResponse.status === 404) {
          toast.error("Video not found or comments are disabled.")
        } else if (fetchResponse.status === 403) {
          toast.error("YouTube API access denied. Please check your API configuration.")
        } else {
          toast.error(errorMessage)
        }
        
        setIsLoading(false)
        setLoadingStep(null)
        return
      }
      
      const fetchData = await fetchResponse.json()
      
      if (fetchData.error) {
        toast.error(fetchData.error)
        setIsLoading(false)
        setLoadingStep(null)
        return
      }
      
      const rawComments = fetchData.comments || []

      if (rawComments.length === 0) {
        toast.error("No comments found for this video.")
        setIsLoading(false)
        setLoadingStep(null)
        return
      }

      // Step 2: Classify comments using Gemini AI
      setLoadingStep("analyzing")
      
      const classifyResponse = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: rawComments }),
      })
      
      if (!classifyResponse.ok) {
        const errorData = await classifyResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || "Failed to classify comments."
        
        if (classifyResponse.status === 408) {
          toast.error("Processing timeout. Please try again with fewer comments.")
        } else if (classifyResponse.status === 500) {
          toast.error("AI classification service error. Please try again later.")
        } else {
          toast.error(errorMessage)
        }
        
        setIsLoading(false)
        setLoadingStep(null)
        return
      }
      
      const classifyData = await classifyResponse.json()
      
      if (classifyData.error) {
        toast.error(classifyData.error)
        setIsLoading(false)
        setLoadingStep(null)
        return
      }
      
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

        const saveResult = await saveToSupabase(analysisData)
        
        // Store analysis ID for feedback linking
        if (saveResult?.id) {
          setCurrentAnalysisId(saveResult.id)
          // Show feedback banner instead of auto-showing modal
          setShowFeedbackBanner(true)
        }
      }
    } catch (error) {
      console.error("Error in handleFetch:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch comments. Please try again.")
    } finally {
      setIsLoading(false)
      setLoadingStep(null)
    }
  }

  const handleAnalyzeAnother = () => {
    setComments([])
    setCurrentVideoUrl("")
    setCurrentAnalysisId(null)
    setShowFeedbackModal(false)
    setShowFeedbackBanner(false)
    clearSessionStorage()
  }

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true)
  }

  const handleDismissBanner = () => {
    setShowFeedbackBanner(false)
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

  // Page 1 - Input Screen (shown when no results)
  if (!hasResults && !isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col p-4 sm:p-6">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Extract YouTube Comments</h1>
            <p className="text-lg text-muted-foreground">
              Paste a video URL to find potential leads in the comments section.
            </p>
          </div>

          {/* Input Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <UrlInput onFetch={handleFetch} isLoading={isLoading} />
          </div>

          {/* Empty State Section */}
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Youtube className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">No comments yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a YouTube video URL above to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (isLoading) {
    const loadingMessage = loadingStep === "fetching" 
      ? "Fetching Comments..." 
      : loadingStep === "analyzing"
      ? "Analyzing comments..."
      : "Loading..."
    
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 sm:p-6">
        <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <UrlInput onFetch={handleFetch} isLoading={isLoading} />
          </div>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6">
            <Spinner className="h-12 w-12 text-primary" />
            <div>
              <p className="font-medium text-foreground">{loadingMessage}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {loadingStep === "fetching" 
                  ? "Retrieving comments from YouTube..."
                  : "AI is classifying leads..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Page 2 - Result Screen (shown after analysis)
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Analysis Results</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Found {comments.length} comments with lead classifications
          </p>
        </div>
        <Button 
          onClick={handleAnalyzeAnother} 
          variant="outline" 
          className="w-full cursor-pointer rounded-xl sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Analyze another video
        </Button>
      </div>

      {isAuthenticated && showFeedbackBanner && currentAnalysisId && (
        <FeedbackBanner
          onFeedbackClick={handleFeedbackClick}
          onDismiss={handleDismissBanner}
        />
      )}

      <CommentsTable comments={comments} onReply={handleReply} />

      <ReplyModal comment={selectedComment} open={isModalOpen} onOpenChange={setIsModalOpen} onSend={handleSendReply} />
      
      {isAuthenticated && (
        <FeedbackModal
          analysisId={currentAnalysisId}
          open={showFeedbackModal}
          onOpenChange={setShowFeedbackModal}
        />
      )}
    </div>
  )
}
