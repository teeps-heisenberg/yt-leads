import { createClient } from '@/lib/supabase/client'

export interface UpdateNameResult {
  success: boolean
  error?: string
}

export interface UpdateEmailResult {
  success: boolean
  error?: string
  requiresConfirmation?: boolean
}

export interface UpdatePasswordResult {
  success: boolean
  error?: string
}

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at?: string
  updated_at?: string
  from_metadata?: boolean // Flag indicating data came from metadata fallback
}

/**
 * Get user profile from profiles table or fallback to user_metadata
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'GET',
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      console.error('Failed to fetch profile')
      return null
    }

    const profile = await response.json()
    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update user's first and last name in both user_metadata and profiles table
 */
export async function updateUserName(
  firstName: string,
  lastName: string
): Promise<UpdateNameResult> {
  try {
    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      return {
        success: false,
        error: 'First name and last name are required',
      }
    }

    if (firstName.trim().length > 50 || lastName.trim().length > 50) {
      return {
        success: false,
        error: 'Name fields must be 50 characters or less',
      }
    }

    // Update via API endpoint which handles both profiles table and user_metadata
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || 'Failed to update name. Please try again.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating user name:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Update user's email address
 * Note: Supabase will send a confirmation email to the new address
 */
export async function updateUserEmail(
  newEmail: string,
  currentPassword: string
): Promise<UpdateEmailResult> {
  try {
    const supabase = createClient()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.trim())) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      }
    }

    // Get current user to check if email is the same
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    if (user.email?.toLowerCase() === newEmail.trim().toLowerCase()) {
      return {
        success: false,
        error: 'New email must be different from current email',
      }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Update email
    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    })

    if (error) {
      console.error('Error updating user email:', error)
      return {
        success: false,
        error: error.message || 'Failed to update email. Please try again.',
      }
    }

    return {
      success: true,
      requiresConfirmation: true,
    }
  } catch (error) {
    console.error('Unexpected error updating user email:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Update user's password
 * Requires current password for verification
 */
export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<UpdatePasswordResult> {
  try {
    const supabase = createClient()

    // Validate password length
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long',
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error updating user password:', error)
      return {
        success: false,
        error: error.message || 'Failed to update password. Please try again.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating user password:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

