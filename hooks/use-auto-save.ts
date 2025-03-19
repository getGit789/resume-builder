"use client";

import { useState, useEffect, useRef } from "react";

interface AutoSaveOptions {
  onSave: () => Promise<void>;
  debounceMs?: number;
  autoSaveEnabled?: boolean;
}

interface AutoSaveResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasPendingChanges: boolean;
}

export function useAutoSave({
  onSave,
  debounceMs = 2000,
  autoSaveEnabled = true,
}: AutoSaveOptions): AutoSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onSaveRef = useRef(onSave);
  const hasChangesRef = useRef(false);
  
  // Update onSave ref when the function changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    // Mark that we have pending changes
    setHasPendingChanges(true);
    hasChangesRef.current = true;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      // Only save if we actually have changes
      if (!hasChangesRef.current) return;
      
      try {
        setIsSaving(true);
        setError(null);
        
        await onSaveRef.current();
        
        setLastSaved(new Date());
        setHasPendingChanges(false);
        hasChangesRef.current = false;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to save"));
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoSaveEnabled, debounceMs]);
  
  return {
    isSaving,
    lastSaved,
    error,
    hasPendingChanges
  };
}