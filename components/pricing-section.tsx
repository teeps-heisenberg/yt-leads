"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BillingToggle } from "@/components/billing-toggle"
import { PricingCard } from "@/components/pricing-card"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

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

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const router = useRouter()

  const handleSelectPlan = (planId: string) => {
    // Always redirect to signup for unauthenticated users on home page
    router.push("/signup")
  }

  const getPrice = (plan: PricingPlan) => {
    if (billingCycle === "annual") {
      // Calculate monthly equivalent for annual (divide by 12)
      return Math.round(plan.annualPrice / 12)
    }
    return plan.monthlyPrice
  }

  return (
    <section id="pricing" className="relative py-20 sm:py-32">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Select the perfect plan for your needs. All plans include a free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
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
              isAuthenticated={false}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {/* FAQ Button */}
        <div className="mt-16 flex justify-center">
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
    </section>
  )
}

