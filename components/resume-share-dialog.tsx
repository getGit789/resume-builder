"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Share2, Globe, Lock } from "lucide-react";
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

  // Toggle sharing status
  const toggleSharing = async () => {
    setIsLoading(true);
    try {
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
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        }
      } catch (error) {
        console.error("Error fetching share status:", error);
      } finally {
        setIsLoading(false);
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Resume</DialogTitle>
          <DialogDescription>
            Share "{resumeName}" with others via a public link
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="share-toggle" className="font-medium">
              {isPublic ? (
                <div className="flex items-center text-primary">
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Private
                </div>
              )}
            </Label>
            <div className="text-sm text-muted-foreground">
              {isPublic
                ? "Anyone with the link can view this resume"
                : "Only you can view this resume"}
            </div>
          </div>
          <Switch
            id="share-toggle"
            checked={isPublic}
            onCheckedChange={toggleSharing}
            disabled={isLoading}
          />
        </div>
        
        {isPublic && shareUrl && (
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link">Share link</Label>
              <div className="flex items-center">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 