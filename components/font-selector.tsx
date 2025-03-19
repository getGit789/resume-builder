"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
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
  "Inter",
  "Open Sans",
  "Georgia"
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

export function FontSelector({ value, onValueChange }: FontSelectorProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  const handleValueChange = (fontName: string) => {
    const fontFamily = FONT_FAMILY_MAP[fontName] || fontName
    onValueChange(fontFamily)
  }
  
  // Get the display name from the font family value
  const getDisplayName = (fontFamily: string) => {
    const entry = Object.entries(FONT_FAMILY_MAP).find(([_, value]) => value === fontFamily)
    return entry ? entry[0] : fontFamily
  }
  
  const displayValue = getDisplayName(value)
  
  return (
    <div className={`${inter.variable} ${openSans.variable}`}>
      <Select
        value={displayValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((font) => (
            <SelectItem 
              key={font} 
              value={font}
              className="flex items-center justify-between"
              style={{ fontFamily: FONT_FAMILY_MAP[font] }}
            >
              <span>{font}</span>
              {displayValue === font && <Check className="h-4 w-4 ml-2" />}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 