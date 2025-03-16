"use client"

import { useState, useEffect } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoSaveStatusProps {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  className?: string
}

export function AutoSaveStatus({ 
  isSaving, 
  lastSaved, 
  error, 
  className 
}: AutoSaveStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  
  // Update the time ago text every minute
  useEffect(() => {
    if (!lastSaved) return
    
    const updateTimeAgo = () => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
      
      if (diffInSeconds < 5) {
        setTimeAgo('just now')
      } else if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds} seconds ago`)
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setTimeAgo(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`)
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`)
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        setTimeAgo(`${days} ${days === 1 ? 'day' : 'days'} ago`)
      }
    }
    
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [lastSaved])
  
  return (
    <div className={cn("flex items-center text-xs text-muted-foreground", className)}>
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          <span>Saving...</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="h-3 w-3 text-destructive mr-1" />
          <span className="text-destructive">Failed to save</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="h-3 w-3 text-green-500 mr-1" />
          <span>Saved {timeAgo}</span>
        </>
      ) : (
        <span>Not saved yet</span>
      )}
    </div>
  )
} 