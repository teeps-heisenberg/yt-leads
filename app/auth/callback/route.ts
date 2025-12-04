import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully exchanged code for session
      // Use absolute URL to avoid hydration issues
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }

    // Log error for debugging
    console.error('Auth callback error:', {
      message: error.message,
      status: error.status,
      name: error.name
    })

    // Redirect to login with generic error message
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'auth_failed')
    loginUrl.searchParams.set('message', error.message || 'Could not authenticate. Please try again.')
    
    return NextResponse.redirect(loginUrl)
  }

  // Handle error in hash fragment (Supabase sometimes puts errors there)
  const hashParams = new URLSearchParams(requestUrl.hash.substring(1))
  const errorDescription = hashParams.get('error_description')
  
  if (errorDescription) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'auth_failed')
    loginUrl.searchParams.set('message', decodeURIComponent(errorDescription || 'Could not authenticate'))
    
    return NextResponse.redirect(loginUrl)
  }

  // If there's no code and no error in hash, redirect to login
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'auth_failed')
  loginUrl.searchParams.set('message', 'No authentication code provided. Please try logging in again.')
  return NextResponse.redirect(loginUrl)
}

