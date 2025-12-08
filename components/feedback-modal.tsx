"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Loader2, Star } from "lucide-react"
import { toast } from "sonner"

interface FeedbackModalProps {
  analysisId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ analysisId, open, onOpenChange }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hovered, setHovered] = useState<number>(0)

  const handleSkip = () => {
    setRating(0)
    setComment("")
    setHovered(0)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!analysisId) {
      toast.error("Analysis ID is missing. Cannot submit feedback.")
      return
    }

    if (rating === 0) {
      toast.error("Please provide a rating before submitting.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis_id: analysisId,
          rating: rating,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to submit feedback")
      }

      toast.success("Thank you for your feedback!")
      handleSkip() // Reset and close
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    rating,
    setRating,
    hovered,
    setHovered,
    label,
  }: {
    rating: number
    setRating: (rating: number) => void
    hovered: number
    setHovered: (rating: number) => void
    label: string
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} / 5
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Help Us Improve</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the analysis quality. This will only take a moment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            rating={rating}
            setRating={setRating}
            hovered={hovered}
            setHovered={setHovered}
            label="Was this analysis accurate?"
          />

          <div className="space-y-2">
            <Label htmlFor="feedback-comment" className="text-sm font-medium">
              Any additional feedback? (Optional)
            </Label>
            <Textarea
              id="feedback-comment"
              placeholder="Tell us what you think..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length} / 500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

