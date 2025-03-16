"use client"

import { ProfessionalTemplate } from "@/components/templates/professional"
import { MinimalistTemplate } from "@/components/templates/minimalist"
import { ModernTemplate } from "@/components/templates/modern"
import { ColorTheme, ResumeData } from "@/types"

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
  colorTheme?: ColorTheme;
  font?: string;
}

export default function ResumePreview({ 
  data, 
  template, 
  colorTheme = "default",
  font = "'Inter', sans-serif"
}: ResumePreviewProps) {
  const renderTemplate = () => {
    switch (template) {
      case "professional":
        return <ProfessionalTemplate data={data} colorTheme={colorTheme} font={font} />
      case "minimalist":
        return <MinimalistTemplate data={data} colorTheme={colorTheme} font={font} />
      case "modern":
        return <ModernTemplate data={data} colorTheme={colorTheme} font={font} />
      default:
        return <ProfessionalTemplate data={data} colorTheme={colorTheme} font={font} />
    }
  }

  return (
    <div id="resume-preview" className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[800px] mx-auto">
      <div className="p-6">{renderTemplate()}</div>
    </div>
  )
}

