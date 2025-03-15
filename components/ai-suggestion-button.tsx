"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AISuggestionButtonProps {
  type: 'summary' | 'description' | 'skills'
  jobTitle?: string
  onSelectSuggestion: (suggestion: string) => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function AISuggestionButton({
  type,
  jobTitle = "Software Engineer",
  onSelectSuggestion,
  variant = "outline",
  size = "sm"
}: AISuggestionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, jobTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      
      // Handle skills differently as they come as arrays
      if (type === 'skills') {
        // For skills, we'll join them with commas
        const formattedSkills = data.suggestions.map((skillSet: string[]) => 
          skillSet.join(', ')
        )
        setSuggestions(formattedSkills)
      } else {
        setSuggestions(data.suggestions)
      }
      
      setIsOpen(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI Suggest
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">AI Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Select a suggestion to use in your resume.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 border-b last:border-0 hover:bg-muted cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <p className="text-sm whitespace-pre-line">{suggestion}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 