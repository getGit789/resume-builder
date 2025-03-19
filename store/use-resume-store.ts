import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorTheme, ResumeData } from '@/types';

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
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<Resume | null>;
  createResume: (name: string, data: ResumeData, template?: string, colorTheme?: string) => Promise<Resume | null>;
  updateResume: (id: string, updates: Partial<Resume>) => Promise<Resume | null>;
  deleteResume: (id: string) => Promise<boolean>;
  shareResume: (id: string) => Promise<{ shareToken: string } | null>;
  setSelectedResumeId: (id: string | null) => void;
  clearError: () => void;
}

// Create the store
export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      // Initial state
      resumes: [],
      selectedResumeId: null,
      isLoading: false,
      error: null,
      
      // Actions
      fetchResumes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/resumes');
          
          if (!response.ok) {
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
          const response = await fetch(`/api/resumes/${id}`);
          
          if (!response.ok) {
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, data, template, colorTheme }),
          });
          
          if (!response.ok) {
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
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
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
      
      shareResume: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/resumes/${id}/share`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Failed to share resume');
          }
          
          const result = await response.json();
          
          // Update the resume in the store with the share token
          set(state => ({
            resumes: state.resumes.map(r => 
              r.id === id 
                ? { ...r, isPublic: true, shareToken: result.shareToken } 
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
          return null;
        }
      },
      
      setSelectedResumeId: (id: string | null) => {
        set({ selectedResumeId: id });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'resume-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        resumes: state.resumes,
        selectedResumeId: state.selectedResumeId 
      }), // only persist these fields
    }
  )
); 