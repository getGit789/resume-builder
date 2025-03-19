import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Define validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const result = signupSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.errors },
        { status: 400 }
      )
    }
    
    const { name, email, password } = result.data
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10)
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "An error occurred during signup" },
      { status: 500 }
    )
  }
} 