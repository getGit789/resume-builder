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
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
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