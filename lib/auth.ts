import { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

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
export async function getCurrentUser(request: Request | NextRequest) {
  const token = getAuthToken(request)
  
  if (!token) {
    return null
  }
  
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
  
  return user
}

/**
 * Check if the request is authenticated
 */
export async function isAuthenticated(request: Request | NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request)
  return !!user
}

/**
 * Create an authentication middleware
 */
export function withAuth(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
    
    return handler(request, user, ...args)
  }
} 