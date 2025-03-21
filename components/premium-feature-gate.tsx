"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FeatureAccess, getUpgradeMessage, isPremiumFeature } from "@/lib/feature-access";

interface PremiumFeatureGateProps {
  feature: keyof FeatureAccess;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumFeatureGate({ 
  feature, 
  children, 
  fallback 
}: PremiumFeatureGateProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { isAuthenticated, isGuest } = useAuthStore();
  const router = useRouter();
  
  // If it's not a premium feature, always show the children
  if (!isPremiumFeature(feature)) {
    return <>{children}</>;
  }
  
  // For premium features, check if user is authenticated and not a guest
  if (isAuthenticated && !isGuest) {
    return <>{children}</>;
  }
  
  // Otherwise, show the gated version
  return (
    <>
      {fallback || (
        <div onClick={() => setShowDialog(true)} className="cursor-pointer">
          <div className="relative">
            {children}
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-[1px]">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
      
      <PremiumFeatureDialog 
        feature={feature} 
        open={showDialog} 
        onOpenChange={setShowDialog} 
      />
    </>
  );
}

interface PremiumFeatureDialogProps {
  feature: keyof FeatureAccess;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PremiumFeatureDialog({ 
  feature, 
  open, 
  onOpenChange 
}: PremiumFeatureDialogProps) {
  const router = useRouter();
  
  const handleSignIn = () => {
    router.push("/auth");
    onOpenChange(false);
  };
  
  const freeFeatures = [
    "Create and customize resumes",
    "Choose from multiple templates",
    "Export to PDF and DOCX",
    "Basic customization options"
  ];
  
  const premiumFeatures = [
    "Auto-save your work",
    "ATS compatibility checker",
    "AI-powered content suggestions",
    "Advanced grammar check",
    "Multiple resume versions",
    "Share resumes with others"
  ];
  
  // Get the feature-specific message
  const upgradeMessage = getUpgradeMessage(feature);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Premium Feature</DialogTitle>
          <DialogDescription>
            {upgradeMessage}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Free Features:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {freeFeatures.map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="mr-2">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Premium Features:</h3>
            <ul className="space-y-1 text-sm">
              {premiumFeatures.map((item, i) => {
                const isCurrentFeature = item.toLowerCase().includes(feature.toLowerCase());
                return (
                  <li key={i} className={`flex items-center ${isCurrentFeature ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    <span className="mr-2">{isCurrentFeature ? '➤' : '✓'}</span> {item}
                    {isCurrentFeature && <span className="ml-2 inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs text-primary">Current</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue as Guest
          </Button>
          <Button onClick={handleSignIn}>
            Sign In for Premium Features
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 