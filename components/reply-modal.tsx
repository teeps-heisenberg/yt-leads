"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Comment } from "@/lib/dummy-data"
import { Loader2, Send, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ReplyModalProps {
  comment: Comment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (commentId: string, reply: string) => void
}

export function ReplyModal({ comment, open, onOpenChange, onSend }: ReplyModalProps) {
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const aiReply = comment?.reply || "Thank you for your comment!"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiReply)
      setCopied(true)
      toast.success("AI reply copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy reply")
    }
  }

  const handleSend = async () => {
    if (!comment) return

    setIsSending(true)
    
    try {
      // Call the API to post reply to YouTube
      const response = await fetch('/api/youtube/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: comment.id,
          replyText: aiReply,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API errors
        const errorMessage = data.error || 'Failed to post reply'
        const errorDetails = data.details || ''
        
        if (response.status === 403) {
          if (errorMessage.includes('not connected')) {
            toast.error('YouTube account not connected. Please connect your account in Settings.')
          } else {
            toast.error(errorMessage)
          }
        } else if (response.status === 400) {
          if (errorMessage.includes('too long')) {
            toast.error('Reply is too long. Please shorten it.')
          } else if (errorMessage.includes('Cannot reply')) {
            toast.error('Cannot reply to this comment. Replies may be disabled.')
          } else {
            toast.error(errorMessage)
          }
        } else if (response.status === 404) {
          toast.error('Comment not found. It may have been deleted.')
        } else {
          toast.error(errorMessage)
        }
        
        setIsSending(false)
        return
      }

      // Success - update UI
      toast.success('Reply posted successfully to YouTube!')
      onSend(comment.id, aiReply)
      onOpenChange(false)
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply. Please check your connection and try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (!comment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Generated Reply</DialogTitle>
          <DialogDescription>Review and copy the AI-generated reply for this comment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="mb-2 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
                <AvatarFallback>{comment.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{comment.username}</p>
                <p className="text-xs text-muted-foreground">{comment.date}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{comment.text}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">AI Generated Reply</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-8 rounded-lg"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-primary/5 p-4">
              <p className="text-sm leading-relaxed text-foreground">{aiReply}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="rounded-xl">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
