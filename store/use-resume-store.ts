import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorTheme, ResumeData } from '@/types';
import { useSession } from 'next-auth/react';
import { cookies } from 'next/headers';

// Define the Resume type
export interface Resume {
  id: string;
  name: string;
  data: ResumeData;
  template: string;
  colorTheme: ColorTheme;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  shareToken?: string;
}

// Define the store state
interface ResumeState {
  // Data
  resumes: Resume[];
  selectedResumeId: string | null;
  guestMode: boolean;
  guestToken: string | null;
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<Resume | null>;
  createResume: (name: string, data: ResumeData, template?: string, colorTheme?: string) => Promise<Resume | null>;
  updateResume: (id: string, updates: Partial<Resume>) => Promise<Resume | null>;
  deleteResume: (id: string) => Promise<boolean>;
  shareResume: (id: string, isPublic?: boolean) => Promise<{ shareToken: string } | null>;
  setSelectedResumeId: (id: string | null) => void;
  setGuestMode: (enabled: boolean) => void;
  clearError: () => void;
}

// Create the store
export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      // Initial state
      resumes: [],
      selectedResumeId: null,
      guestMode: false,
      guestToken: null,
      isLoading: false,
      error: null,
      
      // Actions
      fetchResumes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/resumes', {
            credentials: 'include',
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              // If unauthorized and not in guest mode, enable guest mode
              if (!get().guestMode) {
                const guestToken = `guest-${Date.now()}`;
                document.cookie = `guestMode=true; path=/`;
                document.cookie = `guestToken=${guestToken}; path=/`;
                set({ guestMode: true, guestToken });
                // Retry the fetch with guest mode
                return get().fetchResumes();
              }
            }
            throw new Error('Failed to fetch resumes');
          }
          
          const resumes = await response.json();
          set({ resumes, isLoading: false });
        } catch (error) {
          console.error('Error fetching resumes:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      fetchResume: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/resumes/${id}`, {
            credentials: 'include',
          });
          
          if (!response.ok) {
            if (response.status === 401 && !get().guestMode) {
              const guestToken = `guest-${Date.now()}`;
              document.cookie = `guestMode=true; path=/`;
              document.cookie = `guestToken=${guestToken}; path=/`;
              set({ guestMode: true, guestToken });
              return get().fetchResume(id);
            }
            throw new Error('Failed to fetch resume');
          }
          
          const resume = await response.json();
          
          // Update the resume in the store if it exists
          set(state => ({
            resumes: state.resumes.map(r => r.id === id ? resume : r),
            isLoading: false
          }));
          
          return resume;
        } catch (error) {
          console.error(`Error fetching resume ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return null;
        }
      },
      
      createResume: async (name: string, data: ResumeData, template = 'professional', colorTheme = 'default') => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/resumes', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, data, template, colorTheme }),
          });
          
          if (!response.ok) {
            if (response.status === 401 && !get().guestMode) {
              const guestToken = `guest-${Date.now()}`;
              document.cookie = `guestMode=true; path=/`;
              document.cookie = `guestToken=${guestToken}; path=/`;
              set({ guestMode: true, guestToken });
              return get().createResume(name, data, template, colorTheme);
            }
            throw new Error('Failed to create resume');
          }
          
          const newResume = await response.json();
          
          // Add the new resume to the store
          set(state => ({
            resumes: [newResume, ...state.resumes],
            isLoading: false
          }));
          
          return newResume;
        } catch (error) {
          console.error('Error creating resume:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return null;
        }
      },
      
      updateResume: async (id: string, updates: Partial<Resume>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/resumes/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            if (response.status === 401 && !get().guestMode) {
              const guestToken = `guest-${Date.now()}`;
              document.cookie = `guestMode=true; path=/`;
              document.cookie = `guestToken=${guestToken}; path=/`;
              set({ guestMode: true, guestToken });
              return get().updateResume(id, updates);
            }
            throw new Error('Failed to update resume');
          }
          
          const updatedResume = await response.json();
          
          // Update the resume in the store
          set(state => ({
            resumes: state.resumes.map(r => r.id === id ? updatedResume : r),
            isLoading: false
          }));
          
          return updatedResume;
        } catch (error) {
          console.error(`Error updating resume ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return null;
        }
      },
      
      deleteResume: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/resumes/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete resume');
          }
          
          // Remove the resume from the store
          set(state => ({
            resumes: state.resumes.filter(r => r.id !== id),
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          console.error(`Error deleting resume ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return false;
        }
      },
      
      shareResume: async (id: string, isPublic?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          // Create a request with optional isPublic parameter
          const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          };
          
          // If isPublic is explicitly provided, include it in the body
          if (typeof isPublic === 'boolean') {
            requestOptions.body = JSON.stringify({ isPublic });
          }
          
          const response = await fetch(`/api/resumes/${id}/share`, requestOptions);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Failed to share resume');
          }
          
          const result = await response.json();
          
          if (!result || typeof result !== 'object') {
            throw new Error('Invalid response from server');
          }
          
          // Update the resume in the store with the share token
          set(state => ({
            resumes: state.resumes.map(r => 
              r.id === id 
                ? { 
                    ...r, 
                    isPublic: result.isPublic || false, 
                    shareToken: result.shareToken || null 
                  } 
                : r
            ),
            isLoading: false
          }));
          
          return result;
        } catch (error) {
          console.error(`Error sharing resume ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          throw error; // Re-throw the error to allow consumers to handle it
        }
      },
      
      setSelectedResumeId: (id: string | null) => {
        set({ selectedResumeId: id });
      },
      
      setGuestMode: (enabled: boolean) => {
        if (enabled) {
          const guestToken = `guest-${Date.now()}`;
          document.cookie = `guestMode=true; path=/`;
          document.cookie = `guestToken=${guestToken}; path=/`;
          set({ guestMode: true, guestToken });
        } else {
          document.cookie = 'guestMode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'guestToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          set({ guestMode: false, guestToken: null });
        }
        // Clear resumes when switching modes
        set({ resumes: [] });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'resume-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        resumes: state.resumes,
        selectedResumeId: state.selectedResumeId,
        guestMode: state.guestMode 
      }), // only persist these fields
    }
  )
); 