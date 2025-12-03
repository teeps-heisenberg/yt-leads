import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to save analyses.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { video_url, video_id, results_json, total_comments, hot_leads, warm_leads, cold_leads } = body

    // Validate required fields
    if (!video_url || !results_json) {
      return NextResponse.json(
        { error: 'Missing required fields: video_url and results_json are required.' },
        { status: 400 }
      )
    }

    // Insert into analyses table
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        video_url,
        video_id: video_id || null,
        results_json,
        total_comments: total_comments || 0,
        hot_leads: hot_leads || 0,
        warm_leads: warm_leads || 0,
        cold_leads: cold_leads || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving analysis:', error)
      return NextResponse.json(
        { error: 'Failed to save analysis to database.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      success: true,
    })
  } catch (error) {
    console.error('Error in save analysis route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

