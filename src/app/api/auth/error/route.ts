import { NextRequest, NextResponse } from "next/server"

/**
 * Authentication Error Handler API Route
 * 
 * This endpoint handles authentication errors from NextAuth.js v5 and provides
 * user-friendly error messages. It processes various error types and redirects
 * users to the signin page with appropriate error messages.
 * 
 * @route GET /api/auth/error
 * @route POST /api/auth/error
 * 
 * @param {NextRequest} request - The incoming HTTP request containing error parameters
 * @returns {NextResponse} Redirect response to signin page with error message
 * 
 * @example
 * // URL with error parameter
 * GET /api/auth/error?error=CredentialsSignin
 * // Redirects to: /auth/signin?error=Invalid username or password
 * 
 * @see {@link https://next-auth.js.org/configuration/pages#error-page} NextAuth Error Handling
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  
  // Map NextAuth error codes to user-friendly messages
  let errorMessage = 'An authentication error occurred'
  
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = 'Invalid username or password'
      break
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
      errorMessage = 'Authentication service error'
      break
    case 'OAuthAccountNotLinked':
      errorMessage = 'Account not linked'
      break
    case 'EmailSignin':
      errorMessage = 'Email authentication failed'
      break
    case 'SessionRequired':
      errorMessage = 'Session required'
      break
    case 'AccessDenied':
      errorMessage = 'Access denied'
      break
    default:
      // Use the error parameter directly if no specific mapping exists
      errorMessage = error || 'Unknown authentication error'
  }

  // Redirect to signin page with user-friendly error message
  const signinUrl = new URL('/auth/signin', request.url)
  signinUrl.searchParams.set('error', errorMessage)
  
  return NextResponse.redirect(signinUrl)
}

/**
 * POST handler - delegates to GET for consistency
 * Allows both GET and POST requests to the error endpoint
 */
export async function POST(request: NextRequest) {
  return GET(request)
}