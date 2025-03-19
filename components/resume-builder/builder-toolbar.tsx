"use client";

import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import { ResumeNameInput } from "@/components/resume-name-input";
import { FontSelector } from "@/components/font-selector";
import { AutoSaveStatus } from "@/components/auto-save-status";
import { ColorTheme, themeColors } from "@/types";

// Define color themes
const colorThemes = [
  { name: "Default", value: "default", color: themeColors.default },
  { name: "Blue", value: "blue", color: themeColors.blue },
  { name: "Green", value: "green", color: themeColors.green },
  { name: "Purple", value: "purple", color: themeColors.purple },
  { name: "Red", value: "red", color: themeColors.red },
  { name: "Orange", value: "orange", color: themeColors.orange },
  { name: "Teal", value: "teal", color: themeColors.teal },
];

interface BuilderToolbarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onExportGoogleDocs: () => void;
  resumeName: string;
  onResumeNameChange: (name: string) => void;
  currentTemplate: string;
  onTemplateChange: (template: string) => void;
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
  font: string;
  onFontChange: (font: string) => void;
  isAutosaving: boolean;
  lastSaved: Date | null;
  autosaveError: string | null;
  children?: ReactNode;
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
  children
}: BuilderToolbarProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="border-b">
        <div className="container flex items-center justify-between py-4 px-12">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ResumeNameInput
              name={resumeName}
              onChange={onResumeNameChange}
            />
            
            <AutoSaveStatus
              isSaving={isAutosaving}
              lastSaved={lastSaved}
              error={autosaveError}
              className="hidden sm:flex"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={currentTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={colorTheme} onValueChange={onColorThemeChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Color Theme" />
              </SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FontSelector
              value={font}
              onValueChange={onFontChange}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportDOCX}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportGoogleDocs}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="container px-12">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="gap-2">
              <TabsTrigger value="edit" className="px-4">Edit</TabsTrigger>
              <TabsTrigger value="preview" className="px-4">Preview</TabsTrigger>
              <TabsTrigger value="ats" className="px-4">ATS Check</TabsTrigger>
              <TabsTrigger value="grammar" className="px-4">Grammar</TabsTrigger>
            </TabsList>
            {children}
          </Tabs>
        </div>
      </div>
    </div>
  );
}