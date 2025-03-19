"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Share2, Globe, Lock, ClipboardCopy, HelpCircle, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import Zustand stores
import { useResumeStore } from "@/store/use-resume-store";
import { useUIStore } from "@/store/use-ui-store";

interface ResumeShareDialogProps {
  resumeId: string;
  resumeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeShareDialog({
  resumeId,
  resumeName,
  open,
  onOpenChange,
}: ResumeShareDialogProps) {
  const { toast } = useToast();
  
  // Resume store
  const { shareResume } = useResumeStore();
  
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle sharing status
  const toggleSharing = async () => {
    setIsToggling(true);
    setError(null);
    try {
      // Call the resume store's shareResume function
      const result = await shareResume(resumeId);
      
      if (!result) {
        throw new Error("Failed to update sharing settings");
      }
      
      const shareToken = result.shareToken;
      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      
      setIsPublic(true);
      setShareUrl(shareUrl);

      toast({
        title: "Resume shared",
        description: "Your resume is now publicly accessible via link",
      });
    } catch (error) {
      console.error("Error toggling share status:", error);
      setError(error instanceof Error ? error.message : "Failed to update sharing settings");
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Copy share URL to clipboard
  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  // Check current sharing status when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    if (newOpen && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/resumes/${resumeId}/share`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setIsPublic(data.isPublic);
          
          if (data.isPublic && data.shareToken) {
            const shareUrl = `${window.location.origin}/share/${data.shareToken}`;
            setShareUrl(shareUrl);
          }
        } else {
          const errorText = await response.text();
          console.error("Error response from share API:", errorText);
          setError("Failed to fetch sharing status. Please try again.");
          toast({
            title: "Error",
            description: "Failed to fetch sharing status",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching share status:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch sharing status");
        toast({
          title: "Error",
          description: "Failed to fetch sharing status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (!newOpen) {
      // Reset error state when closing dialog
      setError(null);
    }
    onOpenChange(newOpen);
  };

  // Handle the sharing toggle in the dialog
  const handleSharingToggle = async (newIsPublic: boolean) => {
    if (newIsPublic === isPublic) return;
    
    setIsToggling(true);
    setError(null);
    try {
      // Call the API directly with the new sharing state
      const response = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: newIsPublic }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from share API:", errorText);
        throw new Error("Failed to update sharing settings");
      }
      
      const result = await response.json();
      
      if (!result || (newIsPublic && !result.shareToken)) {
        throw new Error("Failed to update sharing settings");
      }
      
      setIsPublic(newIsPublic);
      
      if (newIsPublic && result.shareToken) {
        const shareUrl = `${window.location.origin}/share/${result.shareToken}`;
        setShareUrl(shareUrl);
        
        toast({
          title: "Resume shared",
          description: "Your resume is now publicly accessible via link",
        });
      } else {
        setShareUrl(null);
        
        toast({
          title: "Sharing disabled",
          description: "Your resume is no longer publicly accessible",
        });
      }
    } catch (error) {
      console.error("Error toggling share status:", error);
      setError(error instanceof Error ? error.message : "Failed to update sharing settings");
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Resume</DialogTitle>
          <DialogDescription>
            Allow others to view or copy your resume
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="share-toggle" className="text-sm font-medium">
                Share resume
              </Label>
              <span className="text-xs text-muted-foreground">
                {isPublic 
                  ? "Your resume is currently public and can be viewed by anyone with the link" 
                  : "Make your resume public to share it with others"}
              </span>
            </div>
            <Switch 
              id="share-toggle"
              checked={isPublic}
              onCheckedChange={handleSharingToggle}
              disabled={isToggling || isLoading}
            />
          </div>
          
          {isPublic && shareUrl && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="share-url" className="text-sm font-medium">
                  Share link
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                    data-testid="share-url"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={copyToClipboard}
                    disabled={isLoading || isToggling}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Sharing Options
                </Label>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 p-2 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">View Only</h4>
                        <p className="text-xs text-muted-foreground">Recipients can only view but not edit the resume</p>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          copyToClipboard();
                          toast({
                            title: "View-only link copied",
                            description: "Anyone with this link can view your resume",
                          });
                        }}
                        disabled={isLoading || isToggling}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-2 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Duplicate</h4>
                        <p className="text-xs text-muted-foreground">Recipients can make their own copy to edit</p>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const duplicateUrl = `${window.location.origin}/share/${shareUrl.split('/').pop()}?duplicate=true`;
                          navigator.clipboard.writeText(duplicateUrl);
                          toast({
                            title: "Duplicate link copied",
                            description: "Anyone with this link can create a copy of your resume",
                          });
                        }}
                        disabled={isLoading || isToggling}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" asChild>
            <a 
              href="https://docs.example.com/sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <HelpCircle className="mr-1 h-4 w-4" />
              <span>Sharing Help</span>
            </a>
          </Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 