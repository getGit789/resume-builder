"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * This component provides a fallback mechanism for third-party providers that might fail
 * due to CORS issues, network problems, or other reasons.
 */
export function ProviderFallback({ 
  children, 
  providerName = "External Service" 
}: { 
  children: React.ReactNode;
  providerName?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up global error handler specifically for network/CORS errors
    const errorHandler = (event: ErrorEvent) => {
      const errorText = event.message.toLowerCase();
      
      // Check if the error is related to CORS or network issues with certain domains
      const isProviderError = 
        errorText.includes('cors') || 
        errorText.includes('network') ||
        event.filename?.includes('npass.app') ||
        event.message?.includes('npass.app');
      
      if (isProviderError) {
        console.warn(`Provider error detected for ${providerName}:`, event);
        setHasError(true);
        event.preventDefault();
      }
    };

    // Listen for fetch errors that might be related to CORS
    const fetchErrorHandler = () => {
      const originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        try {
          const response = await originalFetch(input, init);
          return response;
        } catch (error) {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : 'unknown';
          if (url.includes('npass.app') || url.includes('s1.npass')) {
            console.warn(`Fetch error for ${url}:`, error);
            setHasError(true);
          }
          throw error;
        }
      };

      return () => {
        window.fetch = originalFetch;
      };
    };

    const cleanupFetch = fetchErrorHandler();
    window.addEventListener("error", errorHandler);
    
    // Simulate completed loading after 2 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener("error", errorHandler);
      cleanupFetch();
      clearTimeout(timeout);
    };
  }, [providerName]);

  if (hasError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>External Service Error</AlertTitle>
        <AlertDescription>
          There was an issue connecting to {providerName}. This won't affect your
          core application functionality.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-full my-4" />;
  }

  return <>{children}</>;
} 