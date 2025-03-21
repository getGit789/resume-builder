"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

interface GoogleAuthButtonProps {
  callbackUrl?: string;
  className?: string;
}

export function GoogleAuthButton({ 
  callbackUrl = "/dashboard", 
  className 
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Monitor for potential CORS or network issues specifically with npass.app
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const errorMessage = event.message.toLowerCase();
      const isNpassError = 
        errorMessage.includes('npass.app') || 
        (event.filename && event.filename.includes('npass.app'));
      
      // If this is related to npass.app, mark as error but don't propagate
      if (isNpassError) {
        setHasError(true);
        logger.error("Google Auth CORS issue detected", {
          context: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          },
          tags: ['google-auth', 'cors']
        });
        event.preventDefault();
        return true;
      }
      return false;
    };
    
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  const handleSignIn = async () => {
    // If we've detected errors, don't even try
    if (hasError) {
      logger.warn("Skipping Google sign in due to previous errors");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Wrap the sign-in with a timeout to prevent hanging
      const signInPromise = signIn("google", { callbackUrl });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Google sign in timed out")), 10000)
      );
      
      await Promise.race([signInPromise, timeoutPromise]);
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        context: { callbackUrl },
        tags: ['google-auth', 'auth-error']
      });
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className={`${className} relative flex items-center justify-center gap-2 hover:bg-gray-50 ${hasError ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleSignIn}
      disabled={isLoading || hasError}
      title={hasError ? "Google authentication is currently unavailable" : "Sign in with Google"}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      )}
      <span className="text-sm font-medium text-gray-700">
        {hasError ? "Google Sign-In Unavailable" : "Continue with Google"}
      </span>
    </Button>
  );
} 