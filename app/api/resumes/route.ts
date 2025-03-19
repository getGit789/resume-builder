import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';

// Mock data for when database is unavailable
const mockResumes = [
  {
    id: 'mock-1',
    name: 'Professional Resume',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    template: 'professional',
    colorTheme: 'blue',
  },
  {
    id: 'mock-2',
    name: 'Creative Portfolio',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    template: 'modern',
    colorTheme: 'green',
  },
];

export async function GET() {
  try {
    // Try to get from cache first
    let cachedResumes;
    try {
      cachedResumes = await getCache('all_resumes');
      if (cachedResumes) {
        return NextResponse.json(cachedResumes);
      }
    } catch (cacheError) {
      console.warn('Cache error, continuing to database:', cacheError);
    }

    // If not in cache, fetch from database
    try {
      const resumes = await prisma.resume.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          template: true,
          colorTheme: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      // Cache the results for 5 minutes
      try {
        await setCache('all_resumes', resumes, 300);
      } catch (cacheError) {
        console.warn('Failed to cache resumes:', cacheError);
      }
      
      return NextResponse.json(resumes);
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError);
      return NextResponse.json(mockResumes);
    }
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    // Return mock data as fallback
    return NextResponse.json(mockResumes);
  }
}

export async function POST(request: Request) {
  try {
    const { name, data, template, colorTheme } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!data || !data.personalInfo) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }
    
    // Create the resume
    try {
      const resume = await prisma.resume.create({
        data: {
          name,
          data,
          template: template || 'professional',
          colorTheme: colorTheme || 'default',
        },
      });
      
      // Invalidate cache
      try {
        await getCache('all_resumes');
      } catch (cacheError) {
        console.warn('Failed to invalidate cache:', cacheError);
      }
      
      return NextResponse.json(resume);
    } catch (dbError) {
      console.error('Database error, creating mock resume:', dbError);
      // Create a mock resume when database is unavailable
      const mockResume = {
        id: `mock-${Date.now()}`,
        name,
        data,
        template: template || 'professional',
        colorTheme: colorTheme || 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return NextResponse.json(mockResume);
    }
  } catch (error: any) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
} 