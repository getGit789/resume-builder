import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Diagnostics API endpoint to retrieve system information and recent errors
 * This endpoint is only accessible in development mode or with the correct API key
 */
export async function GET(request: Request) {
  // First check for development mode or authentication
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('key');
  
  // In production, require an API key
  if (!isDevelopment && apiKey !== process.env.DIAGNOSTICS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get browser information if available from headers
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // Gather environment information
  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    nextVersion: process.env.NEXT_RUNTIME || 'Unknown',
    nodeVersion: process.version,
    platform: process.platform,
    uptime: Math.floor(process.uptime()),
  };
  
  // Get most recent errors from logger
  const recentErrors = logger.getRecentErrors();
  
  // Return diagnostic information
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envInfo,
    userAgent,
    recentErrors,
    // For client-side errors, we don't have access to these in the API
    // but the client can append this information when reporting errors
    memory: process.memoryUsage && {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
    },
  });
}

/**
 * POST endpoint to report errors from client
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, stack, context, tags } = body;
    
    logger.error(new Error(message), {
      context: {
        ...context,
        clientReported: true,
        stack
      },
      tags: Array.isArray(tags) ? tags : ['client-error']
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to log client error', {
      context: { error }
    });
    return NextResponse.json({ error: 'Failed to log error' }, { status: 400 });
  }
} 