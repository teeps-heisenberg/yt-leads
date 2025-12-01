"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { dummyComments } from "@/lib/dummy-data"
import { CheckCircle2, Clock } from "lucide-react"

export default function RepliesPage() {
  const repliedComments = dummyComments.filter((c) => c.replied)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Replies</h2>
        <p className="text-muted-foreground">Track your engagement history and replied comments.</p>
      </div>

      {repliedComments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">No replies yet</p>
            <p className="text-sm text-muted-foreground">Start replying to comments to see them here</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {repliedComments.map((comment) => (
            <Card key={comment.id} className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
                      <AvatarFallback>{comment.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.username}</p>
                        <Badge variant="secondary" className="gap-1 rounded-lg">
                          <CheckCircle2 className="h-3 w-3" />
                          Replied
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                      <p className="text-xs text-muted-foreground">{comment.date}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
