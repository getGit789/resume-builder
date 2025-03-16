"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ChevronDown, Download, ExternalLink, FileText } from "lucide-react"
import ResumeEditor from "@/components/resume-editor"
import ResumePreview from "@/components/resume-preview"
import { ATSChecker } from "@/components/ats-checker"
import { GrammarChecker } from "@/components/grammar-checker"
import { generatePDF, generateDOCX } from '@/lib/pdf-utils'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveStatus } from '@/components/auto-save-status'
import { ResumeNameInput } from '@/components/resume-name-input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ColorTheme, themeColors } from "@/types"
import { FontSelector } from "@/components/font-selector"

// Define local types that match what the components expect
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
  { name: "Default", value: "default", color: themeColors.default },
  { name: "Blue", value: "blue", color: themeColors.blue },
  { name: "Green", value: "green", color: themeColors.green },
  { name: "Purple", value: "purple", color: themeColors.purple },
  { name: "Red", value: "red", color: themeColors.red },
  { name: "Orange", value: "orange", color: themeColors.orange },
  { name: "Teal", value: "teal", color: themeColors.teal },
]

// Default resume data
const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    location: "San Francisco, CA",
    summary: "Experienced software engineer with a passion for building user-friendly applications.",
    links: [
      {
        id: "link-1",
        title: "LinkedIn",
        url: "https://linkedin.com/in/johndoe",
      },
      {
        id: "link-2",
        title: "GitHub",
        url: "https://github.com/johndoe",
      },
    ],
  },
  sections: [
    {
      id: "section-1",
      title: "Work Experience",
      items: [
        {
          id: "item-1",
          title: "Senior Software Engineer",
          subtitle: "Tech Company Inc.",
          date: "2020 - Present",
          description: "<p>Led the development of a new product feature that increased user engagement by 25%.</p><ul><li>Collaborated with cross-functional teams to define requirements</li><li>Implemented responsive UI components using React</li><li>Optimized database queries to improve performance</li></ul>",
        },
        {
          id: "item-2",
          title: "Software Engineer",
          subtitle: "Startup XYZ",
          date: "2018 - 2020",
          description: "<p>Developed and maintained web applications using modern JavaScript frameworks.</p><ul><li>Built RESTful APIs using Node.js and Express</li><li>Implemented authentication and authorization features</li><li>Wrote unit and integration tests</li></ul>",
        },
      ],
    },
    {
      id: "section-2",
      title: "Education",
      items: [
        {
          id: "item-3",
          title: "Master of Computer Science",
          subtitle: "University of Technology",
          date: "2016 - 2018",
          description: "<p>Focused on software engineering and artificial intelligence.</p>",
        },
        {
          id: "item-4",
          title: "Bachelor of Science in Computer Science",
          subtitle: "State University",
          date: "2012 - 2016",
          description: "<p>Graduated with honors. Relevant coursework: Data Structures, Algorithms, Database Systems.</p>",
        },
      ],
    },
    {
      id: "section-3",
      title: "Skills",
      items: [
        {
          id: "item-5",
          title: "Programming Languages",
          subtitle: "",
          date: "",
          description: "<p>JavaScript, TypeScript, Python, Java, SQL</p>",
        },
        {
          id: "item-6",
          title: "Frameworks & Libraries",
          subtitle: "",
          date: "",
          description: "<p>React, Node.js, Express, Next.js, Django</p>",
        },
        {
          id: "item-7",
          title: "Tools & Technologies",
          subtitle: "",
          date: "",
          description: "<p>Git, Docker, AWS, CI/CD, Agile methodologies</p>",
        },
      ],
    },
  ],
}

// Helper function to convert HTML to plain text
const htmlToPlainText = (html: string) => {
  if (!html) return ""
  
  // Create a temporary element
  const tempElement = document.createElement("div")
  tempElement.innerHTML = html
  
  // Get the text content
  let text = tempElement.textContent || tempElement.innerText || ""
  
  // Clean up the text
  text = text.replace(/\s+/g, " ").trim()
  
  return text
}

