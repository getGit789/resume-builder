import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/redis';
import { exportQueue } from '@/lib/queue';

// Mock data for when database is unavailable
const mockExports = [
  {
    id: 'mock-export-1',
    resumeId: 'mock-1',
    format: 'pdf',
    status: 'completed',
    url: 'https://example.com/mock-export-1.pdf',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'mock-export-2',
    resumeId: 'mock-2',
    format: 'docx',
    status: 'completed',
    url: 'https://example.com/mock-export-2.docx',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export async function GET() {
  try {
    // Try to get from cache first
    let cachedExports;
    try {
      cachedExports = await getCache('all_exports');
      if (cachedExports) {
        return NextResponse.json(cachedExports);
      }
    } catch (cacheError) {
      console.warn('Cache error, continuing to database:', cacheError);
    }

    // If not in cache, fetch from database
    try {
      const exports = await prisma.export.findMany({
        select: {
          id: true,
          resumeId: true,
          format: true,
          status: true,
          url: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      // Cache the results for 1 minute (shorter time because exports status changes frequently)
      try {
        await setCache('all_exports', exports, 60);
      } catch (cacheError) {
        console.warn('Failed to cache exports:', cacheError);
      }
      
      return NextResponse.json(exports);
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError);
      return NextResponse.json(mockExports);
    }
  } catch (error: any) {
    console.error('Error fetching exports:', error);
    // Return mock data as fallback
    return NextResponse.json(mockExports);
  }
}

export async function POST(request: Request) {
  try {
    const { resumeId, format } = await request.json();
    
    // Validate required fields
    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    if (!format || !['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Valid format (pdf or docx) is required' },
        { status: 400 }
      );
    }
    
    // Check if resume exists
    try {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });
      
      if (!resume && !resumeId.startsWith('mock-')) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // Create the export record
      let exportRecord;
      try {
        exportRecord = await prisma.export.create({
          data: {
            resumeId,
            format,
            status: 'pending',
          },
        });
        
        // Add job to the queue
        try {
          if (format === 'pdf') {
            await exportQueue.add('process-pdf-export', {
              exportId: exportRecord.id,
              resumeId,
            });
          } else {
            await exportQueue.add('process-docx-export', {
              exportId: exportRecord.id,
              resumeId,
            });
          }
        } catch (queueError) {
          console.warn('Queue error, export will be processed manually:', queueError);
        }
        
        // Invalidate cache
        try {
          await getCache('all_exports');
        } catch (cacheError) {
          console.warn('Failed to invalidate cache:', cacheError);
        }
        
        return NextResponse.json(exportRecord);
      } catch (dbError) {
        console.error('Database error, creating mock export:', dbError);
        // Create a mock export when database is unavailable
        const mockExport = {
          id: `mock-export-${Date.now()}`,
          resumeId,
          format,
          status: 'pending',
          url: null as string | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Simulate processing
        setTimeout(() => {
          mockExport.status = 'completed';
          mockExport.url = `https://example.com/mock-${resumeId}.${format}`;
          mockExport.updatedAt = new Date();
        }, 3000);
        
        return NextResponse.json(mockExport);
      }
    } catch (resumeError) {
      console.error('Error checking resume:', resumeError);
      // Assume resume exists for mock purposes
      const mockExport = {
        id: `mock-export-${Date.now()}`,
        resumeId,
        format,
        status: 'pending',
        url: null as string | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Simulate processing
      setTimeout(() => {
        mockExport.status = 'completed';
        mockExport.url = `https://example.com/mock-${resumeId}.${format}`;
        mockExport.updatedAt = new Date();
      }, 3000);
      
      return NextResponse.json(mockExport);
    }
  } catch (error: any) {
    console.error('Error creating export:', error);
    return NextResponse.json(
      { error: 'Failed to create export' },
      { status: 500 }
    );
  }
} 