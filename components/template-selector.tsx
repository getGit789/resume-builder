"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Layout } from "lucide-react"

const TEMPLATES = [
  { id: "professional", name: "Professional" },
  { id: "modern", name: "Modern" },
  { id: "creative", name: "Creative" },
  { id: "minimal", name: "Minimal" },
  { id: "executive", name: "Executive" },
]

interface TemplateSelectorProps {
  currentTemplate: string
  onTemplateChange: (template: string) => void
}

export function TemplateSelector({
  currentTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  const currentTemplateName = TEMPLATES.find(t => t.id === currentTemplate)?.name || "Select Template"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Layout className="mr-2 h-4 w-4" />
          {currentTemplateName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 