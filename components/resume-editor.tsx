"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GripVertical, Plus, Trash2 } from "lucide-react"

export default function ResumeEditor({ data, onChange }) {
  const handlePersonalInfoChange = (field, value) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    })
  }

  const handleSectionChange = (sectionId, field, value) => {
    const updatedSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          [field]: value,
        }
      }
      return section
    })

    onChange({
      ...data,
      sections: updatedSections,
    })
  }

  const handleItemChange = (sectionId, itemId, field, value) => {
    const updatedSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              [field]: value,
            }
          }
          return item
        })

        return {
          ...section,
          items: updatedItems,
        }
      }
      return section
    })

    onChange({
      ...data,
      sections: updatedSections,
    })
  }

  const addItem = (sectionId) => {
    const updatedSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        const newItem = {
          id: `item-${Date.now()}`,
          title: "",
          subtitle: "",
          date: "",
          description: "",
        }

        return {
          ...section,
          items: [...section.items, newItem],
        }
      }
      return section
    })

    onChange({
      ...data,
      sections: updatedSections,
    })
  }

  const removeItem = (sectionId, itemId) => {
    const updatedSections = data.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        }
      }
      return section
    })

    onChange({
      ...data,
      sections: updatedSections,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                value={data.personalInfo.firstName}
                onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                value={data.personalInfo.lastName}
                onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Professional Title
            </label>
            <Input
              id="title"
              value={data.personalInfo.title}
              onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              value={data.personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              value={data.personalInfo.location}
              onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">
              Professional Summary
            </label>
            <Textarea
              id="summary"
              rows={4}
              value={data.personalInfo.summary}
              onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
            />
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Links</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLinks = [
                    ...(data.personalInfo.links || []),
                    {
                      id: `link-${Date.now()}`,
                      title: "",
                      url: "",
                    },
                  ]
                  handlePersonalInfoChange("links", newLinks)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Link
              </Button>
            </div>

            {data.personalInfo.links && data.personalInfo.links.length > 0 ? (
              <div className="space-y-3">
                {data.personalInfo.links.map((link, index) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Title (e.g. LinkedIn)"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...data.personalInfo.links]
                        newLinks[index] = { ...link, title: e.target.value }
                        handlePersonalInfoChange("links", newLinks)
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="URL (e.g. https://linkedin.com/in/...)"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...data.personalInfo.links]
                        newLinks[index] = { ...link, url: e.target.value }
                        handlePersonalInfoChange("links", newLinks)
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newLinks = data.personalInfo.links.filter((_, i) => i !== index)
                        handlePersonalInfoChange("links", newLinks)
                      }}
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
        </CardContent>
      </Card>

      {data.sections.map((section) => (
        <SortableSection
          key={section.id}
          section={section}
          onSectionChange={handleSectionChange}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      ))}
    </div>
  )
}

function SortableSection({ section, onSectionChange, onItemChange, onAddItem, onRemoveItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div {...attributes} {...listeners} className="cursor-grab p-2 mr-2 rounded hover:bg-muted">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <Input
              value={section.title}
              onChange={(e) => onSectionChange(section.id, "title", e.target.value)}
              className="font-bold text-lg border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Section Title"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" defaultValue={section.items.map((item) => item.id)}>
            {section.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-normal">{item.title || "Untitled Item"}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label htmlFor={`${item.id}-title`} className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id={`${item.id}-title`}
                        value={item.title}
                        onChange={(e) => onItemChange(section.id, item.id, "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`${item.id}-subtitle`} className="text-sm font-medium">
                        Subtitle
                      </label>
                      <Input
                        id={`${item.id}-subtitle`}
                        value={item.subtitle}
                        onChange={(e) => onItemChange(section.id, item.id, "subtitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`${item.id}-date`} className="text-sm font-medium">
                        Date
                      </label>
                      <Input
                        id={`${item.id}-date`}
                        value={item.date}
                        onChange={(e) => onItemChange(section.id, item.id, "date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`${item.id}-description`} className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id={`${item.id}-description`}
                        rows={3}
                        value={item.description}
                        onChange={(e) => onItemChange(section.id, item.id, "description", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveItem(section.id, item.id)}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Item
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button variant="outline" size="sm" onClick={() => onAddItem(section.id)} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

