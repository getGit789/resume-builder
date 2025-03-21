import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  // Only enable this in development for security reasons
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  const headersList = headers();
  const host = headersList.get('host') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  // Get auth-related environment variables (redacted values for security)
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
  };
  
  // Get current origin for OAuth callback URL checking
  const origin = process.env.NEXTAUTH_URL || 
    (host.includes('localhost') ? `http://${host}` : `https://${host}`);
  
  // Check OAuth callback URL in Google Console should be
  const expectedCallbackUrls = [
    `${origin}/api/auth/callback/google`,
    `${origin}/api/auth/callback/google/`
  ];
  
  // Check for potential CORS issues
  const corsStatus = origin.includes('localhost') 
    ? '✓ Local development (likely no CORS issues)' 
    : '⚠️ Production environment - verify CORS settings';
    
  // Create diagnostic information
  const diagnosticInfo = {
    environment: {
      ...envVars,
      host,
      userAgent: userAgent.substring(0, 50) + '...' // Truncate for brevity
    },
    expectedCallbackUrl: expectedCallbackUrls,
    corsStatus,
    recommendations: [
      'Verify NEXTAUTH_URL matches your deployment URL',
      'Ensure Google OAuth credentials are configured correctly in Google Console',
      'Check that the callback URL is registered in Google Console',
      'Verify that your browser isn\'t blocking third-party cookies'
    ],
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(diagnosticInfo);
} 