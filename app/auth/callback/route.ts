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

    const loginUrl = new URL('/login', requestUrl.origin)
    const errorMessage = error.message?.toLowerCase() || ''
    
    // Check for specific error types
    if (errorMessage.includes('rate limit') || error.status === 429) {
      loginUrl.searchParams.set('error', 'rate_limit')
      loginUrl.searchParams.set('message', 'Too many requests. Please wait 1 hour before requesting another magic link.')
    } else if (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('otp_expired')) {
      loginUrl.searchParams.set('error', 'expired')
      loginUrl.searchParams.set('message', 'This magic link has expired. Please request a new one.')
    } else {
      loginUrl.searchParams.set('error', 'auth_failed')
      loginUrl.searchParams.set('message', error.message || 'Could not authenticate. Please try again.')
    }
    
    return NextResponse.redirect(loginUrl)
  }

  // Handle error in hash fragment (Supabase sometimes puts errors there)
  const hashParams = new URLSearchParams(requestUrl.hash.substring(1))
  const errorDescription = hashParams.get('error_description')
  const errorCode = hashParams.get('error_code')
  
  if (errorDescription || errorCode) {
    const loginUrl = new URL('/login', requestUrl.origin)
    
    if (errorCode === 'otp_expired' || errorDescription?.toLowerCase().includes('expired')) {
      loginUrl.searchParams.set('error', 'expired')
      loginUrl.searchParams.set('message', 'This magic link has expired. Please request a new one.')
    } else if (errorDescription?.toLowerCase().includes('rate limit')) {
      loginUrl.searchParams.set('error', 'rate_limit')
      loginUrl.searchParams.set('message', 'Too many requests. Please wait 1 hour before requesting another magic link.')
    } else {
      loginUrl.searchParams.set('error', 'auth_failed')
      loginUrl.searchParams.set('message', decodeURIComponent(errorDescription || 'Could not authenticate'))
    }
    
    return NextResponse.redirect(loginUrl)
  }

  // If there's no code and no error in hash, redirect to login
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'auth_failed')
  loginUrl.searchParams.set('message', 'No authentication code provided. Please request a new magic link.')
  return NextResponse.redirect(loginUrl)
}

