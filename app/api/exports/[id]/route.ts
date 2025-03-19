import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCache, setCache, deleteCache } from '@/lib/redis';

interface RouteParams {
  params: {
    id: string;
  };
}

// Mock data generator for when database is unavailable
function getMockExport(id: string) {
  if (id === 'mock-export-1') {
    return {
      id: 'mock-export-1',
      resumeId: 'mock-1',
      format: 'pdf',
      status: 'completed',
      url: 'https://example.com/mock-export-1.pdf',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };
  } else if (id === 'mock-export-2') {
    return {
      id: 'mock-export-2',
      resumeId: 'mock-2',
      format: 'docx',
      status: 'completed',
      url: 'https://example.com/mock-export-2.docx',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };
  } else if (id.startsWith('mock-export-')) {
    // For dynamically created mock exports
    return {
      id,
      resumeId: id.replace('mock-export-', 'mock-'),
      format: Math.random() > 0.5 ? 'pdf' : 'docx',
      status: 'completed',
      url: `https://example.com/${id}.pdf`,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };
  }
  
  return null;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Try to get from cache first
    let cachedExport;
    try {
      const cacheKey = `export_${id}`;
      cachedExport = await getCache(cacheKey);
      if (cachedExport) {
        return NextResponse.json(cachedExport);
      }
    } catch (cacheError) {
      console.warn('Cache error, continuing to database:', cacheError);
    }
    
    // If not in cache, fetch from database
    try {
      const exportRecord = await prisma.export.findUnique({
        where: { id },
      });
      
      if (!exportRecord) {
        // Check if this is a mock ID
        const mockExport = getMockExport(id);
        if (mockExport) {
          return NextResponse.json(mockExport);
        }
        
        return NextResponse.json(
          { error: 'Export not found' },
          { status: 404 }
        );
      }
      
      // Cache the result for 30 seconds (short time because status changes frequently)
      try {
        const cacheKey = `export_${id}`;
        await setCache(cacheKey, exportRecord, 30);
      } catch (cacheError) {
        console.warn('Failed to cache export:', cacheError);
      }
      
      return NextResponse.json(exportRecord);
    } catch (dbError) {
      console.error('Database error, checking for mock export:', dbError);
      // Check if this is a mock ID
      const mockExport = getMockExport(id);
      if (mockExport) {
        return NextResponse.json(mockExport);
      }
      
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error(`Error fetching export ${params.id}:`, error);
    // Check if this is a mock ID as a last resort
    const mockExport = getMockExport(params.id);
    if (mockExport) {
      return NextResponse.json(mockExport);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch export' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Check if export exists
    try {
      const existingExport = await prisma.export.findUnique({
        where: { id },
      });
      
      if (!existingExport) {
        // Check if this is a mock ID
        const mockExport = getMockExport(id);
        if (!mockExport) {
          return NextResponse.json(
            { error: 'Export not found' },
            { status: 404 }
          );
        }
        
        // For mock exports, just return success
        return NextResponse.json({ success: true });
      }
      
      // Delete the export
      try {
        await prisma.export.delete({
          where: { id },
        });
        
        // Invalidate caches
        try {
          await deleteCache(`export_${id}`);
          await deleteCache('all_exports');
        } catch (cacheError) {
          console.warn('Failed to invalidate cache:', cacheError);
        }
        
        return NextResponse.json({ success: true });
      } catch (deleteError) {
        console.error('Error deleting export from database:', deleteError);
        
        // For database errors with mock IDs, just return success
        if (id.startsWith('mock-export-')) {
          return NextResponse.json({ success: true });
        }
        
        throw deleteError;
      }
    } catch (findError) {
      console.error('Error finding export:', findError);
      
      // Check if this is a mock ID
      const mockExport = getMockExport(id);
      if (!mockExport) {
        return NextResponse.json(
          { error: 'Export not found' },
          { status: 404 }
        );
      }
      
      // For mock exports, just return success
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error(`Error deleting export ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete export' },
      { status: 500 }
    );
  }
} 