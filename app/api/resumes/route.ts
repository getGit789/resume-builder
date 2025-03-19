import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';
import { getCurrentUser } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { AuthUser, ResumeWhereInput, ResumeSelect } from '@/types/resume';
import { defaultResumeData } from '@/lib/default-resume-data';

// Mock data for when database is unavailable
const mockResumes = [
  {
    id: 'mock-1',
    name: 'Professional Resume',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    template: 'professional',
    colorTheme: 'blue',
    font: 'Inter',
  },
  {
    id: 'mock-2',
    name: 'Creative Portfolio',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    template: 'modern',
    colorTheme: 'green',
    font: 'Roboto',
  },
];

/**
 * GET /api/resumes
 * Get all resumes for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request) as AuthUser | null;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error getting resumes:", error);
    return NextResponse.json(
      { error: "Failed to get resumes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes
 * Create a new resume
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request) as AuthUser | null;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, data = defaultResumeData, template = "professional", colorTheme = "default" } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    const resume = await prisma.resume.create({
      data: {
        name,
        data,
        template,
        colorTheme,
        userId: user.id,
      },
    });
    
    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
} 