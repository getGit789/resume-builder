"use client"

import { useState, useEffect, useRef } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Palette, FileText, ExternalLink, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ResumeEditor from "@/components/resume-editor"
import ResumePreview from "@/components/resume-preview"
import { defaultResumeData } from "@/lib/default-data"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DragEndEvent } from "@dnd-kit/core"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ATSChecker } from "@/components/ats-checker"
import { GrammarChecker } from "@/components/grammar-checker"
import { generatePDF, generateDOCX } from '@/lib/pdf-utils'

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
// Define valid color theme values
type ColorTheme = "default" | "blue" | "green" | "purple" | "red" | "orange" | "teal";

const colorThemes = [
  { name: "Default", value: "default" as ColorTheme, color: "#000000" },
  { name: "Blue", value: "blue" as ColorTheme, color: "#3B82F6" },
  { name: "Green", value: "green" as ColorTheme, color: "#10B981" },
  { name: "Purple", value: "purple" as ColorTheme, color: "#8B5CF6" },
  { name: "Red", value: "red" as ColorTheme, color: "#EF4444" },
  { name: "Orange", value: "orange" as ColorTheme, color: "#F97316" },
  { name: "Teal", value: "teal" as ColorTheme, color: "#14B8A6" },
];

// Utility functions for export
const htmlToPlainText = (html: string) => {
  // Replace common HTML entities
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove HTML tags but preserve line breaks
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  
  return text.trim();
};

const extractListItems = (html: string) => {
  const items: string[] = [];
  // Replace newlines with a special character and then back
  const processedHtml = html.replace(/\n/g, '§§NEWLINE§§');
  
  // Extract list items
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi;
  let match;
  
  while ((match = listItemRegex.exec(processedHtml)) !== null) {
    // Clean up the list item text
    let itemText = match[1]
      .replace(/<[^>]+>/g, '') // Remove any nested HTML tags
      .replace(/§§NEWLINE§§/g, '\n') // Restore newlines
      .trim();
    
    if (itemText) {
      items.push(itemText);
    }
  }
  
  return items;
};

