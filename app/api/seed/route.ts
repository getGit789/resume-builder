import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Test user already exists", userId: existingUser.id },
        { status: 200 }
      );
    }

    // Create test user
    const hashedPassword = await hash("Password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(
      { message: "Test user created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "An error occurred during seeding" },
      { status: 500 }
    );
  }
} 