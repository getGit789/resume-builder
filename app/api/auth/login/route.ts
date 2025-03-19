import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { z } from "zod"
import { sign } from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      )
    }
    
    const { email, password } = result.data
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    })
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Verify password
    const passwordMatch = await compare(password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production",
      { expiresIn: "7d" }
    )
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    )
  }
} 