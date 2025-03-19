"use client"
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GripVertical, Pen, Plus, Trash2, FileText, Award, Users, Briefcase, Sparkles } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { SortableSection } from "@/components/sortable-section"
import { generateId } from "@/lib/utils"
import { PersonalInfo, Resume, Section, SectionItem, Link } from "@/types/resume"

interface ResumeEditorProps {
  resume: Resume
  onResumeChange: (resume: Resume) => void
}

export default function ResumeEditor({ resume, onResumeChange }: ResumeEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }))

  function handlePersonalInfoChange(field: keyof PersonalInfo, value: string) {
    // If the field is summary, ensure it's valid JSON
    if (field === "summary") {
      try {
        // If it's already JSON, keep it as is
        JSON.parse(value);
      } catch (e) {
        // If not JSON, create a simple Lexical JSON structure
        value = JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: value,
                    type: "text",
                    version: 1
                  }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        });
      }
    }

    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        personalInfo: {
          ...resume.data.personalInfo,
          [field]: value,
        },
      },
    })
  }

  function handleLinkChange(linkId: string, field: keyof Link, value: string) {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        personalInfo: {
          ...resume.data.personalInfo,
          links: resume.data.personalInfo.links.map((link) =>
            link.id === linkId ? { ...link, [field]: value } : link
          ),
        },
      },
    })
  }

  function handleAddLink() {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        personalInfo: {
          ...resume.data.personalInfo,
          links: [
            ...resume.data.personalInfo.links,
            { id: generateId(), title: "", url: "" },
          ],
        },
      },
    })
  }

  function handleRemoveLink(linkId: string) {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        personalInfo: {
          ...resume.data.personalInfo,
          links: resume.data.personalInfo.links.filter((link) => link.id !== linkId),
        },
      },
    })
  }

  function handleSectionTitleChange(sectionId: string, title: string) {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: resume.data.sections.map((section) =>
          section.id === sectionId ? { ...section, title } : section
        ),
      },
    })
  }

  function handleAddSection() {
    const newSection: Section = {
      id: generateId(),
      title: "New Section",
      items: [],
    }

    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: [...resume.data.sections, newSection],
      },
    })
  }

  function handleRemoveSection(sectionId: string) {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: resume.data.sections.filter((section) => section.id !== sectionId),
      },
    })
  }

  function handleAddItem(sectionId: string) {
    const newItem: SectionItem = {
      id: generateId(),
      title: "",
      subtitle: "",
      date: "",
      description: "",
    }

    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: resume.data.sections.map((section) =>
          section.id === sectionId
            ? { ...section, items: [...section.items, newItem] }
            : section
        ),
      },
    })
  }

  function handleItemChange(sectionId: string, itemId: string, field: keyof SectionItem, value: string) {
    // If the field is description, ensure it's valid JSON
    if (field === "description") {
      try {
        // If it's already JSON, keep it as is
        JSON.parse(value);
      } catch (e) {
        // If not JSON, create a simple Lexical JSON structure
        value = JSON.stringify({
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: value,
                    type: "text",
                    version: 1
                  }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        });
      }
    }

    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: resume.data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item
                ),
              }
            : section
        ),
      },
    })
  }

  function handleRemoveItem(sectionId: string, itemId: string) {
    onResumeChange({
      ...resume,
      data: {
        ...resume.data,
        sections: resume.data.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              }
            : section
        ),
      },
    })
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onResumeChange({
        ...resume,
        data: {
          ...resume.data,
          sections: arrayMove(
            resume.data.sections,
            resume.data.sections.findIndex((section) => section.id === active.id),
            resume.data.sections.findIndex((section) => section.id === over.id)
          ),
        },
      })
    }

    setActiveId(null)
  }

  return (
    <div className="space-y-8 p-6 max-w-3xl mx-auto bg-background">
      <Card className="border-2 border-primary/10 shadow-sm hover:border-primary/20 transition-all duration-200">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                value={resume.data.personalInfo.firstName}
                onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                value={resume.data.personalInfo.lastName}
                onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Professional Title
            </label>
            <Input
              id="title"
              value={resume.data.personalInfo.title}
              onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
              suppressHydrationWarning
            />
          </div>
          
          <Accordion type="multiple" defaultValue={[]}>
            <AccordionItem value="contact-info">
              <AccordionTrigger className="text-base font-semibold">
                Contact Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={resume.data.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      value={resume.data.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="location"
                      value={resume.data.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="professional-summary">
              <AccordionTrigger className="text-base font-semibold">
                Professional Summary
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <RichTextEditor
                    initialContent={resume.data.personalInfo.summary}
                    onChange={(value) => handlePersonalInfoChange("summary", value)}
                    placeholder="Write 2-4 short, energetic sentences about how great you are. Mention the role and what you did. What were the big achievements? Describe your motivation and list your skills."
                    className="min-h-[150px]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="professional-links">
              <AccordionTrigger className="text-base font-semibold">
                Professional Links
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddLink}
                      suppressHydrationWarning
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Link
                    </Button>
                  </div>

                  {resume.data.personalInfo.links && resume.data.personalInfo.links.length > 0 ? (
                    <div className="space-y-3">
                      {resume.data.personalInfo.links.map((link, index) => (
                        <div key={link.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Title (e.g. LinkedIn)"
                            value={link.title}
                            onChange={(e) => handleLinkChange(link.id, "title", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL (e.g. https://linkedin.com/in/...)"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, "url", e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLink(link.id)}
                            suppressHydrationWarning
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No links added yet. Add links to your LinkedIn, GitHub, or personal website.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={resume.data.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {resume.data.sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SortableSection
                  section={section}
                  isActive={section.id === activeId}
                  onTitleChange={(value) => handleSectionTitleChange(section.id, value)}
                  onAddItem={() => handleAddItem(section.id)}
                  onRemoveSection={() => handleRemoveSection(section.id)}
                  onItemChange={(itemId, field, value) =>
                    handleItemChange(section.id, itemId, field as keyof SectionItem, value)
                  }
                  onRemoveItem={(itemId) => handleRemoveItem(section.id, itemId)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <Card className="border-2 border-primary/10 shadow-sm hover:border-primary/20 transition-all duration-200">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl font-semibold">Add Section</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="group h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              onClick={handleAddSection}
            >
              <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Custom Section</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="group h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              onClick={() => handleAddSection()}
            >
              <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Affiliations</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="group h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              onClick={() => handleAddSection()}
            >
              <Award className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Licenses & Certifications</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="group h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              onClick={() => handleAddSection()}
            >
              <Briefcase className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Internships</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

