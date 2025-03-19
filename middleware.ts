import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define which routes require authentication
const protectedRoutes = [
  "/dashboard",
  "/builder/edit",
]

// Define which routes are only for guests (not logged in users)
const guestOnlyRoutes = [
  "/auth",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // Check if the user is authenticated
  const isAuthenticated = !!token
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the route is for guests only
  const isGuestOnlyRoute = guestOnlyRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the user is in guest mode
  const isGuestMode = request.cookies.get("guestMode")?.value === "true"
  
  // Allow guest mode users to access protected routes
  if (isProtectedRoute && !isAuthenticated && !isGuestMode) {
    const redirectUrl = new URL("/auth", request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect authenticated users from guest-only routes to dashboard
  if (isGuestOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
} 