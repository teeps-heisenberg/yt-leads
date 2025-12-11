"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BillingToggle } from "@/components/billing-toggle"
import { PricingCard } from "@/components/pricing-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { HelpCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  isPopular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: Math.round(29 * 12 * 0.7), // 30% off annual
    features: [
      "Analysis of 20 videos per month",
      "AI Hot/Warm/Cold Detection",
      "Essential answer templates",
      "Limited history",
      "Standard support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 89,
    annualPrice: Math.round(89 * 12 * 0.7), // 30% off annual
    features: [
      "Unlimited analysis",
      "Advanced lead prioritization",
      "Premium response templates",
      "Unlimited backup & history",
      "Accelerated (faster) analysis",
      "Priority support",
    ],
    isPopular: true,
  },
  {
    id: "ultra",
    name: "Ultra (Enterprise)",
    monthlyPrice: 190,
    annualPrice: Math.round(190 * 12 * 0.7), // 30% off annual
    features: [
      "5 team accounts (team seats)",
      "White-Label (use the tool for your clients)",
      "Premium support 1:1",
      "Advanced performance and monitoring",
      "Priority on new features",
      "Dedicated manager (optional)",
    ],
  },
]

export default function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      router.push("/signup")
    } else {
      // TODO: Integrate with subscription/payment flow
      console.log("Selected plan:", planId, "Billing:", billingCycle)
      // For now, just log - will be implemented later
    }
  }

  const getPrice = (plan: PricingPlan) => {
    if (billingCycle === "annual") {
      // Calculate monthly equivalent for annual (divide by 12)
      return Math.round(plan.annualPrice / 12)
    }
    return plan.monthlyPrice
  }

  const isInDashboard = isAuthenticated === true

  return (
    <div className={cn("min-h-screen", !isInDashboard && "relative")}>
      {/* Background gradients - only show in standalone mode */}
      {!isInDashboard && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>
      )}

      <div
        className={cn(
          "mx-auto max-w-7xl",
          isInDashboard ? "px-4 py-8 sm:px-6 sm:py-12" : "px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        )}
      >
        {/* Back Button - only show for unauthenticated users */}
        {!isInDashboard && (
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className={cn("font-bold tracking-tight", isInDashboard ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl")}>
            Choose Your Plan
          </h1>
          <p className={cn("mx-auto mt-4 max-w-2xl text-muted-foreground", isInDashboard ? "text-base" : "text-lg")}>
            Select the perfect plan for your needs. All plans include a free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={cn("flex justify-center", isInDashboard ? "mt-8" : "mt-12")}>
          <BillingToggle
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
          />
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={getPrice(plan)}
              features={plan.features}
              isPopular={plan.isPopular}
              isAuthenticated={isAuthenticated === true}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {/* FAQ Button */}
        <div className={cn("flex justify-center", isInDashboard ? "mt-12" : "mt-16")}>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full hover:bg-secondary/50"
            onClick={() => {
              // TODO: Implement FAQ modal or scroll to FAQ section
              console.log("FAQ clicked")
            }}
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            FAQ
          </Button>
        </div>
      </div>
    </div>
  )
}

