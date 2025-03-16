"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResumeNameInputProps {
  name: string
  onChange: (name: string) => void
  className?: string
  disabled?: boolean
}

export function ResumeNameInput({ 
  name, 
  onChange, 
  className,
  disabled = false
}: ResumeNameInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])
  
  // Update input value when name prop changes
  useEffect(() => {
    setInputValue(name)
  }, [name])
  
  const handleStartEditing = () => {
    if (disabled) return
    setIsEditing(true)
  }
  
  const handleSave = () => {
    if (inputValue.trim() === '') {
      setInputValue(name) // Reset to original name if empty
    } else {
      onChange(inputValue)
    }
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setInputValue(name) // Reset to original name
      setIsEditing(false)
    }
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isEditing ? (
        <>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-9 font-medium bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            placeholder="Resume name"
            maxLength={50}
            autoFocus
          />
          <button 
            onClick={handleSave}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Save resume name"
          >
            <Check className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span 
            className={cn(
              "font-medium truncate cursor-pointer hover:underline", 
              disabled && "cursor-default hover:no-underline"
            )}
            onClick={handleStartEditing}
          >
            {name || "Untitled Resume"}
          </span>
          {!disabled && (
            <button 
              onClick={handleStartEditing}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit resume name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  )
} 