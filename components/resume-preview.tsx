"use client"

import { ProfessionalTemplate } from "@/components/templates/professional"
import { MinimalistTemplate } from "@/components/templates/minimalist"
import { ModernTemplate } from "@/components/templates/modern"

export default function ResumePreview({ data, template }) {
  const renderTemplate = () => {
    switch (template) {
      case "professional":
        return <ProfessionalTemplate data={data} />
      case "minimalist":
        return <MinimalistTemplate data={data} />
      case "modern":
        return <ModernTemplate data={data} />
      default:
        return <ProfessionalTemplate data={data} />
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[800px] mx-auto">
      <div className="p-6">{renderTemplate()}</div>
    </div>
  )
}

