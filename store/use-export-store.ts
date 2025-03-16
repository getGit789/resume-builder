import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the Export type
export interface Export {
  id: string;
  resumeId: string;
  format: 'pdf' | 'docx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the store state
interface ExportState {
  // Data
  exports: Export[];
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExports: () => Promise<void>;
  fetchExport: (id: string) => Promise<Export | null>;
  createExport: (resumeId: string, format: 'pdf' | 'docx') => Promise<Export | null>;
  deleteExport: (id: string) => Promise<boolean>;
  clearError: () => void;
}

// Create the store
export const useExportStore = create<ExportState>()(
  persist(
    (set, get) => ({
      // Initial state
      exports: [],
      isLoading: false,
      error: null,
      
      // Actions
      fetchExports: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/exports');
          
          if (!response.ok) {
            throw new Error('Failed to fetch exports');
          }
          
          const exports = await response.json();
          set({ exports, isLoading: false });
        } catch (error) {
          console.error('Error fetching exports:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      fetchExport: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/exports/${id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch export');
          }
          
          const exportData = await response.json();
          
          // Update the export in the store if it exists
          set(state => ({
            exports: state.exports.map(e => e.id === id ? exportData : e),
            isLoading: false
          }));
          
          return exportData;
        } catch (error) {
          console.error(`Error fetching export ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return null;
        }
      },
      
      createExport: async (resumeId: string, format: 'pdf' | 'docx') => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/exports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resumeId, format }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create export');
          }
          
          const newExport = await response.json();
          
          // Add the new export to the store
          set(state => ({
            exports: [newExport, ...state.exports],
            isLoading: false
          }));
          
          return newExport;
        } catch (error) {
          console.error('Error creating export:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return null;
        }
      },
      
      deleteExport: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/exports/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete export');
          }
          
          // Remove the export from the store
          set(state => ({
            exports: state.exports.filter(e => e.id !== id),
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          console.error(`Error deleting export ${id}:`, error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return false;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'export-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ exports: state.exports }), // only persist exports
    }
  )
); 