import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/redis';

interface RouteParams {
  params: {
    id: string;
  };
}

// Mock data generator for when database is unavailable
function getMockResume(id: string) {
  if (id === 'mock-1') {
    return {
      id: 'mock-1',
      name: 'Professional Resume',
      data: {
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          location: 'New York, NY',
          title: 'Software Engineer',
          summary: 'Experienced software engineer with a passion for building scalable applications.'
        },
        experience: [
          {
            id: '1',
            company: 'Tech Company',
            position: 'Senior Developer',
            startDate: '2020-01',
            endDate: 'Present',
            description: 'Led development of key features for the main product.'
          }
        ],
        education: [
          {
            id: '1',
            institution: 'University of Technology',
            degree: 'Bachelor of Science in Computer Science',
            startDate: '2012-09',
            endDate: '2016-05',
            description: 'Graduated with honors.'
          }
        ],
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js']
      },
      template: 'professional',
      colorTheme: 'blue',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
  } else if (id === 'mock-2') {
    return {
      id: 'mock-2',
      name: 'Creative Portfolio',
      data: {
        personalInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '(555) 987-6543',
          location: 'San Francisco, CA',
          title: 'UX Designer',
          summary: 'Creative designer with a focus on user experience and interface design.'
        },
        experience: [
          {
            id: '1',
            company: 'Design Studio',
            position: 'Lead Designer',
            startDate: '2019-03',
            endDate: 'Present',
            description: 'Created user interfaces for various client projects.'
          }
        ],
        education: [
          {
            id: '1',
            institution: 'Design Academy',
            degree: 'Master of Fine Arts in Design',
            startDate: '2016-09',
            endDate: '2018-06',
            description: 'Focused on digital product design.'
          }
        ],
        skills: ['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite']
      },
      template: 'modern',
      colorTheme: 'green',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };
  } else if (id.startsWith('mock-')) {
    // For dynamically created mock resumes
    return {
      id,
      name: 'New Resume',
      data: {
        personalInfo: {
          name: 'New User',
          email: 'user@example.com',
          phone: '(555) 555-5555',
          location: 'Anytown, USA',
          title: 'Professional',
          summary: 'A brief summary of your professional background.'
        },
        experience: [],
        education: [],
        skills: []
      },
      template: 'professional',
      colorTheme: 'default',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
  }
  
  return null;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Try to get from cache first
    let cachedResume;
    try {
      const cacheKey = `resume_${id}`;
      cachedResume = await getCache(cacheKey);
      if (cachedResume) {
        return NextResponse.json(cachedResume);
      }
    } catch (cacheError) {
      console.warn('Cache error, continuing to database:', cacheError);
    }
    
    // If not in cache, fetch from database
    try {
      const resume = await prisma.resume.findUnique({
        where: { id },
      });
      
      if (!resume) {
        // Check if this is a mock ID
        const mockResume = getMockResume(id);
        if (mockResume) {
          return NextResponse.json(mockResume);
        }
        
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // Cache the result for 5 minutes
      try {
        const cacheKey = `resume_${id}`;
        await setCache(cacheKey, resume, 300);
      } catch (cacheError) {
        console.warn('Failed to cache resume:', cacheError);
      }
      
      return NextResponse.json(resume);
    } catch (dbError) {
      console.error('Database error, checking for mock resume:', dbError);
      // Check if this is a mock ID
      const mockResume = getMockResume(id);
      if (mockResume) {
        return NextResponse.json(mockResume);
      }
      
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error(`Error fetching resume ${params.id}:`, error);
    // Check if this is a mock ID as a last resort
    const mockResume = getMockResume(params.id);
    if (mockResume) {
      return NextResponse.json(mockResume);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const { name, data, template, colorTheme } = await request.json();
    
    // Check if resume exists
    try {
      const existingResume = await prisma.resume.findUnique({
        where: { id },
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
        
        // For mock resumes, return an updated version
        const updatedMockResume = {
          ...mockResume,
          name: name !== undefined ? name : mockResume.name,
          data: data !== undefined ? data : mockResume.data,
          template: template !== undefined ? template : mockResume.template,
          colorTheme: colorTheme !== undefined ? colorTheme : mockResume.colorTheme,
          updatedAt: new Date()
        };
        
        return NextResponse.json(updatedMockResume);
      }
      
      // Update the resume
      try {
        const updatedResume = await prisma.resume.update({
          where: { id },
          data: {
            name: name !== undefined ? name : existingResume.name,
            data: data !== undefined ? data : existingResume.data,
            template: template !== undefined ? template : existingResume.template,
            colorTheme: colorTheme !== undefined ? colorTheme : existingResume.colorTheme,
            updatedAt: new Date(),
          },
        });
        
        // Invalidate caches
        try {
          await deleteCache(`resume_${id}`);
          await deleteCache('all_resumes');
        } catch (cacheError) {
          console.warn('Failed to invalidate cache:', cacheError);
        }
        
        return NextResponse.json(updatedResume);
      } catch (updateError) {
        console.error('Error updating resume in database:', updateError);
        
        // For database errors, return a mock updated resume
        const updatedMockResume = {
          ...existingResume,
          name: name !== undefined ? name : existingResume.name,
          data: data !== undefined ? data : existingResume.data,
          template: template !== undefined ? template : existingResume.template,
          colorTheme: colorTheme !== undefined ? colorTheme : existingResume.colorTheme,
          updatedAt: new Date()
        };
        
        return NextResponse.json(updatedMockResume);
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
      
      // For mock resumes, return an updated version
      const updatedMockResume = {
        ...mockResume,
        name: name !== undefined ? name : mockResume.name,
        data: data !== undefined ? data : mockResume.data,
        template: template !== undefined ? template : mockResume.template,
        colorTheme: colorTheme !== undefined ? colorTheme : mockResume.colorTheme,
        updatedAt: new Date()
      };
      
      return NextResponse.json(updatedMockResume);
    }
  } catch (error: any) {
    console.error(`Error updating resume ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Check if resume exists
    try {
      const existingResume = await prisma.resume.findUnique({
        where: { id },
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
        
        // For mock resumes, just return success
        return NextResponse.json({ success: true });
      }
      
      // Delete the resume
      try {
        await prisma.resume.delete({
          where: { id },
        });
        
        // Invalidate caches
        try {
          await deleteCache(`resume_${id}`);
          await deleteCache('all_resumes');
        } catch (cacheError) {
          console.warn('Failed to invalidate cache:', cacheError);
        }
        
        return NextResponse.json({ success: true });
      } catch (deleteError) {
        console.error('Error deleting resume from database:', deleteError);
        
        // For database errors with mock IDs, just return success
        if (id.startsWith('mock-')) {
          return NextResponse.json({ success: true });
        }
        
        throw deleteError;
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
      
      // For mock resumes, just return success
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error(`Error deleting resume ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
} 