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
        { error: 'Unauthorized. Please sign in to submit feedback.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { analysis_id, rating, comment } = body

    // Validate required fields
    if (!analysis_id) {
      return NextResponse.json(
        { error: 'Missing required field: analysis_id is required.' },
        { status: 400 }
      )
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Rating must be a number between 1 and 5.' },
        { status: 400 }
      )
    }

    // Verify that the analysis exists and belongs to the user
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id, user_id')
      .eq('id', analysis_id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found.' },
        { status: 404 }
      )
    }

    // Optional: Verify the analysis belongs to the user (for security)
    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only provide feedback for your own analyses.' },
        { status: 403 }
      )
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        analysis_id: analysis_id,
        rating: Math.round(rating), // Ensure integer
        comment: comment && comment.trim() ? comment.trim() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving feedback:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback to database.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      success: true,
    })
  } catch (error) {
    console.error('Error in save feedback route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

