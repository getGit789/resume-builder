"use client";

import { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components for code splitting
const ResumeList = lazy(() => import("@/components/resume-list"));
const ExportList = lazy(() => import("@/components/export-list"));

// Loading fallbacks
function ResumeListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ExportListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs defaultValue="resumes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          <TabsTrigger value="exports">My Exports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumes" className="space-y-4">
          <Suspense fallback={<ResumeListSkeleton />}>
            <ResumeList />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="exports" className="space-y-4">
          <Suspense fallback={<ExportListSkeleton />}>
            <ExportList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 