"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { Resume } from "@/types/resume"
import { useAutoSave } from "@/hooks/use-auto-save"

interface BuilderPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function BuilderPage({ searchParams }: BuilderPageProps) {
  const { data: session } = useSession()
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
  } = useResumeStore()
  
  // Local state
  const [activeTab, setActiveTab] = useState("edit")
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
        await updateResume(resume.id, resume)
      }
    },
    debounceMs: 2000,
  })
  
  // Load resume data
  useEffect(() => {
    async function loadResume() {
      try {
        setIsLoading(true)
        setError(null)
        
        let loadedResume: Resume | null = null
        
        if (resumeId) {
          loadedResume = await fetchResume(resumeId)
        }
        
        if (!loadedResume) {
          const template = searchParamsObj.get("template") || "professional"
          loadedResume = await createResume("Untitled Resume", defaultResumeData, template)
        }
        
        if (loadedResume) {
          setResume(loadedResume)
          setSelectedResumeId(loadedResume.id)
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
    if (resume) {
      const updatedResume: Resume = {
        ...resume,
        data: {
          ...resume.data,
          settings: {
            ...resume.data.settings,
            font,
          },
        },
      }
      handleResumeChange(updatedResume)
    }
  }
  
  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: document.querySelector('.resume-preview')?.innerHTML,
          options: {
            format: 'A4',
            margin: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            }
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.name || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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
  
  return (
    <div className="flex min-h-screen flex-col">
      <BuilderToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportPDF={handleExportPDF}
        onExportDOCX={() => {}}
        onExportGoogleDocs={() => {}}
        resumeName={resume.name}
        onResumeNameChange={(name: string) => handleResumeChange({ ...resume, name })}
        currentTemplate={resume.template}
        onTemplateChange={handleTemplateChange}
        colorTheme={resume.colorTheme || "blue"}
        onColorThemeChange={handleColorThemeChange}
        font={resume.data.settings?.font || "Inter"}
        onFontChange={handleFontChange}
        isAutosaving={isSaving}
        lastSaved={lastSaved}
        autosaveError={autosaveError}
      />
      
      <div className="container flex-1 px-4 py-6">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="edit" className="h-full">
            <ResumeEditor
              resume={resume}
              onResumeChange={handleResumeChange}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="h-full">
            <ResumePreview
              resumeData={resume.data}
              template={resume.template}
              colorTheme={resume.colorTheme}
              font={resume.data.settings?.font}
            />
          </TabsContent>
          
          <TabsContent value="ats" className="h-full">
            <ATSChecker resumeData={resume.data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
