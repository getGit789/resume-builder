import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// List of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/api/resumes',
]

// List of paths that are always public
const publicPaths = [
  '/auth',
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/builder', // Allow public access to builder
  '/api/export', // Allow public access to export APIs
]

// OAuth related paths that need CORS headers
const authPaths = [
  '/api/auth',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Add CORS headers for OAuth routes
  if (authPaths.some(path => pathname.startsWith(path))) {
    // For preflight requests
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      })
    }
    
    // For actual requests to auth endpoints, proceed with added headers
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!isProtectedPath) {
    return NextResponse.next()
  }
  
  // Check for authenticated session
  const token = await getToken({ req: request })
  
  if (token) {
    // Allow authenticated access
    return NextResponse.next()
  }
  
  // If no valid session, redirect to auth page
  const signInUrl = new URL('/auth', request.url)
  signInUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(signInUrl)
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 