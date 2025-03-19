import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/redis';
import { getCurrentUser } from '@/lib/auth';
import { AuthUser } from '@/types/resume';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: {
    id: string;
  };
}

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
    guestToken: null,
  },
  {
    id: 'mock-2',
    name: 'Creative Portfolio',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    template: 'modern',
    colorTheme: 'green',
    font: 'Roboto',
    guestToken: null,
  },
];

// Get mock resume data
function getMockResume(id: string) {
  return mockResumes.find(resume => resume.id === id) || null;
}

// Helper function to extract guest token from request
function getGuestToken(request: Request | NextRequest): string | null {
  // Check headers first
  const token = request.headers.get('X-Guest-Token');
  if (token) return token;
  
  // Then check cookies
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/guestToken=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * GET /api/resumes/[id]
 * Get a specific resume
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is available
    if (!params?.id) {
      return new NextResponse('Resume ID is required', { status: 400 });
    }
    
    // Try to get user from session
    const session = await getServerSession(authOptions);
    const guestToken = getGuestToken(request);
    
    // If no session and no guest token, return unauthorized
    if (!session?.user?.email && !guestToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Build query based on auth status
    const where: any = { id: params.id };
    
    // If user is authenticated, filter by user ID
    if (session?.user?.id) {
      where.userId = session.user.id;
    } 
    // If guest mode, filter by guest token
    else if (guestToken) {
      where.guestToken = guestToken;
    }

    console.log('Fetching resume with query:', where);

    const resume = await prisma.resume.findFirst({
      where,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        template: true,
        colorTheme: true,
        font: true,
        isPublic: true,
        shareToken: true,
        guestToken: true,
        data: true,
        experiences: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        references: true,
        achievements: true,
        publications: true,
        volunteer: true,
        interests: true,
        customSections: true,
      },
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PUT /api/resumes/[id]
 * Update a specific resume
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id is available
    if (!params?.id) {
      return new NextResponse('Resume ID is required', { status: 400 });
    }
    
    // Try to get user from session
    const session = await getServerSession(authOptions);
    const guestToken = getGuestToken(request);
    
    // If no session and no guest token, return unauthorized
    if (!session?.user?.email && !guestToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Build query based on auth status
    const where: any = { id: params.id };
    
    // If user is authenticated, filter by user ID
    if (session?.user?.id) {
      where.userId = session.user.id;
    } 
    // If guest mode, filter by guest token
    else if (guestToken) {
      where.guestToken = guestToken;
    }

    const body = await request.json();
    
    console.log('Updating resume with query:', where);
    
    // Verify that the resume exists and belongs to the current user/guest
    const existingResume = await prisma.resume.findFirst({
      where,
      select: { id: true }
    });
    
    if (!existingResume) {
      return new NextResponse('Resume not found or access denied', { status: 404 });
    }
    
    const resume = await prisma.resume.update({
      where: { id: params.id },
      data: body,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        template: true,
        colorTheme: true,
        font: true,
        isPublic: true,
        shareToken: true,
        guestToken: true,
        data: true,
        experiences: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        references: true,
        achievements: true,
        publications: true,
        volunteer: true,
        interests: true,
        customSections: true,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error updating resume:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * DELETE /api/resumes/[id]
 * Delete a specific resume
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Ensure params.id is available before using it
  const resumeId = params.id;
  if (!resumeId) {
    return NextResponse.json(
      { error: "Resume ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Try to get user from session
    const session = await getServerSession(authOptions);
    const guestToken = getGuestToken(req);
    
    // If no session and no guest token, return unauthorized
    if (!session?.user?.email && !guestToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Build query based on auth status
    const where: any = { id: resumeId };
    
    // If user is authenticated, filter by user ID
    if (session?.user?.id) {
      where.userId = session.user.id;
    } 
    // If guest mode, filter by guest token
    else if (guestToken) {
      where.guestToken = guestToken;
    }
    
    // Verify the resume exists and belongs to the user
    const resume = await prisma.resume.findFirst({
      where,
      select: { id: true }
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    // Delete cache for this resume
    await deleteCache(`resume:${resumeId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting resume ${resumeId}:`, error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
} 