"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useToast } from "@/components/ui/use-toast"
import { BuilderToolbar } from "@/components/builder-toolbar"
import ResumeEditor from "@/components/resume-editor"
import { ResumePreview } from "@/components/resume-preview"
import { ATSChecker } from "@/components/ats-checker"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useResumeStore } from "@/store/use-resume-store"
import { defaultResumeData } from "@/lib/default-resume-data"
import { formatDistanceToNow } from "date-fns"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { ColorTheme, ResumeData } from "@/types"
import { Resume, AuthUser } from "@/types/resume"
import { useAutoSave } from "@/hooks/use-auto-save"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { exportHtmlToDocx, saveDocxBlob } from "@/lib/docx-export"
import { PremiumFeatureGate } from "@/components/premium-feature-gate"
import { useAuthStore } from "@/store/use-auth-store"
import { isFeatureAvailable, getUserFeatureAccess } from "@/lib/feature-access"

interface BuilderPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

function BuilderPageContent() {
  const { session, status } = useAuthStatus();
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const searchParamsObj = useSearchParams()
  
  // Resume store state and actions
  const {
    resumes,
    selectedResumeId,
    fetchResume,
    createResume,
    updateResume,
    setSelectedResumeId,
    ensureGuestMode,
  } = useResumeStore()
  
  // Local state
  const [activeTab, setActiveTab] = useState("edit")
  const [previousTab, setPreviousTab] = useState("edit")
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isATSDialogOpen, setIsATSDialogOpen] = useState(false)
  const [currentFont, setCurrentFont] = useState(searchParamsObj.get("font") || "calibri")
  
  // Convert user to AuthUser for feature access functions
  const authUser: AuthUser | null = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: user.isGuest,
    createdAt: new Date(),
    guestToken: user.isGuest ? "guest-token" : undefined
  } : null
  
  // Feature access
  const featureAccess = getUserFeatureAccess(authUser)
  
  // Get resume ID from URL or selected resume
  const resumeId = searchParamsObj.get("id") || selectedResumeId
  
  // Auto-save hook
  const {
    isSaving,
    lastSaved,
    error: autosaveError,
  } = useAutoSave({
    onSave: async () => {
      if (resume) {
        await updateResume(resume.id, {
          ...resume,
          colorTheme: resume.colorTheme as ColorTheme || "blue",
          // Convert Date objects to strings for the API
          createdAt: resume.createdAt instanceof Date ? resume.createdAt.toISOString() : resume.createdAt,
          updatedAt: resume.updatedAt instanceof Date ? resume.updatedAt.toISOString() : resume.updatedAt
        })
      }
    },
    debounceMs: 2000,
    autoSaveEnabled: featureAccess.autoSave,
  })
  
  // Load resume data
  useEffect(() => {
    async function loadResume() {
      try {
        setIsLoading(true)
        setError(null)
        
        let loadedResume: Resume | null = null
        
      if (resumeId) {
          const tempResume = await fetchResume(resumeId)
          // Convert the resume to the correct type if it exists
          if (tempResume) {
            loadedResume = {
              ...tempResume,
              createdAt: new Date(tempResume.createdAt),
              updatedAt: new Date(tempResume.updatedAt),
            } as Resume
          }
        }
        
        if (!loadedResume) {
          const template = searchParamsObj.get("template") || "professional"
          const tempResume = await createResume("Untitled Resume", defaultResumeData, template)
          // Convert the resume to the correct type if it exists
          if (tempResume) {
            loadedResume = {
              ...tempResume,
              createdAt: new Date(tempResume.createdAt),
              updatedAt: new Date(tempResume.updatedAt),
            } as Resume
            
            // Apply initial font from URL if present
            const fontParam = searchParamsObj.get("font")
            if (fontParam && loadedResume) {
              loadedResume.font = fontParam
            }
          }
        }
        
        if (loadedResume) {
          setResume(loadedResume)
          setSelectedResumeId(loadedResume.id)
          // Set current font from loaded resume
          setCurrentFont(loadedResume.font || "calibri")
        }
      } catch (err) {
        console.error("Error loading resume:", err)
        setError("Failed to load resume")
        
        toast({
          title: "Error",
          description: "Failed to load resume. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadResume()
  }, [resumeId, fetchResume, createResume, setSelectedResumeId, searchParamsObj, toast])
  
  // At the top of the BuilderPage component, modify the effect to check auth status more accurately
  useEffect(() => {
    // Only enable guest mode if we're definitely not authenticated
    if (status === 'unauthenticated') {
      // This will set up guest mode if not already enabled
      ensureGuestMode();
    }
  }, [status, ensureGuestMode]);
  
  // Handle resume updates
  const handleResumeChange = async (updatedResume: Resume) => {
    setResume(updatedResume)
  }
  
  // Handle template change
  const handleTemplateChange = (template: string) => {
    if (resume) {
      handleResumeChange({
        ...resume,
        template,
      })
    }
  }
  
  // Handle color theme change
  const handleColorThemeChange = (theme: ColorTheme) => {
    if (resume) {
      handleResumeChange({
        ...resume,
        colorTheme: theme,
      })
    }
  }
  
  // Handle font change
  const handleFontChange = (font: string) => {
    setCurrentFont(font)
    if (resume) {
      const updatedResume: Resume = {
        ...resume,
        font,
      }
      handleResumeChange(updatedResume)
    }
  }
  
  // Handle PDF export
  const handleExportPDF = async () => {
    if (!resume) return;

    try {
      // Ensure we're on the preview tab
      setActiveTab("preview");
      
      // Wait for the preview to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the resume container - try different selectors to be more robust
      const resumeContainer = document.querySelector('.resume-preview') || 
                            document.getElementById('resume-preview') || 
                            document.querySelector('[data-testid="resume-preview"]') ||
                            document.querySelector('.TabsContent[data-state="active"] > div');
      
      if (!resumeContainer) {
        throw new Error("Resume preview not found");
      }

      // Get all template styles
      const templateStyles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join("\n");
          } catch (e) {
            return "";
          }
        })
        .filter(Boolean)
        .join("\n");

      // Prepare the HTML with complete styling
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              ${templateStyles}
              body {
                margin: 0;
                padding: 0;
                font-family: ${currentFont};
              }
            </style>
          </head>
          <body>
            ${resumeContainer.innerHTML}
          </body>
        </html>
      `;

      // Ensure guest mode is active if not signed in
      if (!session) {
        ensureGuestMode();
      }
      
      // Make a POST request to your PDF export API
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          options: {
            format: 'A4',
            printBackground: true,
          },
          fileName: `${resume.template}_resume.pdf`,
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.template}_resume.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Exported!",
        description: "Your resume has been exported as a PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume.",
        variant: "destructive",
      });
    }
  };
  
  // Handle DOCX export
  const handleExportDOCX = async () => {
    if (!resume) return;

    try {
      // Switch to preview tab to ensure proper rendering
      setActiveTab("preview");

      // Wait for the preview to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the preview element
      const previewElement = document.getElementById("resume-preview");
      if (!previewElement) {
        throw new Error("Preview element not found");
      }

      // Get the HTML content
      const html = previewElement.innerHTML;

      // Export to DOCX using our utility function
      const blob = await exportHtmlToDocx(html, {
        font: resume.font || 'Calibri',
        title: resume.name,
        fileName: resume.name || 'resume',
        margins: {
          top: 1440, // 1 inch
          right: 1440,
          bottom: 1440,
          left: 1440,
        }
      });

      // Save the docx blob
      saveDocxBlob(blob, `${resume.name || 'resume'}.docx`);

      toast({
        title: "DOCX Exported!",
        description: "Your resume has been exported as a DOCX file.",
      });
    } catch (error) {
      console.error("Error exporting DOCX:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume.",
        variant: "destructive",
      });
    }
  };
  
  // Handle Google Docs export
  const handleExportGoogleDocs = async () => {
    if (!resume) return;

    try {
      // Ensure we're on the preview tab
      setActiveTab("preview");
      
      // Wait for the preview to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the resume container - try different selectors to be more robust
      const resumeContainer = document.querySelector('.resume-preview') || 
                            document.getElementById('resume-preview') || 
                            document.querySelector('[data-testid="resume-preview"]') ||
                            document.querySelector('.TabsContent[data-state="active"] > div');
      
      if (!resumeContainer) {
        throw new Error("Resume preview not found");
      }

      // Get all template styles
      const templateStyles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join("\n");
          } catch (e) {
            return "";
          }
        })
        .filter(Boolean)
        .join("\n");

      // Prepare the HTML with complete styling
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              ${templateStyles}
              body {
                margin: 0;
                padding: 0;
                font-family: ${currentFont};
              }
            </style>
          </head>
          <body>
            ${resumeContainer.innerHTML}
          </body>
        </html>
      `;

      // Ensure guest mode is active if not signed in
      if (!session) {
        ensureGuestMode();
      }
      
      // Make a POST request to your Google Docs export API
      const response = await fetch('/api/export/google-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          options: {
            format: 'A4',
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Google Docs export failed');
      }

      const data = await response.json();
      
      if (data.success && data.url && data.content) {
        try {
          // Try to copy content to clipboard
          await navigator.clipboard.writeText(data.content);
          
          // Open Google Docs
          window.open(data.url, '_blank');
        
        toast({
            title: "Google Docs Export Ready",
            description: "Resume content copied to clipboard. Paste it into the Google Doc that just opened.",
          });
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          
          // Create a text area element to copy text as fallback
          const textArea = document.createElement('textarea');
          textArea.value = data.content;
          textArea.style.position = 'fixed'; // Avoid scrolling to bottom
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            // Execute the copy command
            const successful = document.execCommand('copy');
            
            // Open Google Docs
            window.open(data.url, '_blank');
            
            if (successful) {
              toast({
                title: "Google Docs Export Ready",
                description: "Resume content copied to clipboard. Paste it into the Google Doc that just opened.",
              });
            } else {
              throw new Error('Failed to copy text');
            }
          } catch (fallbackError) {
            console.error('Fallback clipboard error:', fallbackError);
            
            // If all clipboard methods fail, show the content as a dialog
            toast({
              title: "Google Docs Export Ready",
              description: "Please copy the displayed content and paste it into the Google Doc that will open.",
              variant: "default",
              duration: 10000,
            });
            
            // Display content in a dialog for manual copying
            const contentDialog = document.createElement('div');
            contentDialog.style.position = 'fixed';
            contentDialog.style.top = '50%';
            contentDialog.style.left = '50%';
            contentDialog.style.transform = 'translate(-50%, -50%)';
            contentDialog.style.backgroundColor = 'white';
            contentDialog.style.padding = '20px';
            contentDialog.style.border = '1px solid #ccc';
            contentDialog.style.borderRadius = '5px';
            contentDialog.style.zIndex = '9999';
            contentDialog.style.maxWidth = '80%';
            contentDialog.style.maxHeight = '80%';
            contentDialog.style.overflow = 'auto';
            contentDialog.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.marginTop = '10px';
            closeButton.style.padding = '5px 10px';
            closeButton.style.backgroundColor = '#4f46e5';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '3px';
            closeButton.style.cursor = 'pointer';
            
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.wordBreak = 'break-word';
            pre.style.maxHeight = '400px';
            pre.style.overflow = 'auto';
            pre.style.padding = '10px';
            pre.style.border = '1px solid #eee';
            pre.style.backgroundColor = '#f8f8f8';
            pre.textContent = data.content;
            
            contentDialog.innerHTML = '<h3>Copy the text below and paste it into Google Docs</h3>';
            contentDialog.appendChild(pre);
            contentDialog.appendChild(closeButton);
            
            closeButton.onclick = () => {
              document.body.removeChild(contentDialog);
              // Open Google Docs after closing
              window.open(data.url, '_blank');
            };
            
            document.body.appendChild(contentDialog);
          }
          
          // Clean up
          document.body.removeChild(textArea);
        }
      } else {
        throw new Error('Invalid response from export service');
      }
    } catch (error) {
      console.error("Error exporting to Google Docs:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume.",
        variant: "destructive",
      });
    }
  };
  
  // Handle ATS dialog
  const handleAtsCheck = () => {
    if (isFeatureAvailable("atsCheck", authUser)) {
      setPreviousTab(activeTab)
      setIsATSDialogOpen(true)
    } else {
      // For guests, this will be handled by the PremiumFeatureGate
      setPreviousTab(activeTab)
      setActiveTab(previousTab) // Stay on current tab
    }
  }
  
  // Handle grammar check
  const handleGrammarCheck = () => {
    if (isFeatureAvailable("grammarCheck", authUser)) {
      // Implement grammar check functionality
      toast({
        title: "Grammar Check",
        description: "Checking your resume for grammar issues...",
      })
    }
    // For guests, let the PremiumFeatureGate handle the access restriction
  }
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === "ats") {
      // For ATS, handle with a separate function that checks auth
      handleAtsCheck()
      return
    }
    
    if (value === "grammar") {
      // For Grammar check, handle with a separate function
      handleGrammarCheck()
      return
    }
    
    setActiveTab(value)
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }
  
  if (error || !resume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-red-600">{error || "Resume not found"}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }
  
  // Make sure colorTheme is a valid ColorTheme value
  const safeColorTheme = (resume.colorTheme as ColorTheme) || "blue"

  return (
    <div className="flex min-h-screen flex-col">
      <BuilderToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onExportGoogleDocs={handleExportGoogleDocs}
        resumeName={resume.name}
        onResumeNameChange={(name: string) => handleResumeChange({ ...resume, name })}
        currentTemplate={resume.template}
        onTemplateChange={handleTemplateChange}
        colorTheme={safeColorTheme}
        onColorThemeChange={handleColorThemeChange}
        font={currentFont}
        onFontChange={handleFontChange}
        isAutosaving={isSaving}
        lastSaved={lastSaved}
        autosaveError={autosaveError ? autosaveError.message : null}
      />
      
      <div className="container flex-1 px-4 py-6">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="edit" className="h-full">
            <ResumeEditor
              resume={resume}
              onResumeChange={handleResumeChange}
            />
              </TabsContent>
              
          <TabsContent value="preview" className="h-full flex items-center justify-center">
                  <ResumePreview 
              resumeData={resume.data}
              template={resume.template}
              colorTheme={safeColorTheme}
              font={currentFont}
            />
              </TabsContent>
            </Tabs>

        {/* ATS Checker Dialog */}
        <Dialog 
          open={isATSDialogOpen} 
          onOpenChange={(open) => {
            setIsATSDialogOpen(open);
            if (!open) {
              // Return to previous tab when dialog is closed
              setActiveTab(previousTab);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogTitle>ATS Analysis</DialogTitle>
            <DialogDescription>
              See how well your resume performs against Applicant Tracking Systems.
            </DialogDescription>
            <div className="mt-4">
              {resume && (
                <PremiumFeatureGate feature="atsCheck">
                  <ATSChecker resumeData={resume.data} />
                </PremiumFeatureGate>
          )}
        </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function BuilderPage({ searchParams }: BuilderPageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8" /></div>}>
      <BuilderPageContent />
    </Suspense>
  )
}
