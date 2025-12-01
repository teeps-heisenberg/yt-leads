import { Link2, MessageSquare, Users } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Link2,
    title: "Paste a YouTube Link",
    description: "Simply copy and paste any YouTube video URL into Monsage. Works with any public video.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Extract All Comments",
    description: "Our system pulls every comment from the video, organized and ready for you to browse.",
  },
  {
    step: "03",
    icon: Users,
    title: "Reply & Convert Leads",
    description: "Engage directly with potential clients. Reply to comments and turn viewers into customers.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to find and convert leads from YouTube
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-4xl font-bold text-muted-foreground/20">{step.step}</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
