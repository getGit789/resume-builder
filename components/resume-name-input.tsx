"use client"

import React, { useState, useRef, useEffect } from 'react'
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
      inputRef.current.select()
    }
  }, [isEditing])
  
  // Update input value when name prop changes
  useEffect(() => {
    setInputValue(name)
  }, [name])
  
  const handleStartEditing = () => {
    if (!disabled) {
      setIsEditing(true)
    }
  }
  
  const handleSave = () => {
    setIsEditing(false)
    if (inputValue.trim() !== name) {
      onChange(inputValue.trim() || 'Untitled Resume')
    }
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
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center gap-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1 w-full">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-9 font-semibold text-xl bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 min-w-0"
              placeholder="Resume Name"
              aria-label="Resume name"
              disabled={disabled}
            />
            <button 
              onClick={handleSave}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full flex-shrink-0"
              aria-label="Save resume name"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span 
              className={cn(
                "font-semibold text-xl cursor-pointer hover:underline truncate", 
                disabled && "cursor-default hover:no-underline"
              )}
              onClick={handleStartEditing}
            >
              {name || "Untitled Resume"}
            </span>
            {!disabled && (
              <button 
                onClick={handleStartEditing}
                className="text-muted-foreground/40 hover:text-muted-foreground p-1 rounded-full flex-shrink-0"
                aria-label="Edit resume name"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
} 