"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { ColorTheme } from "@/types"

const COLOR_THEMES: { id: ColorTheme; name: string; color: string }[] = [
  { id: "blue", name: "Blue", color: "#2563eb" },
  { id: "green", name: "Green", color: "#16a34a" },
  { id: "red", name: "Red", color: "#dc2626" },
  { id: "purple", name: "Purple", color: "#9333ea" },
  { id: "gray", name: "Gray", color: "#4b5563" },
]

interface ColorThemeSelectorProps {
  currentTheme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
}

export function ColorThemeSelector({
  currentTheme,
  onThemeChange,
}: ColorThemeSelectorProps) {
  const currentThemeData = COLOR_THEMES.find(t => t.id === currentTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: currentThemeData?.color }}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {COLOR_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-2"
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 