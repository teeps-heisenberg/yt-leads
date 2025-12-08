"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackBannerProps {
  onFeedbackClick: () => void
  onDismiss?: () => void
  className?: string
}

export function FeedbackBanner({ onFeedbackClick, onDismiss, className }: FeedbackBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">
          Was this analysis accurate?
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onFeedbackClick}
          size="sm"
          className="rounded-lg"
        >
          Provide Feedback
        </Button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Dismiss feedback banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

