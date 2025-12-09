import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to load analyses.' },
        { status: 401 }
      )
    }

    // Query last analysis for this user
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no rows found, that's okay - return null
      if (error.code === 'PGRST116') {
        return NextResponse.json(null)
      }
      
      console.error('Error loading last analysis:', error)
      return NextResponse.json(
        { error: 'Failed to load last analysis.' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in load last analysis route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}




