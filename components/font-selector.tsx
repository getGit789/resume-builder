"use client"

import { useEffect, useState } from "react"
import { Check, Type } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define available fonts - in specified order
export const FONTS = [
  { id: "calibri", name: "Calibri" },
  { id: "arial", name: "Arial" },
  { id: "helvetica", name: "Helvetica" },
  { id: "times-new-roman", name: "Times New Roman" },
  { id: "georgia", name: "Georgia" }
]

// Map font names to CSS font-family values
export const FONT_FAMILY_MAP: Record<string, string> = {
  "Calibri": "'Calibri', 'Segoe UI', sans-serif",
  "Arial": "'Arial', sans-serif",
  "Helvetica": "'Helvetica', sans-serif",
  "Times New Roman": "'Times New Roman', serif",
  "Georgia": "Georgia, serif"
}

interface FontSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function FontSelector({
  value,
  onValueChange,
}: FontSelectorProps) {
  const currentFontName = FONTS.find(f => f.id === value)?.name || "Select Font"

  return (
    <div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <Type className="mr-2 h-4 w-4" />
          <SelectValue>{currentFontName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((font) => (
            <SelectItem
              key={font.id}
              value={font.id}
              style={{ fontFamily: FONT_FAMILY_MAP[font.name] }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 