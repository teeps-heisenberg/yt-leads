import { NextRequest, NextResponse } from "next/server"

// YouTube API response types
interface YouTubeCommentSnippet {
  textDisplay: string
  authorDisplayName: string
  authorProfileImageUrl: string
  likeCount: number
  publishedAt: string
}

interface YouTubeComment {
  id: string
  snippet: {
    topLevelComment?: {
      snippet: YouTubeCommentSnippet
    }
    snippet?: YouTubeCommentSnippet
  }
}

interface YouTubeApiResponse {
  items: YouTubeComment[]
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  // Remove whitespace
  url = url.trim()

  // Patterns for different YouTube URL formats
  const patterns = [
    // Standard: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    // Shorts: https://youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    // Mobile: https://m.youtube.com/watch?v=VIDEO_ID
    /m\.youtube\.com\/watch\?v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // If no pattern matches, check if it's already a video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  return null
}

// Format date to relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  }
  const months = Math.floor(diffInSeconds / 2592000)
  return `${months} ${months === 1 ? "month" : "months"} ago`
}

export async function GET(request: NextRequest) {
  try {
    // Get video URL or ID from query parameter
    const searchParams = request.nextUrl.searchParams
    const videoUrl = searchParams.get("url") || searchParams.get("videoId")

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Missing video URL or videoId parameter" },
        { status: 400 }
      )
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl)

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format. Please provide a valid YouTube video URL." },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured. Please set YOUTUBE_API_KEY in your environment variables." },
        { status: 500 }
      )
    }

    // Build YouTube API URL
    const apiUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads")
    apiUrl.searchParams.append("part", "snippet,replies")
    apiUrl.searchParams.append("videoId", videoId)
    apiUrl.searchParams.append("maxResults", "100")
    apiUrl.searchParams.append("order", "time")
    apiUrl.searchParams.append("textFormat", "plainText")
    apiUrl.searchParams.append("key", apiKey)

    // Fetch comments from YouTube API
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle specific YouTube API errors
      if (response.status === 403) {
        return NextResponse.json(
          { error: "YouTube API access denied. Please check your API key and quota." },
          { status: 403 }
        )
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Video not found. Please check if the video exists and is publicly accessible." },
          { status: 404 }
        )
      }
      if (response.status === 400) {
        return NextResponse.json(
          { error: errorData.error?.message || "Invalid request to YouTube API." },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `YouTube API error: ${errorData.error?.message || response.statusText}` },
        { status: response.status }
      )
    }

    const data: YouTubeApiResponse = await response.json()

    // Check if video has comments disabled
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "This video has no comments or comments are disabled." },
        { status: 404 }
      )
    }

    // Transform YouTube API response to our Comment format
    const comments = data.items.map((item, index) => {
      // Get the comment snippet (top-level comment)
      const snippet = item.snippet.topLevelComment?.snippet || item.snippet.snippet

      if (!snippet) {
        // Fallback if snippet structure is unexpected
        return null
      }

      return {
        id: item.id || `comment-${index}`,
        username: snippet.authorDisplayName || "Unknown User",
        avatar: snippet.authorProfileImageUrl || "/placeholder.svg",
        text: snippet.textDisplay || "",
        date: formatRelativeTime(snippet.publishedAt),
        likes: snippet.likeCount || 0,
        replied: false,
      }
    }).filter((comment) => comment !== null) // Remove any null entries

    return NextResponse.json({
      comments,
      totalResults: data.pageInfo?.totalResults || comments.length,
      hasMore: !!data.nextPageToken,
      nextPageToken: data.nextPageToken,
    })

  } catch (error) {
    console.error("Error fetching YouTube comments:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to fetch comments. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

