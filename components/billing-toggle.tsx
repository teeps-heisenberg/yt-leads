"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BillingToggleProps {
  billingCycle: "monthly" | "annual"
  onBillingCycleChange: (cycle: "monthly" | "annual") => void
  className?: string
}

export function BillingToggle({
  billingCycle,
  onBillingCycleChange,
  className,
}: BillingToggleProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative inline-flex items-center rounded-lg border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => onBillingCycleChange("monthly")}
          className={cn(
            "relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            billingCycle === "monthly"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => onBillingCycleChange("annual")}
            className={cn(
              "relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
              billingCycle === "annual"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
          </button>
          <Badge
            className="absolute -right-1 -top-3 z-20 rounded-full border-purple-500/50 bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300"
            variant="outline"
          >
            30% off
          </Badge>
        </div>
      </div>
    </div>
  )
}