export default function BuilderPage() {
  const [resumeData, setResumeData] = useState(defaultResumeData)
  const [template, setTemplate] = useState("professional")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [activeTab, setActiveTab] = useState("edit")
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const desktopPreviewRef = useRef<HTMLDivElement>(null)
  const mobilePreviewRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

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
  }, [])

  // Helper function to validate color theme
  const isValidColorTheme = (theme: string): theme is ColorTheme => {
    return ["default", "blue", "green", "purple", "red", "orange", "teal"].includes(theme);
  }

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
      setIsExporting(true);
      
      // Get the resume preview element
      const resumeElement = document.getElementById('resume-preview');
      if (!resumeElement) {
        throw new Error('Resume preview element not found');
      }
      
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Generate PDF
      const pdfBlob = await generatePDF(resumeElement, `${resumeData.personalInfo.firstName}-${resumeData.personalInfo.lastName}-Resume.pdf`);
      
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.firstName}-${resumeData.personalInfo.lastName}-Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Export Successful',
        description: 'Your resume has been exported as a PDF.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'PDF Export Failed',
        description: 'There was an error exporting your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setIsExporting(true);
      
      // Get the resume preview element
      const resumeElement = document.getElementById('resume-preview');
      if (!resumeElement) {
        throw new Error('Resume preview element not found');
      }
      
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Generate DOCX
      const docxBlob = await generateDOCX(resumeElement, `${resumeData.personalInfo.firstName}-${resumeData.personalInfo.lastName}-Resume.docx`);
      
      // Create a download link
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.firstName}-${resumeData.personalInfo.lastName}-Resume.docx`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'DOCX Export Successful',
        description: 'Your resume has been exported as a DOCX file.',
      });
    } catch (error) {
      console.error('DOCX export error:', error);
      toast({
        title: 'DOCX Export Failed',
        description: 'There was an error exporting your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGoogleDocs = async () => {
    try {
      // Show loading toast
      toast({
        title: "Preparing for Google Docs",
        description: "Creating document for Google Docs...",
      });
      
      // Use the same document creation logic as DOCX export
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      
      // Use the utility functions instead of redefining them
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Name
            new Paragraph({
              text: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              thematicBreak: false,
            }),
            
            // Title
            new Paragraph({
              text: resumeData.personalInfo.title,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
              },
            }),
            
            // Contact Info
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun(resumeData.personalInfo.email || ""),
                resumeData.personalInfo.phone ? new TextRun(" • " + resumeData.personalInfo.phone) : new TextRun(""),
                resumeData.personalInfo.location ? new TextRun(" • " + resumeData.personalInfo.location) : new TextRun(""),
              ],
              spacing: {
                after: 200,
              },
            }),
            
            // Links
            ...(resumeData.personalInfo.links && resumeData.personalInfo.links.length > 0 ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: resumeData.personalInfo.links.map((link, index) => {
                  const children = [];
                  if (index > 0) {
                    children.push(new TextRun(" • "));
                  }
                  children.push(new TextRun({
                    text: link.title,
                    style: "Hyperlink",
                  }));
                  return children;
                }).flat(),
                spacing: {
                  after: 400,
                },
              }),
            ] : []),
            
            // Summary
            ...(resumeData.personalInfo.summary ? [
              new Paragraph({
                text: "Professional Summary",
                heading: HeadingLevel.HEADING_2,
                thematicBreak: true,
                spacing: {
                  after: 200,
                },
              }),
              ...(resumeData.personalInfo.summary.includes('<ul>') || resumeData.personalInfo.summary.includes('<li>') 
                ? extractListItems(resumeData.personalInfo.summary).map(item => 
                    new Paragraph({
                      text: item,
                      bullet: { level: 0 },
                      indent: { left: 720 },
                      spacing: { after: 100 },
                    })
                  )
                : [new Paragraph({
                    text: htmlToPlainText(resumeData.personalInfo.summary),
                    spacing: { after: 400 },
                  })]
              ),
            ] : []),
            
            // Sections
            ...resumeData.sections.flatMap(section => {
              const sectionElements = [
                new Paragraph({
                  text: section.title,
                  heading: HeadingLevel.HEADING_2,
                  thematicBreak: true,
                  spacing: {
                    after: 200,
                  },
                }),
              ];
              
              // Add items
              section.items.forEach(item => {
                // Title and date
                sectionElements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: item.title,
                        bold: true,
                      }),
                      item.date ? new TextRun({
                        text: "  " + item.date,
                        bold: false,
                      }) : new TextRun(""),
                    ],
                    spacing: {
                      after: 100,
                    },
                  })
                );
                
                // Subtitle
                if (item.subtitle) {
                  sectionElements.push(
                    new Paragraph({
                      text: item.subtitle,
                      spacing: {
                        after: 100,
                      },
                    })
                  );
                }
                
                // Description - handle bullet points
                if (item.description) {
                  const descriptionText = item.description;
                  
                  // Check if the description contains bullet points
                  if (descriptionText.includes('<ul>') || descriptionText.includes('<li>')) {
                    // Extract list items
                    const listItems = extractListItems(descriptionText);
                    
                    listItems.forEach(itemText => {
                      sectionElements.push(
                        new Paragraph({
                          text: itemText,
                          bullet: {
                            level: 0,
                          },
                          indent: {
                            left: 720, // 0.5 inches in twips
                          },
                          spacing: {
                            after: 100,
                          },
                        })
                      );
                    });
                  } else {
                    // Regular text
                    sectionElements.push(
                      new Paragraph({
                        text: htmlToPlainText(descriptionText),
                        spacing: {
                          after: 100,
                        },
                      })
                    );
                  }
                }
                
                // Add spacing after each item
                sectionElements.push(
                  new Paragraph({
                    text: "",
                    spacing: {
                      after: 200,
                    },
                  })
                );
              });
              
              return sectionElements;
            }),
          ],
        }],
      });
      
      // Generate the DOCX blob
      const blob = await Packer.toBlob(doc);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create the Google Docs URL
      const googleDocsUrl = `https://docs.google.com/document/create?usp=upload_and_import`;
      
      // Open Google Docs in a new tab
      window.open(googleDocsUrl, '_blank');
      
      // Show instructions toast
      toast({
        title: "Google Docs opened",
        description: "In Google Docs, use File > Import to upload the DOCX file that was just downloaded.",
        duration: 10000, // Show for 10 seconds
      });
      
      // Download the DOCX file for the user to import
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume_for_GoogleDocs.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Google Docs export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error preparing your resume for Google Docs",
        variant: "destructive",
      });
    }
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
            <ATSChecker resumeData={resumeData} />
            <GrammarChecker resumeData={resumeData} />
            
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
        {isDesktop ? (
          <div className="container grid h-full grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <div className="overflow-y-auto">
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
          <div className="container h-full p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="flex items-center justify-between border-b px-4">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 py-2">
                  <Select
                    value={template}
                    onValueChange={(value) => setTemplate(value)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: colorThemes.find(
                              (theme) => theme.value === colorTheme
                            )?.color,
                          }}
                        />
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
                </div>
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
          </div>
        )}
      </main>
    </div>
  )
}

