export interface Comment {
  id: string
  username: string
  avatar: string
  text: string
  date: string
  likes: number
  replied: boolean
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
  },
  {
    id: "2",
    username: "MarketingPro",
    avatar: "/professional-woman-avatar.png",
    text: "Great video! I'm struggling to find clients for my agency. Any recommendations?",
    date: "5 hours ago",
    likes: 23,
    replied: false,
  },
  {
    id: "3",
    username: "StartupFounder",
    avatar: "/startup-founder-avatar.png",
    text: "Just launched my SaaS and need help with customer acquisition. This content is gold!",
    date: "1 day ago",
    likes: 89,
    replied: true,
  },
  {
    id: "4",
    username: "DigitalNomad",
    avatar: "/digital-nomad-avatar.jpg",
    text: "Been watching all your videos. Looking for a marketing automation tool - any suggestions?",
    date: "1 day ago",
    likes: 34,
    replied: false,
  },
  {
    id: "5",
    username: "SmallBizOwner",
    avatar: "/small-business-owner-avatar.jpg",
    text: "This strategy works! But I need help scaling my outreach. Who can help?",
    date: "2 days ago",
    likes: 56,
    replied: true,
  },
  {
    id: "6",
    username: "GrowthHacker",
    avatar: "/growth-hacker-avatar.jpg",
    text: "Impressive results! I'm building a similar product and would love to connect.",
    date: "3 days ago",
    likes: 78,
    replied: false,
  },
]

export async function fetchComments(videoUrl: string): Promise<Comment[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In production, this would call the YouTube API
  console.log("Fetching comments for:", videoUrl)

  return dummyComments
}
