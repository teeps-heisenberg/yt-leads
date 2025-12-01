"use client"

import { useState } from "react"
import { CommentsTable } from "@/components/comments-table"
import { ReplyModal } from "@/components/reply-modal"
import { type Comment, dummyComments } from "@/lib/dummy-data"
import { toast } from "sonner"

export default function LeadsPage() {
  const [comments, setComments] = useState<Comment[]>(dummyComments.filter((c) => !c.replied))
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment)
    setIsModalOpen(true)
  }

  const handleSendReply = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    toast.success("Reply sent! Lead moved to Replies.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
        <p className="text-muted-foreground">Unreplied comments that could be potential clients.</p>
      </div>

      <CommentsTable comments={comments} onReply={handleReply} />

      <ReplyModal comment={selectedComment} open={isModalOpen} onOpenChange={setIsModalOpen} onSend={handleSendReply} />
    </div>
  )
}
