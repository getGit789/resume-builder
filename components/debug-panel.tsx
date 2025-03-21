"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BugPlay, X, RefreshCcw } from "lucide-react";
import { logger } from "@/lib/logger";

interface DebugPanelProps {
  initialOpen?: boolean;
}

export function DebugPanel({ initialOpen = false }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeTab, setActiveTab] = useState("errors");
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) return null;

  // Fetch errors from our logger
  const fetchErrors = () => {
    setErrorLogs(logger.getRecentErrors());
  };

  // Fetch system info from diagnostics API
  const fetchSystemInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/diagnostics");
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error("Failed to fetch diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchErrors();
    fetchSystemInfo();
  };

  // Initial data load
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Toggle panel visibility
  const togglePanel = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      refreshData();
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={togglePanel}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300"
      >
        <BugPlay size={16} />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-[500px] h-[400px] bg-background border-l border-t shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <BugPlay size={16} />
          <h3 className="text-sm font-medium">Debug Panel</h3>
          {errorLogs.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {errorLogs.length} Errors
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshData}
            className="h-7 w-7"
            disabled={isLoading}
          >
            <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePanel}
            className="h-7 w-7"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 pt-2 bg-transparent justify-start border-b rounded-none">
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="errors" className="mt-0">
            {errorLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No errors logged
              </div>
            ) : (
              <div className="space-y-4">
                {errorLogs.map((error, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-3 bg-red-50 dark:bg-red-950/20"
                  >
                    <div className="font-medium text-red-700 dark:text-red-400">
                      {error.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className="font-medium mb-1">Context:</div>
                        <pre className="bg-red-100 dark:bg-red-950/50 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error.trace && (
                      <div className="mt-2 text-xs">
                        <div className="font-medium mb-1">Stack Trace:</div>
                        <pre className="bg-red-100 dark:bg-red-950/50 p-2 rounded text-xs overflow-auto max-h-[200px]">
                          {error.trace}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logger.clearErrors();
                    fetchErrors();
                  }}
                  className="w-full mt-4"
                >
                  Clear Errors
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            {!systemInfo ? (
              <div className="text-center py-8 text-muted-foreground">
                {isLoading ? "Loading system info..." : "No system info available"}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md p-3">
                  <div className="font-medium">Environment</div>
                  <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto">
                    {JSON.stringify(systemInfo.environment, null, 2)}
                  </pre>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium">Memory Usage</div>
                  <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto">
                    {JSON.stringify(systemInfo.memory, null, 2)}
                  </pre>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium">User Agent</div>
                  <div className="text-sm mt-2 break-all">{systemInfo.userAgent}</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="network" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              Network monitoring (coming soon)
            </div>
          </TabsContent>

          <TabsContent value="storage" className="mt-0">
            <div className="border rounded-md p-3">
              <div className="font-medium">LocalStorage</div>
              <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto max-h-[200px]">
                {typeof window !== "undefined"
                  ? JSON.stringify(
                      Object.entries(localStorage).reduce(
                        (acc, [key, value]) => {
                          acc[key] = value;
                          return acc;
                        },
                        {} as Record<string, string>
                      ),
                      null,
                      2
                    )
                  : "Not available"}
              </pre>
            </div>
            <div className="border rounded-md p-3 mt-4">
              <div className="font-medium">SessionStorage</div>
              <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-auto max-h-[200px]">
                {typeof window !== "undefined"
                  ? JSON.stringify(
                      Object.entries(sessionStorage).reduce(
                        (acc, [key, value]) => {
                          acc[key] = value;
                          return acc;
                        },
                        {} as Record<string, string>
                      ),
                      null,
                      2
                    )
                  : "Not available"}
              </pre>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
} 