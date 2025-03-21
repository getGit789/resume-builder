"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ componentStack: string } | null>(null);

  useEffect(() => {
    // Set up global error handler for uncaught errors
    const errorHandler = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error);
      setErrorInfo({
        componentStack: `${event.filename}:${event.lineno}:${event.colno}`
      });
      event.preventDefault();
    };

    // Set up global promise rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setErrorInfo({
        componentStack: "Promise rejection in unknown component"
      });
      event.preventDefault();
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Something went wrong
          </h1>
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <p className="font-mono text-sm text-red-800 dark:text-red-300">
              {error.name}: {error.message}
            </p>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Stack Trace:</h2>
            <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-auto text-xs">
              {error.stack || "No stack trace available"}
            </pre>
          </div>
          {errorInfo && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
              <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-auto text-xs">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setErrorInfo(null);
              }}
            >
              Dismiss
            </Button>
            <Button 
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 