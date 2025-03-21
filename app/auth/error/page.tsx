"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Map error codes to user-friendly messages
const errorMessages: Record<string, { title: string; description: string; solution: string }> = {
  default: {
    title: "Authentication Error",
    description: "There was a problem signing you in.",
    solution: "Please try again or use a different sign-in method."
  },
  Signin: {
    title: "Sign-in Failed",
    description: "The sign-in attempt was unsuccessful.",
    solution: "Please check your credentials and try again."
  },
  OAuthSignin: {
    title: "OAuth Sign-in Failed",
    description: "There was a problem initializing OAuth sign-in.",
    solution: "This could be due to cookies being blocked by your browser. Please check your browser settings."
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was a problem processing the OAuth callback.",
    solution: "This could be related to browser cookie settings or provider configuration."
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description: "Failed to create a user account with the OAuth provider.",
    solution: "Please try a different sign-in method or contact support."
  },
  Callback: {
    title: "Callback Error",
    description: "There was a problem with the authentication callback.",
    solution: "This might be due to a temporary service issue. Please try again later."
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another account.",
    solution: "Please sign in using the original account provider you used."
  },
  SessionRequired: {
    title: "Session Required",
    description: "You need to be signed in to access this page.",
    solution: "Please sign in to continue."
  },
  "google-auth": {
    title: "Google Authentication Issue",
    description: "There was a problem authenticating with Google.",
    solution: "This might be due to browser settings blocking third-party cookies. Try enabling cookies or using a different browser."
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get error parameters
  const error = searchParams?.get("error") || "default";
  const message = searchParams?.get("message") || "";
  
  // Get error message to display
  const errorInfo = errorMessages[error] || errorMessages.default;
  
  // Load diagnostics in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      fetchDiagnostics();
    }
  }, []);
  
  const fetchDiagnostics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/debug");
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(data);
      }
    } catch (error) {
      console.error("Failed to fetch diagnostics", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            {errorInfo.title}
          </CardTitle>
          <CardDescription>
            {errorInfo.description}
            {message && <span className="block mt-1 font-mono text-xs">{message}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Suggested Solution</AlertTitle>
            <AlertDescription>
              {errorInfo.solution}
            </AlertDescription>
          </Alert>
          
          {error === "google-auth" && (
            <div className="space-y-2 text-sm">
              <h3 className="font-medium">Google Authentication Troubleshooting:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Enable third-party cookies in your browser</li>
                <li>Try using a different browser</li>
                <li>Clear browser cache and cookies</li>
                <li>Disable ad blockers or privacy extensions</li>
                <li>Try using incognito/private browsing mode</li>
              </ul>
            </div>
          )}
          
          {diagnostics && (
            <div className="mt-4 p-3 bg-muted rounded-md text-xs">
              <h3 className="font-semibold mb-1">Environment Information:</h3>
              <p>Environment: {diagnostics.environment.NODE_ENV}</p>
              <p>Google Client ID: {diagnostics.environment.GOOGLE_CLIENT_ID}</p>
              <p>NextAuth Secret: {diagnostics.environment.NEXTAUTH_SECRET}</p>
              <p className="mt-2">Expected Callback URL: {diagnostics.expectedCallbackUrl?.[0]}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 items-stretch">
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" className="w-1/2">
              <Link href="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <Button className="w-1/2" onClick={() => window.location.href = "/auth"}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <Button 
              variant="ghost" 
              disabled={isLoading}
              onClick={fetchDiagnostics}
              className="text-xs mt-2"
            >
              {isLoading ? "Loading..." : "Refresh Diagnostics"}
            </Button>
          )}
          
          <div className="text-center mt-2 text-sm text-muted-foreground">
            <Link href="https://next-auth.js.org/getting-started/client#signin" className="flex items-center justify-center hover:underline" target="_blank">
              NextAuth.js Documentation
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 