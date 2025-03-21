"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColorTheme } from "@/types"

// Define color themes
const COLOR_THEMES: { id: ColorTheme; name: string; color: string }[] = [
  { id: "blue", name: "Blue", color: "#2563eb" },
  { id: "green", name: "Green", color: "#16a34a" },
  { id: "red", name: "Red", color: "#dc2626" },
  { id: "purple", name: "Purple", color: "#9333ea" },
  { id: "gray", name: "Gray", color: "#4b5563" },
  { id: "black", name: "Black", color: "#000000" },
]

interface ColorPickerProps {
  value: ColorTheme
  onChange: (color: ColorTheme) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const currentTheme = COLOR_THEMES.find(theme => theme.id === value) || COLOR_THEMES[0]
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-auto border-none p-0 hover:bg-transparent hover:text-primary [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:max-w-[100px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full" 
              style={{ backgroundColor: currentTheme.color }}
            />
            <span className="line-clamp-1">{currentTheme.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {COLOR_THEMES.map((theme) => (
          <SelectItem 
            key={theme.id} 
            value={theme.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: theme.color }}
              />
              {theme.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 