import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Get the token from the Authorization header
    const token = getAuthToken(request)
    
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Verify the token
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
    ) as { id: string }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth verification error:", error)
    
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return NextResponse.json(
        { message: "Token expired" },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    )
  }
} 