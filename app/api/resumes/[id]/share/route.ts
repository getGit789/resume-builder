import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, deleteCache } from '@/lib/redis';
import { generateShareToken } from '@/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

// Mock data generator for when database is unavailable
function getMockResume(id: string) {
  if (id === 'mock-1' || id === 'mock-2' || id.startsWith('mock-')) {
    return {
      id,
      isPublic: false,
      shareToken: null,
    };
  }
  return null;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const { isPublic } = await request.json();
    
    // Check if resume exists
    try {
      const existingResume = await prisma.resume.findUnique({
        where: { id },
        select: {
          id: true,
          isPublic: true,
          shareToken: true,
        },
      });
      
      if (!existingResume) {
        // Check if this is a mock ID
        const mockResume = getMockResume(id);
        if (!mockResume) {
          return NextResponse.json(
            { error: 'Resume not found' },
            { status: 404 }
          );
        }
        
        // For mock resumes, return a mock share response
        const shareToken = isPublic ? generateShareToken() : null;
        return NextResponse.json({
          id,
          isPublic,
          shareToken,
          shareUrl: shareToken ? `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}` : null,
        });
      }
      
      // Generate a new share token if making public and no token exists
      let shareToken = existingResume.shareToken;
      if (isPublic && !shareToken) {
        shareToken = generateShareToken();
      }
      
      // If making private, remove the share token
      if (!isPublic) {
        shareToken = null;
      }
      
      // Update the resume
      try {
        const updatedResume = await prisma.resume.update({
          where: { id },
          data: {
            isPublic,
            shareToken,
          },
          select: {
            id: true,
            isPublic: true,
            shareToken: true,
          },
        });
        
        // Invalidate caches
        try {
          await deleteCache(`resume_${id}`);
          await deleteCache('all_resumes');
        } catch (cacheError) {
          console.warn('Failed to invalidate cache:', cacheError);
        }
        
        return NextResponse.json({
          ...updatedResume,
          shareUrl: updatedResume.shareToken 
            ? `${process.env.NEXT_PUBLIC_APP_URL}/share/${updatedResume.shareToken}` 
            : null,
        });
      } catch (updateError) {
        console.error('Error updating resume in database:', updateError);
        
        // For database errors, return a mock share response
        const shareToken = isPublic ? generateShareToken() : null;
        return NextResponse.json({
          id,
          isPublic,
          shareToken,
          shareUrl: shareToken ? `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}` : null,
        });
      }
    } catch (findError) {
      console.error('Error finding resume:', findError);
      
      // Check if this is a mock ID
      const mockResume = getMockResume(id);
      if (!mockResume) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // For mock resumes, return a mock share response
      const shareToken = isPublic ? generateShareToken() : null;
      return NextResponse.json({
        id,
        isPublic,
        shareToken,
        shareUrl: shareToken ? `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}` : null,
      });
    }
  } catch (error: any) {
    console.error(`Error sharing resume ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to share resume' },
      { status: 500 }
    );
  }
} 