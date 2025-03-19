"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useResumeStore } from "@/store/use-resume-store"
import { useAutoSave } from "@/hooks/use-auto-save"
import { BuilderToolbar } from "@/components/resume-builder/builder-toolbar"
import ResumeEditor from "@/components/resume-editor"
import { ResumePreview } from "@/components/resume-preview"
import { ATSChecker } from "@/components/ats-checker"
import { useToast } from "@/components/ui/use-toast"
import { defaultResumeData } from "@/lib/default-resume-data"
import type { Resume } from "@/store/use-resume-store"
import type { ColorTheme, ResumeData } from "@/types"
import { GrammarChecker } from "@/components/grammar-checker"

const AVAILABLE_TEMPLATES = [
  "professional",
  "minimalist",
] as const;

export default function BuilderPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get("id")
  const { toast } = useToast()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [activeTab, setActiveTab] = useState("edit")
  const [isExporting, setIsExporting] = useState(false)
  
  const {
    fetchResume,
    createResume,
    updateResume,
    isLoading,
    error,
    resumes
  } = useResumeStore()

  const { isSaving, lastSaved, error: autosaveError } = useAutoSave({
    onSave: async () => {
      if (!currentResume) return
      
      try {
        const updatedResume = await updateResume(currentResume.id, {
          ...currentResume,
          updatedAt: new Date().toISOString()
        })
        
        if (updatedResume) {
          setCurrentResume(updatedResume)
          toast({
            title: "Changes saved",
            description: "Your resume has been updated successfully.",
          })
        }
      } catch (error) {
        console.error("Failed to save changes:", error)
        toast({
          variant: "destructive",
          title: "Failed to save",
          description: "There was an error saving your changes. Please try again.",
        })
      }
    },
    autoSaveEnabled: !!session?.user && !!currentResume,
    debounceMs: 2000
  })

  useEffect(() => {
    async function loadResume() {
      try {
        // If we have a resumeId, try to fetch it
        if (resumeId) {
          const resume = await fetchResume(resumeId)
          if (resume) {
            setCurrentResume(resume)
            return
          }
        }
        
        // If user is logged in but no resumeId or resume not found
        if (session?.user) {
          // Check if user has any existing resumes
          if (resumes.length > 0) {
            // Use the most recent resume
            setCurrentResume(resumes[0])
            return
          }
          
          // Create new resume only if user has no resumes
          const newResume = await createResume(
            "Untitled Resume",
            defaultResumeData,
            "professional",
            "blue"
          )
          
          if (newResume) {
            setCurrentResume(newResume)
          }
        } else {
          // For non-logged in users, create a temporary resume in memory
          setCurrentResume({
            id: `temp-${Date.now()}`,
            name: "Untitled Resume",
            data: defaultResumeData,
            template: "professional",
            colorTheme: "blue",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublic: false
          })
        }
      } catch (err) {
        console.error("Failed to load resume:", err)
        toast({
          variant: "destructive",
          title: "Error loading resume",
          description: "Failed to load the resume. Please try again.",
        })
      }
    }

    loadResume()
  }, [resumeId, session?.user, fetchResume, createResume, resumes])

  // Handle resume updates
  const handleResumeUpdate = async (updates: Partial<Resume>) => {
    if (!currentResume) return
    
    try {
      const updatedResume = session?.user
        ? await updateResume(currentResume.id, updates)
        : { ...currentResume, ...updates, updatedAt: new Date().toISOString() }
        
      if (updatedResume) {
        setCurrentResume(updatedResume)
      }
    } catch (error) {
      console.error("Failed to update resume:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update the resume. Please try again.",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!currentResume) {
    return <div>No resume data available</div>
  }

  const handleExportPDF = async () => {
    if (!currentResume) return
    
    try {
      setIsExporting(true)
      setActiveTab("preview") // Switch to preview tab for export
      
      // Wait for preview to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get the preview element
      const previewElement = previewRef.current
      if (!previewElement) {
        throw new Error("Preview element not found")
      }
      
      // Mark the element for export
      previewElement.setAttribute("data-exporting", "true")
      
      // Send the HTML to our PDF service
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: previewElement.outerHTML,
          options: {
            format: "A4",
            margin: {
              top: "20mm",
              right: "20mm",
              bottom: "20mm",
              left: "20mm"
            }
          }
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }
      
      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${currentResume.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "PDF exported successfully",
        description: "Your resume has been downloaded as a PDF file.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      if (previewRef.current) {
        previewRef.current.removeAttribute("data-exporting")
      }
    }
  }

  const handleExportDOCX = async () => {
    toast({
      title: "Coming soon",
      description: "DOCX export will be available soon.",
    })
  }

  const handleExportGoogleDocs = async () => {
    toast({
      title: "Coming soon",
      description: "Google Docs export will be available soon.",
    })
  }

  const handleDataChange = (data: ResumeData) => {
    setCurrentResume(prev => prev ? { ...prev, data } : null)
  }

  return (
    <div className="flex h-screen flex-col">
      <BuilderToolbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onExportGoogleDocs={handleExportGoogleDocs}
        resumeName={currentResume.name}
        onResumeNameChange={(name) => setCurrentResume(prev => prev ? { ...prev, name } : null)}
        currentTemplate={currentResume.template}
        onTemplateChange={(template) => setCurrentResume(prev => prev ? { ...prev, template } : null)}
        colorTheme={currentResume.colorTheme as ColorTheme}
        onColorThemeChange={(colorTheme) => setCurrentResume(prev => prev ? { ...prev, colorTheme } : null)}
        font={currentResume.data.settings?.font ?? "Inter"}
        onFontChange={(font) => setCurrentResume(prev => prev ? { 
          ...prev, 
          data: { 
            ...prev.data, 
            settings: { 
              ...prev.data.settings,
              font 
            } 
          } 
        } : null)}
        isAutosaving={isSaving}
        lastSaved={lastSaved}
        autosaveError={autosaveError?.message ?? null}
      >
        {activeTab === "edit" ? (
          <ResumeEditor 
            resume={currentResume as Resume}
            onResumeChange={(updatedResume) => {
              setCurrentResume(updatedResume as Resume);
              handleResumeUpdate(updatedResume);
            }}
          />
        ) : activeTab === "preview" ? (
          <div className="p-6 bg-muted/40">
            <ResumePreview
              resumeData={currentResume.data}
              template={currentResume.template}
              colorTheme={currentResume.colorTheme as ColorTheme}
              font={currentResume.data.settings?.font ?? "Inter"}
              previewRef={previewRef}
              isExport={isExporting}
            />
          </div>
        ) : activeTab === "ats" ? (
          <div className="p-6">
            <ATSChecker resumeData={currentResume.data} />
          </div>
        ) : activeTab === "grammar" ? (
          <div className="p-6">
            <GrammarChecker resumeData={currentResume.data} />
          </div>
        ) : null}
      </BuilderToolbar>
    </div>
  )
}
