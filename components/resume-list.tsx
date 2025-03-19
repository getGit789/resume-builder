'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/components/ui/use-toast';
import { 
  FileEdit, 
  Download, 
  Trash2, 
  MoreVertical, 
  Plus,
  FileText,
  File,
  Eye,
  RefreshCw,
  Share2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Import Zustand stores
import { useResumeStore } from '@/store/use-resume-store';
import { useExportStore } from '@/store/use-export-store';
import { useUIStore } from '@/store/use-ui-store';

// Dynamically import the share dialog for code splitting
const ResumeShareDialog = dynamic(() => import('@/components/resume-share-dialog'), {
  loading: () => <div>Loading...</div>,
});

export default function ResumeList() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Resume store
  const { 
    resumes, 
    isLoading, 
    error, 
    fetchResumes, 
    deleteResume,
  } = useResumeStore();
  
  // Export store
  const { createExport } = useExportStore();
  
  // UI store
  const { 
    isDeleteDialogOpen, 
    isExportDialogOpen, 
    isShareDialogOpen,
    currentResumeId,
    openDeleteDialog,
    closeDeleteDialog,
    openExportDialog,
    closeExportDialog,
    openShareDialog,
    closeShareDialog,
  } = useUIStore();
  
  // Local state for export loading
  const [isExporting, setIsExporting] = useState(false);
  const [selectedResumeForShare, setSelectedResumeForShare] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleEditResume = (id: string) => {
    router.push(`/builder?id=${id}`);
  };

  const handleDeleteClick = (id: string) => {
    openDeleteDialog(id);
  };

  const handleConfirmDelete = async () => {
    if (!currentResumeId) return;
    
    try {
      const success = await deleteResume(currentResumeId);
      if (success) {
        toast({
          title: "Resume deleted",
          description: "Your resume has been deleted successfully.",
        });
        closeDeleteDialog();
      } else {
        throw new Error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportClick = (id: string) => {
    openExportDialog(id);
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!currentResumeId) return;
    
    setIsExporting(true);
    try {
      const result = await createExport(currentResumeId, format);
      
      if (result) {
        toast({
          title: "Export started",
          description: `Your resume is being exported to ${format.toUpperCase()}. You can check the status in the Exports tab.`,
        });
        
        closeExportDialog();
      } else {
        throw new Error('Failed to create export');
      }
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast({
        title: "Export failed",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/builder');
  };

  const handlePreviewClick = (resume: any) => {
    router.push(`/preview?id=${resume.id}`);
  };

  const handleRefresh = () => {
    fetchResumes();
  };

  const handleShareClick = (resume: { id: string; name: string }) => {
    setSelectedResumeForShare(resume);
    openShareDialog(resume.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      
      {resumes && resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{resume.name}</CardTitle>
                    <CardDescription>
                      {formatDate(resume.updatedAt)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditResume(resume.id)}>
                        <FileEdit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreviewClick(resume)}>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareClick({ id: resume.id, name: resume.name })}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportClick(resume.id)}>
                        <Download className="mr-2 h-4 w-4" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(resume.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <FileText className="mr-1 h-4 w-4" />
                    {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)}
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ 
                      backgroundColor: 
                        resume.colorTheme === 'blue' ? '#3B82F6' :
                        resume.colorTheme === 'green' ? '#10B981' :
                        resume.colorTheme === 'purple' ? '#8B5CF6' :
                        resume.colorTheme === 'red' ? '#EF4444' :
                        resume.colorTheme === 'orange' ? '#F97316' :
                        resume.colorTheme === 'teal' ? '#14B8A6' :
                        '#000000'
                    }}
                  />
                  <span>
                    {resume.colorTheme.charAt(0).toUpperCase() + resume.colorTheme.slice(1)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditResume(resume.id)}
                >
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportClick(resume.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <div className="mb-4 flex justify-center">
            <div className="relative w-24 h-24">
              <File className="w-24 h-24 text-muted-foreground/30" />
              <Plus className="w-8 h-8 text-muted-foreground/50 absolute bottom-0 right-0" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first resume to get started
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Resume
          </Button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
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
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={closeExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Resume</DialogTitle>
            <DialogDescription>
              Choose a format to export your resume
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-8 w-8 mb-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleExport('docx')}
              disabled={isExporting}
            >
              <File className="h-8 w-8 mb-2" />
              DOCX
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeExportDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      {selectedResumeForShare && (
        <ResumeShareDialog
          resumeId={selectedResumeForShare.id}
          resumeName={selectedResumeForShare.name}
          open={isShareDialogOpen}
          onOpenChange={closeShareDialog}
        />
      )}
    </div>
  );
} 