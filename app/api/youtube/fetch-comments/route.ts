import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server';
import { getYouTubeClientForUser } from '@/lib/youtube-client';

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
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

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

    // Get YouTube client with user's OAuth tokens
    const youtube = await getYouTubeClientForUser(user.id);

    // Fetch comments using YouTube API
    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId: videoId,
      maxResults: 100,
      order: 'time',
      textFormat: 'plainText',
    });

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json(
        { error: "This video has no comments or comments are disabled." },
        { status: 404 }
      )
    }

    // Transform YouTube API response to our Comment format
    const comments = response.data.items.map((item, index) => {
      const snippet = item.snippet?.topLevelComment?.snippet;

      if (!snippet) {
        return null;
      }

      return {
        id: item.snippet?.topLevelComment?.id || item.id || `comment-${index}`,
        username: snippet.authorDisplayName || "Unknown User",
        avatar: snippet.authorProfileImageUrl || "/placeholder.svg",
        text: snippet.textDisplay || "",
        date: formatRelativeTime(snippet.publishedAt || ''),
        likes: snippet.likeCount || 0,
        replied: false,
      }
    }).filter((comment) => comment !== null);

    return NextResponse.json({
      comments,
      totalResults: response.data.pageInfo?.totalResults || comments.length,
      hasMore: !!response.data.nextPageToken,
      nextPageToken: response.data.nextPageToken,
    })

  } catch (error) {
    console.error("Error fetching YouTube comments:", error)
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('not connected')) {
      return NextResponse.json(
        { 
          error: "YouTube account not connected",
          details: "Please connect your YouTube account in settings to use this feature."
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch comments. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

