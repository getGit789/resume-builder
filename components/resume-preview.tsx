"use client"

import { ProfessionalTemplate } from "@/components/templates/professional"
import { MinimalistTemplate } from "@/components/templates/minimalist"
import { ModernTemplate } from "@/components/templates/modern"

interface ResumePreviewProps {
  data: any;
  template: string;
  colorTheme?: string;
}

export default function ResumePreview({ data, template, colorTheme = "default" }: ResumePreviewProps) {
  const renderTemplate = () => {
    switch (template) {
      case "professional":
        return <ProfessionalTemplate data={data} colorTheme={colorTheme} />
      case "minimalist":
        return <MinimalistTemplate data={data} colorTheme={colorTheme} />
      case "modern":
        return <ModernTemplate data={data} colorTheme={colorTheme} />
      default:
        return <ProfessionalTemplate data={data} colorTheme={colorTheme} />
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[800px] mx-auto">
      <div className="p-6">{renderTemplate()}</div>
    </div>
  )
}

