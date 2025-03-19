import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { AuthUser } from "@/types/resume"
import { verify } from "jsonwebtoken"

/**
 * Extract the auth token from the request headers
 */
export function getAuthToken(request: Request | NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  return authHeader.split(" ")[1]
}

/**
 * Verify the JWT token and return the decoded payload
 */
export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
    ) as { id: string; email: string }
    
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Get the current user from the request
 */
export async function getCurrentUser(request: Request | NextRequest): Promise<AuthUser | null> {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      // Check for guest mode cookie
      const cookies = request.headers.get('cookie') || ''
      const isGuestMode = cookies.includes('guestMode=true')
      
      if (isGuestMode) {
        // Extract guest token from cookies with a more robust pattern
        const guestTokenRegex = /guestToken=([^;]+)/
        const guestTokenMatch = cookies.match(guestTokenRegex)
        const guestToken = guestTokenMatch?.[1] || `guest-${Date.now()}`
        
        console.log('Using guest mode with token:', guestToken)
        
        // If no guestToken cookie exists, we'll need to set it in the response
        if (!guestTokenMatch) {
          console.log('New guest token generated:', guestToken)
        }
        
        return {
          id: guestToken,
          name: 'Guest User',
          email: `guest-${guestToken.substring(0, 8)}@example.com`,
          createdAt: new Date(),
          isGuest: true,
          guestToken,
        }
      }
      
      console.log('No session or guest mode found')
      return null
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })
    
    if (!user) {
      console.log('User not found in database:', session.user.email)
      return null
    }
    
    return {
      ...user,
      isGuest: false,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if the request is authenticated
 */
export async function isAuthenticated(request: Request | NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request)
  return !!user
}

/**
 * HOC to protect API routes
 */
export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return handler(request, ...args)
  }
} 