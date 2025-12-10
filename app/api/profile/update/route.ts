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
        { error: 'Unauthorized. Please sign in to update your profile.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { first_name, last_name } = body

    // Validate inputs
    if (first_name !== undefined && (!first_name || typeof first_name !== 'string')) {
      return NextResponse.json(
        { error: 'First name must be a non-empty string.' },
        { status: 400 }
      )
    }

    if (last_name !== undefined && (!last_name || typeof last_name !== 'string')) {
      return NextResponse.json(
        { error: 'Last name must be a non-empty string.' },
        { status: 400 }
      )
    }

    // Check if profile exists, create if it doesn't
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: first_name?.trim() || null,
          last_name: last_name?.trim() || null,
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile.' },
          { status: 500 }
        )
      }
    } else {
      // Update existing profile
      const updateData: { first_name?: string | null; last_name?: string | null } = {}
      
      if (first_name !== undefined) {
        updateData.first_name = first_name.trim() || null
      }
      if (last_name !== undefined) {
        updateData.last_name = last_name.trim() || null
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating profile:', updateError)
          return NextResponse.json(
            { error: 'Failed to update profile.' },
            { status: 500 }
          )
        }
      }
    }

    // Also update user_metadata to keep in sync
    const metadataUpdate: { first_name?: string; last_name?: string } = {}
    if (first_name !== undefined) {
      metadataUpdate.first_name = first_name.trim()
    }
    if (last_name !== undefined) {
      metadataUpdate.last_name = last_name.trim()
    }

    if (Object.keys(metadataUpdate).length > 0) {
      const currentMetadata = user.user_metadata || {}
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          ...metadataUpdate,
        },
      })

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError)
        // Don't fail the request if metadata update fails, but log it
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error in profile update route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch user profile
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Fetch profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      // If profile doesn't exist, return user_metadata as fallback
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          from_metadata: true, // Flag to indicate this is from metadata
        })
      }
      
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile.' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in profile GET route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

