"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Comment } from "@/lib/dummy-data"
import { Heart, MessageSquare, Search, Copy, Check, Flame, Sun, Snowflake } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface CommentsTableProps {
  comments: Comment[]
  onReply: (comment: Comment) => void
}

export function CommentsTable({ comments, onReply }: CommentsTableProps) {
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [reasonPopupOpen, setReasonPopupOpen] = useState(false)
  const [commentPopupOpen, setCommentPopupOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState<{ id: string; text: string; leadType?: string } | null>(null)
  const [selectedCommentText, setSelectedCommentText] = useState<{ id: string; text: string } | null>(null)

  const filteredComments = comments.filter(
    (comment) =>
      comment.text.toLowerCase().includes(search.toLowerCase()) ||
      comment.username.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCopy = async (comment: Comment) => {
    try {
      await navigator.clipboard.writeText(comment.text)
      setCopiedId(comment.id)
      toast.success("Comment copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error("Failed to copy comment")
    }
  }

  const getLeadBadgeConfig = (leadType?: string) => {
    switch (leadType) {
      case "hot":
        return {
          text: "Hot",
          icon: Flame,
          className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
          iconClassName: "text-red-600",
        }
      case "warm":
        return {
          text: "Warm",
          icon: Sun,
          className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
          iconClassName: "text-amber-600",
        }
      case "cold":
        return {
          text: "Cold",
          icon: Snowflake,
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
          iconClassName: "text-blue-600",
        }
      default:
        return {
          text: "Unknown",
          icon: null,
          className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          iconClassName: "text-gray-600",
        }
    }
  }


  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search comments by keyword or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-xl pl-10"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Lead</TableHead>
              <TableHead className="w-[200px]">Reason</TableHead>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Likes</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No comments found
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    {(() => {
                      const config = getLeadBadgeConfig(comment.leadType)
                      const Icon = config.icon
                      return (
                        <Badge 
                          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 w-fit ${config.className}`}
                        >
                          {Icon && <Icon className={`h-4 w-4 ${config.iconClassName}`} />}
                          {config.text}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    {comment.leadReason ? (
                      <p 
                        className={`text-xs text-muted-foreground line-clamp-1 ${
                          comment.leadReason.length > 60 ? 'cursor-pointer hover:text-foreground hover:underline' : ''
                        }`}
                        onClick={() => {
                          if (comment.leadReason && comment.leadReason.length > 60) {
                            setSelectedReason({ id: comment.id, text: comment.leadReason, leadType: comment.leadType })
                            setReasonPopupOpen(true)
                          }
                        }}
                      >
                        {comment.leadReason.length > 60 
                          ? `${comment.leadReason.substring(0, 60)}...` 
                          : comment.leadReason}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
                        <AvatarFallback>{comment.username[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{comment.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p 
                      className={`text-sm text-muted-foreground ${
                        comment.text.length > 100 ? 'cursor-pointer hover:text-foreground hover:underline' : ''
                      }`}
                      onClick={() => {
                        if (comment.text.length > 100) {
                          setSelectedCommentText({ id: comment.id, text: comment.text })
                          setCommentPopupOpen(true)
                        }
                      }}
                    >
                      {comment.text.length > 100 
                        ? `${comment.text.substring(0, 100)}...` 
                        : comment.text}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{comment.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      {comment.likes}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(comment)}
                        className="h-8 w-8 rounded-lg p-0"
                      >
                        {copiedId === comment.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {comment.replied ? (
                        <Badge variant="secondary" className="rounded-lg">
                          Replied
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => onReply(comment)} className="rounded-lg">
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {filteredComments.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-border text-center text-muted-foreground">
            No comments found
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
                    <AvatarFallback>{comment.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.username}</p>
                    <p className="text-xs text-muted-foreground">{comment.date}</p>
                  </div>
                </div>
                {(() => {
                  const config = getLeadBadgeConfig(comment.leadType)
                  const Icon = config.icon
                  return (
                    <Badge 
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 ${config.className}`}
                    >
                      {Icon && <Icon className={`h-4 w-4 ${config.iconClassName}`} />}
                      {config.text}
                    </Badge>
                  )
                })()}
              </div>

              {comment.leadReason && (
                <div 
                  className={`mb-2 rounded-lg bg-secondary/50 p-2 ${
                    comment.leadReason.length > 80 ? 'cursor-pointer hover:bg-secondary/70' : ''
                  }`}
                  onClick={() => {
                    if (comment.leadReason && comment.leadReason.length > 80) {
                      setSelectedReason({ id: comment.id, text: comment.leadReason, leadType: comment.leadType })
                      setReasonPopupOpen(true)
                    }
                  }}
                >
                  <p className="text-xs font-medium text-muted-foreground">Lead Reason:</p>
                  <p className="text-xs text-foreground line-clamp-2">
                    {comment.leadReason}
                  </p>
                  {comment.leadReason.length > 80 && (
                    <p className="text-xs text-primary mt-1">Tap to view full reason</p>
                  )}
                </div>
              )}

              <p 
                className={`mb-3 text-sm leading-relaxed ${
                  comment.text.length > 150 ? 'cursor-pointer hover:text-foreground hover:underline' : ''
                }`}
                onClick={() => {
                  if (comment.text.length > 150) {
                    setSelectedCommentText({ id: comment.id, text: comment.text })
                    setCommentPopupOpen(true)
                  }
                }}
              >
                {comment.text.length > 150 
                  ? `${comment.text.substring(0, 150)}...` 
                  : comment.text}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    {comment.likes}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(comment)}
                    className="h-9 w-9 rounded-lg p-0"
                  >
                    {copiedId === comment.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  {comment.replied ? (
                    <Badge variant="secondary" className="rounded-lg">
                      Replied
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => onReply(comment)} className="rounded-lg">
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reason Popup Dialog */}
      <Dialog open={reasonPopupOpen} onOpenChange={setReasonPopupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Full Reason</DialogTitle>
            <DialogDescription>
              {selectedReason && (() => {
                const config = getLeadBadgeConfig(selectedReason.leadType)
                return (
                  <Badge className={`mt-2 w-fit ${config.className}`}>
                    {config.text} Lead
                  </Badge>
                )
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed text-foreground">
              {selectedReason?.text}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Popup Dialog */}
      <Dialog open={commentPopupOpen} onOpenChange={setCommentPopupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Full Comment</DialogTitle>
            <DialogDescription>
              View the complete comment text
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {selectedCommentText?.text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