// Helper function to extract list items from HTML
const extractListItems = (html: string) => {
  if (!html) return []
  
  // Create a temporary element
  const tempElement = document.createElement("div")
  tempElement.innerHTML = html
  
  // Get all list items
  const listItems = tempElement.querySelectorAll("li")
  
  // Convert to array of strings
  return Array.from(listItems).map((item) => item.textContent || item.innerText || "")
}

// Helper function to ensure all resume items have required fields
const ensureValidResumeData = (data: any): ResumeData => {
  // Deep clone the data to avoid modifying the original
  const validData = JSON.parse(JSON.stringify(data))
  
  // Ensure all items have required fields
  validData.sections.forEach((section: any) => {
    section.items.forEach((item: any) => {
      if (item.date === undefined) item.date = ""
      if (item.description === undefined) item.description = ""
    })
  })
  
  return validData as ResumeData
}

export default function BuilderPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [template, setTemplate] = useState("professional")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [activeTab, setActiveTab] = useState("edit")
  const [resumeName, setResumeName] = useState("My Resume")
  const [font, setFont] = useState("'Inter', sans-serif")
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const desktopPreviewRef = useRef<HTMLDivElement>(null)
  const mobilePreviewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  // Get resume ID from URL if editing an existing resume
  const resumeId = searchParams?.get('id')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Use our auto-save hook
  const { isSaving, lastSaved, error, saveNow } = useAutoSave(
    resumeId,
    resumeData as any, // Type assertion to handle the conversion
    template,
    colorTheme,
    resumeName,
    {
      debounceTime: 1500,
      onSaveSuccess: (result) => {
        // If we created a new resume, update the URL to include the ID
        if (!resumeId && result.id) {
          router.replace(`/builder?id=${result.id}`)
        }
      }
    }
  )

  useEffect(() => {
    // If we have a resume ID, fetch the resume data
    const fetchResume = async () => {
      if (resumeId) {
        try {
          const response = await fetch(`/api/resumes/${resumeId}`)
          if (response.ok) {
            const resume = await response.json()
            setResumeData(ensureValidResumeData(resume.data))
            setTemplate(resume.template)
            setColorTheme(resume.colorTheme)
            setResumeName(resume.name)
          } else {
            // If the resume doesn't exist, load from localStorage
            loadFromLocalStorage()
          }
        } catch (error) {
          console.error("Failed to fetch resume:", error)
          // If there's an error, load from localStorage
          loadFromLocalStorage()
        }
      } else {
        // If there's no resume ID, load from localStorage
        loadFromLocalStorage()
      }
    }

    fetchResume()
  }, [resumeId])

  // Load saved data from localStorage
  const loadFromLocalStorage = () => {
    // Load saved resume data from localStorage if available
    const savedData = localStorage.getItem("resumeData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setResumeData(ensureValidResumeData(parsedData))
      } catch (error) {
        console.error("Failed to parse saved resume data", error)
      }
    }
    
    // Load saved template from localStorage if available
    const savedTemplate = localStorage.getItem("resumeTemplate")
    if (savedTemplate) {
      setTemplate(savedTemplate)
    }
    
    // Load saved color theme from localStorage if available
    const savedColorTheme = localStorage.getItem("resumeColorTheme")
    if (savedColorTheme && isValidColorTheme(savedColorTheme)) {
      setColorTheme(savedColorTheme)
    }

    // Load saved resume name from localStorage if available
    const savedName = localStorage.getItem("resumeName")
    if (savedName) {
      setResumeName(savedName)
    }

    // Load saved font from localStorage if available
    const savedFont = localStorage.getItem("resumeFont")
    if (savedFont) {
      setFont(savedFont)
    }
  }

  // Helper function to validate color theme
  const isValidColorTheme = (theme: string): theme is ColorTheme => {
    return ["default", "blue", "green", "purple", "red", "orange", "teal"].includes(theme);
  }

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
        
        const newSections = [...data.sections]
        const [movedSection] = newSections.splice(oldIndex, 1)
        newSections.splice(newIndex, 0, movedSection)
        
        return {
          ...data,
          sections: newSections,
        }
      })
    }
  }

  const handleExportPDF = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    
    try {
      // Get the preview element
      const previewElement = isDesktop
        ? desktopPreviewRef.current
        : mobilePreviewRef.current
      
      if (!previewElement) {
        throw new Error("Preview element not found")
      }
      
      // Generate a filename
      const fullName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim()
      const filename = fullName
        ? `${fullName} - Resume.pdf`
        : "Resume.pdf"
      
      // Generate the PDF
      const pdf = await generatePDF(previewElement, filename)
      
      // Create a download link
      const url = URL.createObjectURL(pdf)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "PDF exported",
        description: "Your resume has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Failed to export PDF:", error)
      
      toast({
        title: "Export failed",
        description: "Failed to export your resume as a PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    
    try {
      // Get the preview element
      const previewElement = isDesktop
        ? desktopPreviewRef.current
        : mobilePreviewRef.current
      
      if (!previewElement) {
        throw new Error("Preview element not found")
      }
      
      // Generate a filename
      const fullName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim()
      const filename = fullName
        ? `${fullName} - Resume.docx`
        : "Resume.docx"
      
      // Generate the DOCX
      const docx = await generateDOCX(previewElement, filename)
      
      // Create a download link
      const url = URL.createObjectURL(docx)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "DOCX exported",
        description: "Your resume has been exported as a DOCX file.",
      })
    } catch (error) {
      console.error("Failed to export DOCX:", error)
      
      toast({
        title: "Export failed",
        description: "Failed to export your resume as a DOCX file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportGoogleDocs = async () => {
    // This is a placeholder for now
    toast({
      title: "Coming soon",
      description: "Export to Google Docs is coming soon.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>Resume Builder</span>
          </Link>
          
          <div className="ml-auto flex items-center gap-2">
            <ATSChecker resumeData={resumeData as any} />
            <GrammarChecker resumeData={resumeData as any} />
            
            <div className="hidden items-center gap-2 md:flex">
              <Select
                value={template}
                onValueChange={(value) => setTemplate(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: colorThemes.find(
                          (theme) => theme.value === colorTheme
                        )?.color,
                      }}
                    />
                    <span className="capitalize">{colorTheme}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {colorThemes.map((theme) => (
                    <DropdownMenuItem
                      key={theme.value}
                      className="flex items-center gap-2"
                      onClick={() => setColorTheme(theme.value as ColorTheme)}
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <FontSelector value={font} onValueChange={setFont} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDOCX}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportGoogleDocs}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto">
            <ResumeNameInput 
              name={resumeName} 
              onChange={setResumeName} 
              className="flex-1"
            />
            <AutoSaveStatus 
              isSaving={isSaving} 
              lastSaved={lastSaved} 
              error={error} 
              className="ml-4"
            />
          </div>

          {isDesktop ? (
            <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2">
              <div className="overflow-y-auto resume-editor">
                <DndContext
                  sensors={sensors}
                  onDragEnd={handleSectionOrderChange}
                >
                  <SortableContext items={resumeData.sections.map((section) => section.id)}>
                    <ResumeEditor data={resumeData} onChange={handleDataChange} />
                  </SortableContext>
                </DndContext>
              </div>
              
              <div className="overflow-y-auto bg-gray-50 p-4">
                <div ref={desktopPreviewRef}>
                  <ResumePreview 
                    data={resumeData as any} 
                    template={template} 
                    colorTheme={colorTheme} 
                    font={font}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="h-full overflow-y-auto p-4 m-0 resume-editor">
                <DndContext
                  sensors={sensors}
                  onDragEnd={handleSectionOrderChange}
                >
                  <SortableContext items={resumeData.sections.map((section) => section.id)}>
                    <ResumeEditor data={resumeData} onChange={handleDataChange} />
                  </SortableContext>
                </DndContext>
              </TabsContent>
              
              <TabsContent value="preview" className="h-full overflow-y-auto p-4 m-0">
                <div ref={mobilePreviewRef}>
                  <ResumePreview 
                    data={resumeData as any}
                    template={template} 
                    colorTheme={colorTheme}
                    font={font}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

