import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Marketing Agency",
    avatar: "/professional-woman-avatar.png",
    content:
      "Monsage completely changed how we find leads. We&apos;ve closed 15 new clients just from YouTube comments in the first month!",
  },
  {
    name: "Marcus Johnson",
    role: "SaaS Founder",
    avatar: "/professional-man-avatar.png",
    content:
      "I was skeptical at first, but the ROI is insane. Found my best customers in competitor video comments. Game changer.",
  },
  {
    name: "Emily Rodriguez",
    role: "Business Coach",
    avatar: "/latina-professional-avatar.png",
    content:
      "The interface is so clean and the workflow is seamless. I spend 10 minutes a day and generate more leads than cold emailing.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="border-y border-border bg-card/50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by Marketers</h2>
          <p className="mt-4 text-lg text-muted-foreground">See what our users are saying about Monsage</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
