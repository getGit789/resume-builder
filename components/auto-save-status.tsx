"use client"

import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : error ? (
        <span className="text-destructive">{error}</span>
      ) : lastSaved ? (
        <span>
          Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      ) : null}
    </div>
  )
} 