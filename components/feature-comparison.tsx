"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/use-auth-store";

export function FeatureComparison() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Fast Resume Builder for Everyone</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start building your professional resume today, no account required. 
            Create an account to unlock powerful features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Guest Features */}
          <div className="bg-background rounded-lg p-6 shadow-sm border">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Guest Mode</h3>
              <p className="text-muted-foreground">No account needed</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <FeatureItem available={true}>Create & customize resumes</FeatureItem>
              <FeatureItem available={true}>Choose from multiple templates</FeatureItem>
              <FeatureItem available={true}>Customize colors & fonts</FeatureItem>
              <FeatureItem available={true}>Export to PDF</FeatureItem>
              <FeatureItem available={true}>Export to DOCX</FeatureItem>
              <FeatureItem available={false}>Auto-save your work</FeatureItem>
              <FeatureItem available={false}>ATS compatibility checker</FeatureItem>
              <FeatureItem available={false}>AI-powered content suggestions</FeatureItem>
              <FeatureItem available={false}>Advanced grammar check</FeatureItem>
              <FeatureItem available={false}>Multiple resume versions</FeatureItem>
              <FeatureItem available={false}>Share resumes with others</FeatureItem>
            </ul>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/builder?guest=true">
                Continue as Guest
              </Link>
            </Button>
          </div>
          
          {/* Authenticated Features */}
          <div className="bg-background rounded-lg p-6 shadow-md border-2 border-primary relative">
            <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold">
              RECOMMENDED
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Account</h3>
              <p className="text-muted-foreground">All features included</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <FeatureItem available={true}>Create & customize resumes</FeatureItem>
              <FeatureItem available={true}>Choose from multiple templates</FeatureItem>
              <FeatureItem available={true}>Customize colors & fonts</FeatureItem>
              <FeatureItem available={true}>Export to PDF</FeatureItem>
              <FeatureItem available={true}>Export to DOCX</FeatureItem>
              <FeatureItem available={true} highlight={true}>Real-time auto-save</FeatureItem>
              <FeatureItem available={true} highlight={true}>ATS compatibility checker</FeatureItem>
              <FeatureItem available={true} highlight={true}>AI-powered content suggestions</FeatureItem>
              <FeatureItem available={true} highlight={true}>Advanced grammar check</FeatureItem>
              <FeatureItem available={true} highlight={true}>Unlimited resume versions</FeatureItem>
              <FeatureItem available={true} highlight={true}>Share resumes with others</FeatureItem>
            </ul>
            
            <Button asChild className="w-full">
              <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureItemProps {
  available: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}

function FeatureItem({ available, highlight = false, children }: FeatureItemProps) {
  return (
    <li className="flex items-center gap-2">
      {available ? (
        <Check size={18} className={highlight ? "text-primary" : "text-green-500"} />
      ) : (
        <X size={18} className="text-muted-foreground" />
      )}
      <span className={!available ? "text-muted-foreground" : highlight ? "font-medium" : ""}>
        {children}
      </span>
    </li>
  );
} 