"use client";

import { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

// Lazy load components for code splitting
const ResumeList = lazy(() => import("@/components/resume-list"));
const ExportList = lazy(() => import("@/components/export-list"));

// Loading fallbacks
function ResumeListSkeleton() {
  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExportListSkeleton() {
  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 px-4">
      <Link href="/builder">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start text-left space-y-2">
            <Plus className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Create New</h3>
            <p className="text-sm text-muted-foreground">Start a new resume from scratch</p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/templates">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start text-left space-y-2">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Templates</h3>
            <p className="text-sm text-muted-foreground">Browse professional templates</p>
          </CardContent>
        </Card>
      </Link>
      <Link href="#exports">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start text-left space-y-2">
            <Download className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Exports</h3>
            <p className="text-sm text-muted-foreground">View your exported resumes</p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/dashboard">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start text-left space-y-2">
            <RefreshCw className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Recent</h3>
            <p className="text-sm text-muted-foreground">View recent activity</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-2 px-4">
        <h1 className="text-4xl font-bold tracking-tight text-left">Dashboard</h1>
        <p className="text-lg text-muted-foreground text-left">
          Manage your resumes and exports
        </p>
      </div>

      <QuickActions />
      
      <Tabs defaultValue="resumes" className="space-y-8">
        <TabsList className="bg-background border-b w-full rounded-none p-0 h-12 px-4">
          <TabsTrigger 
            value="resumes"
            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            My Resumes
          </TabsTrigger>
          <TabsTrigger 
            value="exports"
            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
          >
            My Exports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumes" className="space-y-8 mt-6">
          <Suspense fallback={<ResumeListSkeleton />}>
            <ResumeList />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="exports" className="space-y-8 mt-6">
          <Suspense fallback={<ExportListSkeleton />}>
            <ExportList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 