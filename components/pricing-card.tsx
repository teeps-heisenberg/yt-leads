"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: number
  features: string[]
  isPopular?: boolean
  isAuthenticated?: boolean
  onSelect: () => void
  className?: string
}

export function PricingCard({
  name,
  price,
  features,
  isPopular = false,
  isAuthenticated = false,
  onSelect,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/30",
        isPopular && "border-primary/50 shadow-primary/10",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="border-purple-500/50 bg-purple-500/20 text-purple-300" variant="outline">
            Popular
          </Badge>
        </div>
      )}
      <CardHeader className="space-y-4 pb-4">
        <div>
          <h3 className="text-2xl font-bold">{name}</h3>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">€{price}</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm leading-relaxed text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSelect}
          className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg"
          size="lg"
        >
          {isAuthenticated ? "Upgrade Plan" : "Start for free"}
        </Button>
      </CardFooter>
    </Card>
  )
}

