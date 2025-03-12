"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Undo, Redo } from "lucide-react"
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

export default function BuilderPage() {
  const [resumeData, setResumeData] = useState(defaultResumeData)
  const [template, setTemplate] = useState("professional")
  const [history, setHistory] = useState([defaultResumeData])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("edit")
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

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
        setHistory([parsedData])
      } catch (error) {
        console.error("Failed to parse saved resume data", error)
      }
    }
  }, [])

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData))
  }, [resumeData])

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newData)

    // Limit history to 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }

    setHistory(newHistory)
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
      
      // Add to history
      const newHistoryIndex = historyIndex + 1
      setHistory([...history.slice(0, newHistoryIndex), resumeData])
      setHistoryIndex(newHistoryIndex)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setResumeData(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setResumeData(history[historyIndex + 1])
    }
  }

  const handleExportPDF = async () => {
    try {
      // This would be implemented with react-to-pdf or a similar library
      toast({
        title: "Resume exported",
        description: "Your resume has been exported as a PDF",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your resume",
        variant: "destructive",
      })
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
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex === 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
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
              <ResumePreview data={resumeData} template={template} />
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
              <ResumePreview data={resumeData} template={template} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

