import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { ResumeData } from '@/types';

interface AutoSaveOptions {
  // Delay in milliseconds before saving after changes
  debounceTime?: number;
  // Whether to show toast notifications
  showNotifications?: boolean;
  // Callback when save is successful
  onSaveSuccess?: (data: any) => void;
  // Callback when save fails
  onSaveError?: (error: any) => void;
}

/**
 * Hook for automatically saving resume data to the API
 */
export function useAutoSave(
  resumeId: string | null,
  data: ResumeData,
  template: string,
  colorTheme: string,
  name: string = 'My Resume',
  options: AutoSaveOptions = {}
) {
  const { 
    debounceTime = 2000, 
    showNotifications = true,
    onSaveSuccess,
    onSaveError
  } = options;
  
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = !!session?.user;
  const isGuestMode = typeof window !== 'undefined' && localStorage.getItem('guestMode') === 'true';

  // Function to save data to localStorage (for both authenticated and guest users)
  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeData', JSON.stringify(data));
      localStorage.setItem('resumeTemplate', template);
      localStorage.setItem('resumeColorTheme', colorTheme);
      localStorage.setItem('resumeName', name);
      
      // For guest users, we'll also save the current timestamp
      if (isGuestMode) {
        localStorage.setItem('resumeLastSaved', new Date().toISOString());
      }
    }
  };

  // Function to save data to the API
  const saveToAPI = async () => {
    if (!isAuthenticated && !isGuestMode) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Always save to localStorage first as a backup
      saveToLocalStorage();
      
      // If user is not authenticated and not in guest mode, don't proceed with API call
      if (!isAuthenticated && !isGuestMode) {
        setIsSaving(false);
        return;
      }
      
      // If we have a resumeId, update the existing resume
      if (resumeId) {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            data,
            template,
            colorTheme,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save resume: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (showNotifications) {
          toast({
            title: 'Resume saved',
            description: 'Your changes have been saved successfully.',
            duration: 3000,
          });
        }
        
        setLastSaved(new Date());
        onSaveSuccess?.(result);
      } 
      // If we don't have a resumeId, create a new resume
      else if (isAuthenticated) {
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            data,
            template,
            colorTheme,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create resume: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (showNotifications) {
          toast({
            title: 'Resume created',
            description: 'Your resume has been created successfully.',
            duration: 3000,
          });
        }
        
        setLastSaved(new Date());
        onSaveSuccess?.(result);
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to save resume');
      
      if (showNotifications) {
        toast({
          title: 'Failed to save',
          description: 'Your changes could not be saved. They are stored locally until you can save again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
      
      onSaveError?.(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      saveToAPI();
    }, debounceTime);
  };

  // Trigger save when data changes
  useEffect(() => {
    debouncedSave();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, template, colorTheme, name]);

  // Save immediately (can be called manually)
  const saveNow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveToAPI();
  };

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  };
} 