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

// Helper to check if client-side code
const isClient = typeof window !== 'undefined';

// Helper to get a cookie value
function getCookieValue(name: string): string | null {
  if (!isClient) return null;
  const matches = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return matches ? matches.pop() || null : null;
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
    (set, get) => {
      // Check for existing guest mode on initialization
      const existingGuestMode = isClient ? getCookieValue('guestMode') === 'true' : false;
      const existingGuestToken = isClient ? getCookieValue('guestToken') : null;
      
      return {
        // Initial state
        resumes: [],
        selectedResumeId: null,
        guestMode: existingGuestMode,
        guestToken: existingGuestToken,
        isLoading: false,
        error: null,
        
        // Actions
        fetchResumes: async () => {
          set({ isLoading: true, error: null });
          try {
            // If we're already in guest mode, include the guest token in request headers
            const headers: HeadersInit = {};
            if (get().guestMode && get().guestToken) {
              headers['X-Guest-Token'] = get().guestToken || '';
            }
            
            console.log('Fetching resumes, guest mode:', get().guestMode);
            
            const response = await fetch('/api/resumes', {
              credentials: 'include',
              headers
            });
            
            if (!response.ok) {
              console.log(`Failed to fetch resumes with status: ${response.status}`);
              
              if (response.status === 401) {
                // If unauthorized and not in guest mode, enable guest mode
                if (!get().guestMode) {
                  console.log('Switching to guest mode due to auth failure');
                  const guestToken = `guest-${Date.now()}`;
                  document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
                  document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
                  set({ guestMode: true, guestToken });
                  
                  // Retry the fetch with guest mode
                  return get().fetchResumes();
                } else {
                  // If already in guest mode but still unauthorized, try refreshing the token
                  console.log('Already in guest mode but still unauthorized, refreshing token');
                  const newGuestToken = `guest-${Date.now()}`;
                  document.cookie = `guestToken=${newGuestToken}; path=/; max-age=2592000`;
                  set({ guestToken: newGuestToken });
                  
                  // Return empty resumes for now, next fetch will use new token
                  set({ resumes: [], isLoading: false });
                  return;
                }
              }
              
              throw new Error('Failed to fetch resumes');
            }
            
            const resumes = await response.json();
            console.log(`Successfully fetched ${resumes.length} resumes`);
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
            // Include the guest token in headers if in guest mode
            const headers: HeadersInit = {};
            if (get().guestMode && get().guestToken) {
              headers['X-Guest-Token'] = get().guestToken || '';
            }
            
            console.log(`Fetching resume ${id}, guest mode:`, get().guestMode);
            
            const response = await fetch(`/api/resumes/${id}`, {
              credentials: 'include',
              headers
            });
            
            if (!response.ok) {
              console.log(`Failed to fetch resume with status: ${response.status}`);
              
              if (response.status === 401) {
                // If unauthorized and not in guest mode, enable guest mode
                if (!get().guestMode) {
                  console.log('Switching to guest mode due to auth failure');
                  const guestToken = `guest-${Date.now()}`;
                  document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
                  document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
                  set({ guestMode: true, guestToken });
                  // Retry the fetch with guest mode
                  return get().fetchResume(id);
                } else {
                  // If already in guest mode but still unauthorized, try refreshing the token
                  console.log('Already in guest mode but still unauthorized, refreshing token');
                  const newGuestToken = `guest-${Date.now()}`;
                  document.cookie = `guestToken=${newGuestToken}; path=/; max-age=2592000`;
                  set({ guestToken: newGuestToken });
                  
                  // Retry with the new token
                  return get().fetchResume(id);
                }
              }
              
              throw new Error('Failed to fetch resume');
            }
            
            const resume = await response.json();
            console.log(`Successfully fetched resume ${id}`);
            
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
            // Ensure guest mode is active if not logged in
            if (!get().guestMode) {
              const guestToken = `guest-${Date.now()}`;
              document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
              document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
              set({ guestMode: true, guestToken });
              console.log('Enabling guest mode before resume creation');
            }
            
            // If we're in guest mode but don't have a token, generate one
            if (get().guestMode && !get().guestToken) {
              const guestToken = `guest-${Date.now()}`;
              document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
              document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
              set({ guestToken });
              console.log('Generated new guest token:', guestToken);
            }

            console.log(`Attempting to create resume "${name}" with template "${template}"`);
            console.log('Guest mode:', get().guestMode, 'Guest token:', get().guestToken);
            
            // Include guest token in headers as well for better compatibility
            const headers: HeadersInit = {
              'Content-Type': 'application/json'
            };
            
            if (get().guestMode && get().guestToken) {
              headers['X-Guest-Token'] = get().guestToken || '';
            }
            
            const response = await fetch('/api/resumes', {
              method: 'POST',
              credentials: 'include',
              headers,
              body: JSON.stringify({ 
                name, 
                data, 
                template, 
                colorTheme,
                // Include guestToken in the request body if in guest mode
                ...(get().guestMode ? { guestToken: get().guestToken } : {})
              }),
            });
            
            if (!response.ok) {
              // Get the error details from the response if available
              let errorDetails = '';
              try {
                const errorData = await response.json();
                errorDetails = errorData.details || errorData.error || '';
              } catch (e) {
                // If we can't parse the response, just use the status text
                errorDetails = response.statusText;
              }
              
              console.error(`Resume creation failed with status ${response.status}: ${errorDetails}`);
              
              // Handle auth errors
              if (response.status === 401) {
                console.log('Unauthorized, refreshing guest mode');
                const newGuestToken = `guest-${Date.now()}`;
                document.cookie = `guestMode=true; path=/; max-age=2592000`;
                document.cookie = `guestToken=${newGuestToken}; path=/; max-age=2592000`;
                set({ guestMode: true, guestToken: newGuestToken });
                
                // Retry with the new token
                return get().createResume(name, data, template, colorTheme);
              }
              
              throw new Error(`Failed to create resume: ${errorDetails}`);
            }
            
            const newResume = await response.json();
            console.log('Resume created successfully:', newResume.id);
            
            // Add the new resume to the store
            set(state => ({
              resumes: [newResume, ...state.resumes],
              isLoading: false,
              selectedResumeId: newResume.id // Set the newly created resume as selected
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
            // Include the guest token in headers if in guest mode
            const headers: HeadersInit = {
              'Content-Type': 'application/json'
            };
            
            if (get().guestMode && get().guestToken) {
              headers['X-Guest-Token'] = get().guestToken || '';
            }
            
            console.log(`Updating resume ${id}, guest mode:`, get().guestMode);
            
            const response = await fetch(`/api/resumes/${id}`, {
              method: 'PUT',
              credentials: 'include',
              headers,
              body: JSON.stringify({
                ...updates,
                // Include guestToken in the request body if in guest mode
                ...(get().guestMode ? { guestToken: get().guestToken } : {})
              }),
            });
            
            if (!response.ok) {
              console.log(`Failed to update resume with status: ${response.status}`);
              
              // Get error details
              let errorDetails = '';
              try {
                const errorData = await response.json();
                errorDetails = errorData.details || errorData.error || '';
              } catch (e) {
                // If we can't parse the response, just use the status text
                errorDetails = response.statusText;
              }
              
              if (response.status === 401) {
                // If unauthorized and not in guest mode, enable guest mode
                if (!get().guestMode) {
                  console.log('Switching to guest mode due to auth failure');
                  const guestToken = `guest-${Date.now()}`;
                  document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
                  document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
                  set({ guestMode: true, guestToken });
                  return get().updateResume(id, updates);
                } else {
                  // If already in guest mode but still unauthorized, try refreshing the token
                  console.log('Already in guest mode but still unauthorized, refreshing token');
                  const newGuestToken = `guest-${Date.now()}`;
                  document.cookie = `guestToken=${newGuestToken}; path=/; max-age=2592000`;
                  set({ guestToken: newGuestToken });
                  
                  // Retry with the new token
                  return get().updateResume(id, updates);
                }
              }
              
              throw new Error(`Failed to update resume: ${errorDetails}`);
            }
            
            const updatedResume = await response.json();
            console.log(`Successfully updated resume ${id}`);
            
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
            document.cookie = `guestMode=true; path=/; max-age=2592000`; // 30 days
            document.cookie = `guestToken=${guestToken}; path=/; max-age=2592000`;
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
      };
    },
    {
      name: 'resume-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        resumes: state.resumes,
        selectedResumeId: state.selectedResumeId,
        guestMode: state.guestMode,
        guestToken: state.guestToken
      }), // persist these fields
    }
  )
); 