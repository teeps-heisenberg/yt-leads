import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Powered by YouTube API</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Turn YouTube Comments Into <span className="text-primary">Clients</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Paste a video link, extract leads, and reply directly — all from one dashboard. Find potential clients
            hiding in your competitors&apos; comment sections.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full rounded-xl px-8 sm:w-auto">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full rounded-xl px-8 sm:w-auto bg-transparent">
              <Link href="/login">
                <Play className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
        </div>

        {/* Dashboard preview */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="rounded-xl bg-secondary/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="space-y-3">
                <div className="h-10 w-full rounded-lg bg-muted/50" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="h-24 rounded-lg bg-muted/30" />
                  <div className="h-24 rounded-lg bg-muted/30" />
                  <div className="h-24 rounded-lg bg-muted/30" />
                </div>
                <div className="h-40 rounded-lg bg-muted/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
