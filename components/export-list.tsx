'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Download, 
  Trash2, 
  MoreVertical, 
  RefreshCw, 
  FileText, 
  File,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

// Import Zustand stores
import { useExportStore } from '@/store/use-export-store';
import { useUIStore } from '@/store/use-ui-store';

interface Export {
  id: string;
  resumeId: string;
  resume: { name: string };
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  createdAt: string;
  error?: string;
}

export default function ExportList() {
  const { toast } = useToast();
  
  // Export store
  const { 
    exports, 
    isLoading, 
    error, 
    fetchExports, 
    deleteExport 
  } = useExportStore();
  
  // UI store
  const { 
    isDeleteDialogOpen, 
    currentExportId,
    openDeleteDialog: openDeleteDialogBase,
    closeDeleteDialog,
  } = useUIStore();
  
  // Helper function to open delete dialog with export ID
  const openDeleteDialog = (id: string) => {
    openDeleteDialogBase(id);
  };
  
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});
  
  useEffect(() => {
    fetchExports();
    
    // Set up polling for in-progress exports
    const interval = setInterval(() => {
      if (exports) {
        const hasInProgressExports = exports.some(
          exp => exp.status === 'pending' || exp.status === 'processing'
        );
        
        if (hasInProgressExports) {
          fetchExports();
          
          // Update progress values for in-progress exports
          const newProgressValues = { ...progressValues };
          exports.forEach(exp => {
            if (exp.status === 'pending') {
              // Pending starts at 10%
              newProgressValues[exp.id] = 10;
            } else if (exp.status === 'processing') {
              // Processing gradually increases to 90%
              const currentValue = newProgressValues[exp.id] || 10;
              if (currentValue < 90) {
                newProgressValues[exp.id] = Math.min(currentValue + 5, 90);
              }
            } else if (exp.status === 'completed') {
              // Completed is 100%
              newProgressValues[exp.id] = 100;
            } else if (exp.status === 'failed') {
              // Failed stays at current value
              newProgressValues[exp.id] = newProgressValues[exp.id] || 0;
            }
          });
          setProgressValues(newProgressValues);
        }
      }
    }, 5000); // Poll every 5 seconds
    
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [fetchExports, exports, progressValues]);
  
  const handleDeleteClick = (id: string) => {
    openDeleteDialog(id);
  };
  
  const handleConfirmDelete = async () => {
    if (!currentExportId) return;
    
    const success = await deleteExport(currentExportId);
    
    if (success) {
      toast({
        title: 'Export deleted',
        description: 'The export has been deleted successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete export. Please try again.',
        variant: 'destructive',
      });
    }
    
    closeDeleteDialog();
  };
  
  const handleRefresh = () => {
    fetchExports();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50/50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50/50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'docx':
        return <File className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  const renderProgressBar = (exportItem: any) => {
    if (exportItem.status === 'pending' || exportItem.status === 'processing') {
      const progressValue = progressValues[exportItem.id] || 
        (exportItem.status === 'pending' ? 10 : 50);
      
      return (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{exportItem.status === 'pending' ? 'Queued' : 'Processing'}</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      );
    }
    return null;
  };
  
  if (isLoading && !exports) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Your Exports</h2>
            <p className="text-sm text-muted-foreground">Loading your exports...</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-red-500">Error loading exports</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-semibold tracking-tight">Your Exports</h2>
          <p className="text-sm text-muted-foreground">
            {exports?.length 
              ? `You have ${exports.length} export${exports.length === 1 ? '' : 's'}`
              : 'No exports yet'
            }
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {exports && exports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exports.map((exportItem) => (
            <Card key={exportItem.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-left">
                    <CardTitle className="text-lg line-clamp-1">Export {exportItem.format.toUpperCase()}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {formatDistanceToNow(new Date(exportItem.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {exportItem.status === 'completed' && (
                        <DropdownMenuItem onClick={() => window.open(exportItem.url, '_blank')}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(exportItem.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusBadge(exportItem.status)}
                    <span className="text-sm text-muted-foreground">
                      {exportItem.format.toUpperCase()}
                    </span>
                  </div>
                  {exportItem.status === 'completed' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="justify-start"
                      onClick={() => window.open(exportItem.url, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-left py-10 border-2 border-dashed rounded-lg px-6">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No exports yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Export a resume to see it here
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Export</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this export? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 