import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, TrendingUp, Users, Zap } from "lucide-react"

interface StatsCardsProps {
  totalComments: number
  leadsFound: number
  repliesSent: number
}

export function StatsCards({ totalComments, leadsFound, repliesSent }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Comments",
      value: totalComments,
      icon: MessageSquare,
      description: "Extracted from videos",
    },
    {
      title: "Leads Found",
      value: leadsFound,
      icon: Users,
      description: "Potential clients identified",
    },
    {
      title: "Replies Sent",
      value: repliesSent,
      icon: Zap,
      description: "Engagement actions",
    },
    {
      title: "Conversion Rate",
      value: totalComments > 0 ? `${Math.round((repliesSent / totalComments) * 100)}%` : "0%",
      icon: TrendingUp,
      description: "Comments to replies",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
