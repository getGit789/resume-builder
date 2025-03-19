"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ColorTheme } from "@/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Save, FileDown, Share2, RefreshCw, AlertTriangle } from "lucide-react"
import { TemplateSelector } from "./template-selector"
import { ColorThemeSelector } from "./color-theme-selector"
import { FontSelector } from "./font-selector"

interface BuilderToolbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onExportPDF: () => void
  onExportDOCX: () => void
  onExportGoogleDocs: () => void
  resumeName: string
  onResumeNameChange: (name: string) => void
  currentTemplate: string
  onTemplateChange: (template: string) => void
  colorTheme: ColorTheme
  onColorThemeChange: (theme: ColorTheme) => void
  font: string
  onFontChange: (font: string) => void
  isAutosaving: boolean
  lastSaved: Date | null
  autosaveError: string | null
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
  isAutosaving,
  lastSaved,
  autosaveError,
}: BuilderToolbarProps) {
  const router = useRouter()
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(resumeName)

  const handleNameSubmit = () => {
    onResumeNameChange(tempName)
    setIsEditingName(false)
  }

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Resume Name */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNameSubmit()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 w-[200px]"
                autoFocus
                onBlur={handleNameSubmit}
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setIsEditingName(true)
                setTempName(resumeName)
              }}
              className="text-lg font-semibold hover:underline"
            >
              {resumeName}
            </button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
          <TabsList className="h-full bg-transparent">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ats">ATS Check</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ml-auto flex items-center gap-2">
          {/* Template Selector */}
          <TemplateSelector
            currentTemplate={currentTemplate}
            onTemplateChange={onTemplateChange}
          />

          {/* Color Theme Selector */}
          <ColorThemeSelector
            currentTheme={colorTheme}
            onThemeChange={onColorThemeChange}
          />

          {/* Font Selector */}
          <FontSelector value={font} onValueChange={onFontChange} />

          <Separator orientation="vertical" className="h-6" />

          {/* Export Options */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onExportDOCX}>
              <FileDown className="mr-2 h-4 w-4" />
              DOCX
            </Button>
            <Button variant="outline" size="sm" onClick={onExportGoogleDocs}>
              <FileDown className="mr-2 h-4 w-4" />
              Google Docs
            </Button>
          </div>

          {/* Autosave Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isAutosaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : autosaveError ? (
              <>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                {autosaveError}
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-4 w-4" />
                Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
} 