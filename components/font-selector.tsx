"use client"

import { useEffect, useState } from "react"
import { Check, Type } from "lucide-react"
import { Inter, Open_Sans } from "next/font/google"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Load fonts with Next.js
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

// Define available fonts
const FONTS = [
  { id: "inter", name: "Inter" },
  { id: "roboto", name: "Roboto" },
  { id: "lato", name: "Lato" },
  { id: "poppins", name: "Poppins" },
  { id: "montserrat", name: "Montserrat" },
  { id: "open-sans", name: "Open Sans" },
]

// Map font names to CSS font-family values
export const FONT_FAMILY_MAP: Record<string, string> = {
  "Inter": "'Inter', sans-serif",
  "Open Sans": "'Open Sans', sans-serif",
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
    <div className={`${inter.variable} ${openSans.variable}`}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[130px]">
          <Type className="mr-2 h-4 w-4" />
          <SelectValue>{currentFontName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((font) => (
            <SelectItem
              key={font.id}
              value={font.id}
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 