"use client"

import { ProfessionalTemplate } from "./templates/professional"
import { MinimalistTemplate } from "./templates/minimal"
import { ModernTemplate } from "./templates/modern"
import { CreativeTemplate } from "./templates/creative"
import { ExecutiveTemplate } from "./templates/executive"
import { ColorTheme, ResumeData } from "@/types"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { FONT_FAMILY_MAP, FONTS } from "@/components/font-selector"

interface ResumePreviewProps {
  resumeData: ResumeData | null
  template?: string
  colorTheme?: ColorTheme
  font?: string
  isExport?: boolean
  previewRef?: React.RefObject<HTMLDivElement>
}

// Direct mapping from font ID to font family
const FONT_ID_TO_FAMILY: Record<string, string> = {
  "calibri": "'Calibri', 'Segoe UI', sans-serif",
  "arial": "'Arial', 'Helvetica Neue', sans-serif",
  "helvetica": "'Helvetica', 'Arial', sans-serif",
  "times-new-roman": "'Times New Roman', Times, serif",
  "georgia": "Georgia, 'Times New Roman', serif"
};

// Simple components for error and loading states
function TemplateError({ error }: { error: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 bg-white">
      <div className="text-center">
        <h3 className="text-lg font-medium text-red-500">Error Loading Resume</h3>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
      </div>
    </div>
  );
}

function TemplateLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 bg-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading resume...</p>
      </div>
    </div>
  );
}

export function ResumePreview({
  resumeData,
  template = "professional",
  colorTheme = "blue",
  font = "calibri",
  isExport = false,
  previewRef,
}: ResumePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeData) {
      setError("Resume data is required")
      setIsLoading(false)
      return
    }

    // Validate required data
    if (!resumeData.personalInfo) {
      setError("Personal information is required")
      setIsLoading(false)
      return
    }

    setError(null)
    setIsLoading(false)

    // Apply export-specific styles
    if (isExport && previewRef?.current) {
      previewRef.current.setAttribute("data-exporting", "true")
    } else if (previewRef?.current) {
      previewRef.current.removeAttribute("data-exporting")
    }
  }, [resumeData, isExport, previewRef])

  // Function to render the appropriate template based on template prop
  const renderTemplate = () => {
    // If no resume data, show loading or error
    if (!resumeData) {
      return isLoading ? <TemplateLoading /> : <TemplateError error="No resume data available" />;
    }
    
    // Get proper font family string from font ID directly
    const fontFamily = FONT_ID_TO_FAMILY[font] || "'Calibri', 'Segoe UI', sans-serif";

    // Return the appropriate template based on the template prop
    if (error) {
      return <TemplateError error={error} />;
    }

    if (isLoading) {
      return <TemplateLoading />;
    }

    switch (template) {
      case "professional":
        return <ProfessionalTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
      case "minimal":
        return <MinimalistTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
      case "modern":
        return <ModernTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
      case "creative":
        return <CreativeTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
      case "executive":
        return <ExecutiveTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
      default:
        return <ProfessionalTemplate data={resumeData} colorTheme={colorTheme} font={fontFamily} />;
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 my-4">{error}</div>
  }

  return (
    <div
      id="resume-preview"
      className="resume-preview-container resume-preview relative bg-white mx-auto"
      ref={previewRef}
      data-template={template}
      data-testid="resume-preview"
    >
      <style jsx global>{`
        /* Export-specific styles */
        [data-exporting="true"] {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      {renderTemplate()}
    </div>
  )
}

