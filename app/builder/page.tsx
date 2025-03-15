"use client"

import { useState, useEffect, useRef } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ResumeEditor from "@/components/resume-editor"
import ResumePreview from "@/components/resume-preview"
import { defaultResumeData } from "@/lib/default-data"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DragEndEvent } from "@dnd-kit/core"
import Link from "next/link"

// Define the ResumeData interface
interface Link {
  id: string;
  title: string;
  url: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  links: Link[];
}

interface ResumeItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

interface ResumeSection {
  id: string;
  title: string;
  items: ResumeItem[];
}

interface ResumeData {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
}

// Define color themes
const colorThemes = [
  { name: "Default", value: "default", color: "#000000" },
  { name: "Blue", value: "blue", color: "#3B82F6" },
  { name: "Green", value: "green", color: "#10B981" },
  { name: "Purple", value: "purple", color: "#8B5CF6" },
  { name: "Red", value: "red", color: "#EF4444" },
  { name: "Orange", value: "orange", color: "#F97316" },
  { name: "Teal", value: "teal", color: "#14B8A6" },
];

export default function BuilderPage() {
  const [resumeData, setResumeData] = useState(defaultResumeData)
  const [template, setTemplate] = useState("professional")
  const [colorTheme, setColorTheme] = useState("default")
  const [activeTab, setActiveTab] = useState("edit")
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const desktopPreviewRef = useRef<HTMLDivElement>(null)
  const mobilePreviewRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    // Load saved resume data from localStorage if available
    const savedData = localStorage.getItem("resumeData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setResumeData(parsedData)
      } catch (error) {
        console.error("Failed to parse saved resume data", error)
      }
    }

    // Load saved template and color theme if available
    const savedTemplate = localStorage.getItem("resumeTemplate")
    if (savedTemplate) {
      setTemplate(savedTemplate)
    }

    const savedColorTheme = localStorage.getItem("resumeColorTheme")
    if (savedColorTheme) {
      setColorTheme(savedColorTheme)
    }
  }, [])

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData))
  }, [resumeData])

  // Save template and color theme to localStorage
  useEffect(() => {
    localStorage.setItem("resumeTemplate", template)
  }, [template])

  useEffect(() => {
    localStorage.setItem("resumeColorTheme", colorTheme)
  }, [colorTheme])

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData)
  }

  const handleSectionOrderChange = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return;

    if (active.id !== over.id) {
      setResumeData((data) => {
        const oldIndex = data.sections.findIndex((section) => section.id === active.id)
        const newIndex = data.sections.findIndex((section) => section.id === over.id)
        
        return {
          ...data,
          sections: arrayMove(data.sections, oldIndex, newIndex),
        }
      })
    }
  }

  const handleExportPDF = async () => {
    try {
      // Find the preview element based on whether we're in desktop or mobile view
      const previewElement = isDesktop 
        ? desktopPreviewRef.current
        : (activeTab === "preview" ? mobilePreviewRef.current : null);
      
      if (!previewElement) {
        // If we're on mobile and not on the preview tab, switch to it
        if (!isDesktop && activeTab !== "preview") {
          setActiveTab("preview");
          toast({
            title: "Please try again",
            description: "Switched to preview tab. Please click Export PDF again.",
          });
          return;
        }
        
        toast({
          title: "Export failed",
          description: "Could not find the resume preview element",
          variant: "destructive",
        });
        return;
      }
      
      // Show loading toast
      toast({
        title: "Exporting resume",
        description: "Please wait while we generate your PDF...",
      });
      
      // Create a clone of the preview element to avoid modifying the original
      const clonedElement = previewElement.cloneNode(true) as HTMLElement;
      
      // Apply additional styles to ensure proper rendering in PDF
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Reset any list styling to avoid duplicated bullets */
        .rich-text-content ul li::before {
          content: none !important;
        }
        
        /* Fix bullet point styling and alignment */
        .rich-text-content ul, .rich-text-content ol {
          list-style-position: outside !important;
          padding-left: 1.5rem !important;
          margin: 0 !important;
        }
        
        .rich-text-content ul {
          list-style-type: disc !important;
        }
        
        .rich-text-content ol {
          list-style-type: decimal !important;
        }
        
        /* Enhanced bullet point styling for PDF export */
        .rich-text-content li {
          margin: 0 !important;
          padding: 0 !important;
          display: list-item !important;
          line-height: 1.4 !important;
          vertical-align: top !important;
          position: relative !important;
        }
        
        /* Ensure proper spacing between list items */
        .rich-text-content li + li {
          margin-top: 0.1rem !important;
        }
        
        .rich-text-content p {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.5 !important;
        }
        
        .rich-text-content {
          white-space: normal !important;
        }
        
        /* Fix page breaks */
        @page {
          margin: 10mm;
          size: A4;
        }
        
        /* Avoid page breaks inside items */
        .rich-text-content > div {
          page-break-inside: avoid !important;
        }
        
        /* Ensure proper spacing between sections */
        .mb-6 {
          margin-bottom: 1.5rem !important;
          page-break-inside: avoid !important;
        }
        
        /* Ensure section headers don't get separated from their content */
        h2 {
          page-break-after: avoid !important;
        }
        
        /* Ensure job titles don't get separated from their descriptions */
        h3 {
          page-break-after: avoid !important;
        }
        
        /* Fix layout for all templates */
        .flex {
          display: flex !important;
        }
        
        .flex-col {
          flex-direction: column !important;
        }
        
        .md\\:flex-row {
          flex-direction: row !important;
        }
        
        .justify-center {
          justify-content: center !important;
        }
        
        .justify-between {
          justify-content: space-between !important;
        }
        
        .items-baseline {
          align-items: baseline !important;
        }
        
        .gap-4 {
          gap: 1rem !important;
        }
        
        .gap-6 {
          gap: 1.5rem !important;
        }
        
        .text-center {
          text-align: center !important;
        }
        
        .grid {
          display: grid !important;
        }
        
        .md\\:grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        
        .md\\:col-span-2 {
          grid-column: span 2 / span 2 !important;
        }
        
        .md\\:w-2\\/3 {
          width: 66.666667% !important;
        }
        
        .md\\:w-1\\/3 {
          width: 33.333333% !important;
        }
        
        .space-y-1 > * + * {
          margin-top: 0.25rem !important;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem !important;
        }
        
        .space-y-6 > * + * {
          margin-top: 1.5rem !important;
        }
        
        .mt-1 {
          margin-top: 0.25rem !important;
        }
        
        .mt-2 {
          margin-top: 0.5rem !important;
        }
        
        .mt-3 {
          margin-top: 0.75rem !important;
        }
        
        .mt-4 {
          margin-top: 1rem !important;
        }
        
        .mb-1 {
          margin-bottom: 0.25rem !important;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem !important;
        }
        
        .mb-3 {
          margin-bottom: 0.75rem !important;
        }
        
        .mb-4 {
          margin-bottom: 1rem !important;
        }
        
        .mb-6 {
          margin-bottom: 1.5rem !important;
        }
        
        .p-4 {
          padding: 1rem !important;
        }
        
        .pb-1 {
          padding-bottom: 0.25rem !important;
        }
        
        .rounded-lg {
          border-radius: 0.5rem !important;
        }
        
        .bg-gray-50 {
          background-color: #F9FAFB !important;
        }
        
        .border-b {
          border-bottom-width: 1px !important;
        }
      `;
      clonedElement.appendChild(styleElement);
      
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Set up options for html2pdf
      const options = {
        margin: 10,
        filename: `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollY: 0, // Prevent scrolling during capture
          windowWidth: document.documentElement.offsetWidth // Use the current window width
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as 'portrait' | 'landscape',
          compress: true,
          hotfixes: ["px_scaling"]
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Add a small delay before generating the PDF to ensure all styles are applied
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate and download the PDF
      await html2pdf().from(clonedElement).set(options).save();
      
      // Show success toast
      toast({
        title: "Resume exported",
        description: "Your resume has been downloaded as a PDF",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your resume",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="w-[180px]">
            {/* Logo removed */}
          </div>
          <div className="flex items-center gap-4">
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={colorTheme} onValueChange={setColorTheme}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <SelectValue placeholder="Select color theme" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {isDesktop ? (
          <div className="grid h-[calc(100vh-4rem)] grid-cols-2">
            <div className="border-r overflow-y-auto p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionOrderChange}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={resumeData.sections.map((section) => section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ResumeEditor data={resumeData} onChange={handleDataChange} />
                </SortableContext>
              </DndContext>
            </div>
            <div className="overflow-y-auto bg-gray-50 p-4">
              <div ref={desktopPreviewRef}>
                <ResumePreview data={resumeData} template={template} colorTheme={colorTheme} />
              </div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-4rem)]">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="edit" className="h-full overflow-y-auto p-4 m-0">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionOrderChange}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={resumeData.sections.map((section) => section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ResumeEditor data={resumeData} onChange={handleDataChange} />
                </SortableContext>
              </DndContext>
            </TabsContent>
            <TabsContent value="preview" className="h-full overflow-y-auto bg-gray-50 p-4 m-0">
              <div ref={mobilePreviewRef}>
                <ResumePreview data={resumeData} template={template} colorTheme={colorTheme} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

