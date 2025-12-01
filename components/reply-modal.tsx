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
import { Textarea } from "@/components/ui/textarea"
import type { Comment } from "@/lib/dummy-data"
import { Loader2, Send } from "lucide-react"

interface ReplyModalProps {
  comment: Comment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (commentId: string, reply: string) => void
}

export function ReplyModal({ comment, open, onOpenChange, onSend }: ReplyModalProps) {
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!comment || !reply.trim()) return

    setIsSending(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSend(comment.id, reply)
    setReply("")
    setIsSending(false)
    onOpenChange(false)
  }

  if (!comment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to Comment</DialogTitle>
          <DialogDescription>Write your reply to engage with this potential lead.</DialogDescription>
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

          <Textarea
            placeholder="Write your reply here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="rounded-xl resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !reply.trim()} className="rounded-xl">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
