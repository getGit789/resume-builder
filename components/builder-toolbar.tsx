"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import {
  Download,
  Edit,
  Eye,
  FileCheck,
  Save,
  Copy,
  CalendarClock,
  Palette,
  Type,
  FileBadge,
  MoreHorizontal,
  Share,
  AlertTriangle,
  FileText,
  CheckCircle,
  SpellCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/color-picker"
import { templates } from "@/lib/resume-templates"
import { cn } from "@/lib/utils"
import { ColorTheme } from "@/types"
import { PremiumFeatureGate } from "@/components/premium-feature-gate"
import { useAuthStore } from "@/store/use-auth-store" 

interface BuilderToolbarProps {
  activeTab: string
  onTabChange: (value: string) => void
  onExportPDF: () => void
  onExportDOCX: () => void
  onExportGoogleDocs?: () => void
  resumeName: string
  onResumeNameChange: (name: string) => void
  currentTemplate: string
  onTemplateChange: (template: string) => void
  colorTheme: ColorTheme
  onColorThemeChange: (theme: ColorTheme) => void
  font: string
  onFontChange: (font: string) => void
  isAutosaving?: boolean
  lastSaved?: Date | null
  autosaveError?: string | null
}

export function BuilderToolbar({
  activeTab,
  onTabChange,
  onExportPDF,
  onExportDOCX,
  onExportGoogleDocs,
  resumeName,
  onResumeNameChange,
  currentTemplate,
  onTemplateChange,
  colorTheme,
  onColorThemeChange,
  font,
  onFontChange,
  isAutosaving = false,
  lastSaved = null,
  autosaveError = null,
}: BuilderToolbarProps) {
  const [localName, setLocalName] = useState(resumeName)
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    setLocalName(resumeName)
  }, [resumeName])
  
  const handleNameBlur = () => {
    if (localName !== resumeName) {
      onResumeNameChange(localName)
    }
  }
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }
  
  const getLastSavedText = () => {
    if (isAutosaving) return "Saving..."
    if (autosaveError) return "Error saving"
    if (!lastSaved) return "Not saved yet"
    
    return `Last saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
  }
  
  return (
    <div className="sticky top-0 z-10 border-b bg-card px-4 py-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="h-9 w-auto max-w-[200px] text-base font-medium"
          />
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            <PremiumFeatureGate feature="autoSave" fallback={<span>Manual save mode</span>}>
              <span>{getLastSavedText()}</span>
              {autosaveError && (
                <AlertTriangle className="h-3 w-3 text-destructive" />
              )}
            </PremiumFeatureGate>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
            <div className="flex items-center gap-1">
              <FileBadge className="h-4 w-4 text-muted-foreground" />
              <Select value={currentTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger className="h-auto border-none p-0 hover:bg-transparent hover:text-primary [&>span]:line-clamp-1 [&>span]:max-w-[100px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([id, template]) => (
                    <SelectItem key={id} value={id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mx-1 h-4 w-px bg-border"></div>
            
            <div className="flex items-center gap-1">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <ColorPicker
                value={colorTheme}
                onChange={onColorThemeChange}
              />
            </div>
            
            <div className="mx-1 h-4 w-px bg-border"></div>
            
            <div className="flex items-center gap-1">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Select value={font} onValueChange={onFontChange}>
                <SelectTrigger className="h-auto border-none p-0 hover:bg-transparent hover:text-primary [&>span]:line-clamp-1 [&>span]:max-w-[80px]">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calibri">Calibri</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="times-new-roman">Times New Roman</SelectItem>
                  <SelectItem value="cambria">Cambria</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="georgia">Georgia</SelectItem>
                  <SelectItem value="open-sans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={onTabChange} className="h-9">
            <TabsList className="h-full grid grid-cols-4">
              <TabsTrigger value="edit" className="h-full">
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-full">
                <Eye className="mr-2 h-3.5 w-3.5" /> Preview
              </TabsTrigger>
              <PremiumFeatureGate feature="atsCheck">
                <TabsTrigger value="ats" className="h-full">
                  <FileCheck className="mr-2 h-3.5 w-3.5" /> ATS Check
                </TabsTrigger>
              </PremiumFeatureGate>
              <PremiumFeatureGate feature="grammarCheck">
                <TabsTrigger value="grammar" className="h-full">
                  <SpellCheck className="mr-2 h-3.5 w-3.5" /> Grammar
                </TabsTrigger>
              </PremiumFeatureGate>
            </TabsList>
          </Tabs>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" /> Export <MoreHorizontal className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportPDF}>
                <Download className="mr-2 h-4 w-4" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDOCX}>
                <Copy className="mr-2 h-4 w-4" /> Export as DOCX
              </DropdownMenuItem>
              {onExportGoogleDocs && (
                <PremiumFeatureGate feature="exportGoogleDocs">
                  <DropdownMenuItem onClick={onExportGoogleDocs}>
                    <Share className="mr-2 h-4 w-4" /> Export to Google Docs
                  </DropdownMenuItem>
                </PremiumFeatureGate>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 