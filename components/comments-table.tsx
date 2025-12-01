"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Comment } from "@/lib/dummy-data"
import { Heart, MessageSquare, Search } from "lucide-react"
import { useState } from "react"

interface CommentsTableProps {
  comments: Comment[]
  onReply: (comment: Comment) => void
}

export function CommentsTable({ comments, onReply }: CommentsTableProps) {
  const [search, setSearch] = useState("")

  const filteredComments = comments.filter(
    (comment) =>
      comment.text.toLowerCase().includes(search.toLowerCase()) ||
      comment.username.toLowerCase().includes(search.toLowerCase()),
  )

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

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Likes</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No comments found
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment.id}>
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
                    <p className="line-clamp-2 text-sm">{comment.text}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{comment.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      {comment.likes}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
