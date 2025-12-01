"use client"

import { useState } from "react"
import { UrlInput } from "@/components/url-input"
import { CommentsTable } from "@/components/comments-table"
import { ReplyModal } from "@/components/reply-modal"
import { StatsCards } from "@/components/stats-cards"
import { Spinner } from "@/components/ui/spinner"
import { type Comment, fetchComments } from "@/lib/dummy-data"
import { toast } from "sonner"
import { Youtube } from "lucide-react"

export default function DashboardPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFetch = async (url: string) => {
    setIsLoading(true)
    try {
      const fetchedComments = await fetchComments(url)
      setComments(fetchedComments)
      toast.success(`Successfully fetched ${fetchedComments.length} comments!`)
    } catch {
      toast.error("Failed to fetch comments. Please try again.")
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Extract YouTube Comments</h2>
        <p className="text-muted-foreground">Paste a video URL to find potential leads in the comments section.</p>
      </div>

      <UrlInput onFetch={handleFetch} isLoading={isLoading} />

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card">
          <Spinner className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Extracting comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <>
          <StatsCards
            totalComments={comments.length}
            leadsFound={comments.filter((c) => !c.replied).length}
            repliesSent={repliedCount}
          />
          <CommentsTable comments={comments} onReply={handleReply} />
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Youtube className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">No comments yet</p>
            <p className="text-sm text-muted-foreground">Enter a YouTube video URL above to get started</p>
          </div>
        </div>
      )}

      <ReplyModal comment={selectedComment} open={isModalOpen} onOpenChange={setIsModalOpen} onSend={handleSendReply} />
    </div>
  )
}
