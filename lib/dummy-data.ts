export type LeadType = "hot" | "warm" | "cold"

export interface Comment {
  id: string
  username: string
  avatar: string
  text: string
  date: string
  likes: number
  replied: boolean
  leadType?: LeadType // AI classification: hot, warm, or cold
  leadReason?: string // Reason for the classification
  reply?: string // AI-generated generic reply for the comment
}

export const dummyComments: Comment[] = [
  {
    id: "1",
    username: "TechEnthusiast42",
    avatar: "/male-gamer-avatar.png",
    text: "This is exactly what I've been looking for! Does anyone know a good tool to help with lead generation?",
    date: "2 hours ago",
    likes: 45,
    replied: false,
    leadType: "hot",
    leadReason: "High intent - actively seeking a solution and asking for recommendations",
    reply: "Hi! I'd love to help you with lead generation. I've been using a few tools that work really well. Would you like me to share what's been working for me? Feel free to DM me!",
  },
  {
    id: "2",
    username: "MarketingPro",
    avatar: "/professional-woman-avatar.png",
    text: "Great video! I'm struggling to find clients for my agency. Any recommendations?",
    date: "5 hours ago",
    likes: 23,
    replied: false,
    leadType: "hot",
    leadReason: "High intent - has a business problem and asking for help",
    reply: "Thanks for watching! I've helped several agencies with client acquisition. The strategy I shared works great, and I have some additional tactics that might help. Let's connect - I'd be happy to share more specific advice for your agency!",
  },
  {
    id: "3",
    username: "StartupFounder",
    avatar: "/startup-founder-avatar.png",
    text: "Just launched my SaaS and need help with customer acquisition. This content is gold!",
    date: "1 day ago",
    likes: 89,
    replied: true,
    leadType: "hot",
    leadReason: "High intent - actively needs customer acquisition help for their SaaS",
    reply: "Congratulations on launching! Customer acquisition for SaaS is my specialty. I've got a proven framework that's helped many SaaS founders. Would love to chat about your specific needs - let's connect!",
  },
  {
    id: "4",
    username: "DigitalNomad",
    avatar: "/digital-nomad-avatar.jpg",
    text: "Been watching all your videos. Looking for a marketing automation tool - any suggestions?",
    date: "1 day ago",
    likes: 34,
    replied: false,
    leadType: "warm",
    leadReason: "Medium intent - interested but not urgent, exploring options",
    reply: "Thanks for being a regular viewer! I've tested quite a few marketing automation tools. I can share my top recommendations based on your specific needs. What's your main use case?",
  },
  {
    id: "5",
    username: "SmallBizOwner",
    avatar: "/small-business-owner-avatar.jpg",
    text: "This strategy works! But I need help scaling my outreach. Who can help?",
    date: "2 days ago",
    likes: 56,
    replied: true,
    leadType: "warm",
    leadReason: "Medium intent - has tried the strategy and needs scaling help",
    reply: "Awesome to hear it's working for you! Scaling is the next step. I've helped many businesses scale their outreach effectively. Let's chat about your current setup and I can share some scaling strategies that have worked well!",
  },
  {
    id: "6",
    username: "GrowthHacker",
    avatar: "/growth-hacker-avatar.jpg",
    text: "Impressive results! I'm building a similar product and would love to connect.",
    date: "3 days ago",
    likes: 78,
    replied: false,
    leadType: "warm",
    leadReason: "Medium intent - interested in connecting but not urgent",
    reply: "Thanks! Always happy to connect with fellow builders. I'd love to hear about your product and see how we might collaborate. Feel free to reach out!",
  },
  {
    id: "7",
    username: "CuriousLearner",
    avatar: "/placeholder.svg",
    text: "Interesting approach. Will bookmark this for later reference.",
    date: "4 days ago",
    likes: 12,
    replied: false,
    leadType: "cold",
    leadReason: "Low intent - just browsing, no immediate need",
    reply: "Thanks for watching! Glad you found it useful. Feel free to reach out if you have any questions when you're ready to implement it!",
  },
  {
    id: "8",
    username: "IndustryObserver",
    avatar: "/placeholder.svg",
    text: "Thanks for sharing! Always good to learn new strategies.",
    date: "5 days ago",
    likes: 8,
    replied: false,
    leadType: "cold",
    leadReason: "Low intent - passive engagement, no clear buying signal",
    reply: "You're welcome! Always happy to share what I've learned. Thanks for watching!",
  },
  {
    id: "9",
    username: "Entrepreneur2024",
    avatar: "/placeholder.svg",
    text: "I need this NOW! My business is struggling and I'm desperate for leads. Can someone help me ASAP?",
    date: "1 hour ago",
    likes: 92,
    replied: false,
    leadType: "hot",
    leadReason: "Very high intent - urgent need, actively seeking immediate help",
    reply: "I understand the urgency! I've helped many businesses in similar situations turn things around quickly. Let's connect ASAP - I can share some immediate action steps that can help you start generating leads right away. DM me!",
  },
  {
    id: "10",
    username: "ContentCreator",
    avatar: "/placeholder.svg",
    text: "Nice tips! Maybe I'll try this in a few months when I have more time.",
    date: "6 days ago",
    likes: 5,
    replied: false,
    leadType: "cold",
    leadReason: "Low intent - future consideration, not immediate need",
    reply: "Thanks for watching! When you're ready to implement, feel free to reach out if you need any help. Good luck with your content!",
  },
]

export async function fetchComments(videoUrl: string): Promise<Comment[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In production, this would call the YouTube API
  console.log("Fetching comments for:", videoUrl)

  return dummyComments
}
