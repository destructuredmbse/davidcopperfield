import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Next.js Middleware for Authentication and Route Protection
 * 
 * This middleware integrates with NextAuth.js v5 to provide authentication-based
 * route protection for the David Copperfield production management system.
 * It handles public routes, protected application routes, and admin-only sections.
 * 
 * @middleware
 * @param {AuthRequest} req - NextAuth-enhanced request with authentication context
 * @returns {NextResponse} Response allowing access, redirecting, or blocking the request
 * 
 * Route Protection Logic:
 * - Public routes: Always accessible (auth pages, API, static files, home)
 * - Protected routes: Require valid authentication session
 * - Admin routes: Require authentication AND admin privileges
 * 
 * Protected Application Routes:
 * - /cast, /characters, /ensembles, /acts
 * - /rehearsals, /availability, /calendar
 * - /admin (admin privileges required)
 * 
 * @example
 * // Unauthenticated user accessing /cast
 * // Redirects to: /auth/signin?callbackUrl=/cast
 * 
 * // Non-admin user accessing /admin  
 * // Redirects to: / (home page)
 * 
 * @see {@link https://nextjs.org/docs/advanced-features/middleware} Next.js Middleware
 * @see {@link https://next-auth.js.org/configuration/nextjs#middleware} NextAuth Middleware
 */
export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Always allow these routes
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/icon') ||
      pathname === '/') {
    return NextResponse.next()
  }
  
  // For protected routes, check authentication
  const isProtectedRoute = pathname.startsWith('/admin') || 
                          pathname.startsWith('/cast') ||
                          pathname.startsWith('/characters') ||
                          pathname.startsWith('/ensembles') ||
                          pathname.startsWith('/acts') ||
                          pathname.startsWith('/rehearsals') ||
                          pathname.startsWith('/availability') ||
                          pathname.startsWith('/calendar')
  
  if (isProtectedRoute && !req.auth) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // Check admin routes specifically
  if (pathname.startsWith('/admin') && req.auth && !req.auth.user?.is_admin) {
    const homeUrl = new URL('/', req.url)
    return NextResponse.redirect(homeUrl)
  }
  
  return NextResponse.next()
})

/**
 * Middleware Configuration
 * 
 * Defines which routes the middleware should process using glob patterns.
 * Excludes static assets and authentication API routes to prevent interference
 * with NextAuth.js functionality and optimize performance.
 * 
 * Excluded Patterns:
 * - api/auth/* - NextAuth.js API routes
 * - _next/static/* - Next.js static assets
 * - _next/image/* - Next.js image optimization
 * - favicon.ico - Browser favicon requests
 * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp - Image files
 * 
 * @see {@link https://nextjs.org/docs/advanced-features/middleware#matcher} Middleware Matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes we want to allow
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}