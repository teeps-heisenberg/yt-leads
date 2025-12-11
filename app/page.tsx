import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
