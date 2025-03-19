import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateClientSidePDF, saveBlob } from '@/lib/pdf-utils';
import { generateDirectDownloadUrl } from '@/lib/utils';

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
  generatedClientSide?: boolean;
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
  
  // Client-side PDF generation
  generateClientPDF: (
    resumeId: string, 
    elementId: string, 
    filename?: string,
    options?: {
      scale?: number;
      quality?: number;
      format?: 'a4' | 'letter';
      orientation?: 'portrait' | 'landscape';
    }
  ) => Promise<Export | null>;
  
  // Download an export
  downloadExport: (exportId: string) => Promise<boolean>;
  
  // Get direct download URL
  getDirectDownloadUrl: (exportId: string) => Promise<string | null>;
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
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create export');
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
      
      // Client-side PDF generation
      generateClientPDF: async (
        resumeId: string, 
        elementId: string, 
        filename = 'resume.pdf',
        options = {}
      ) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create a new export record in the local state
          const newExport: Export = {
            id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            resumeId,
            format: 'pdf',
            status: 'processing',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            generatedClientSide: true
          };
          
          // Add the export to the store
          set(state => ({
            exports: [newExport, ...state.exports]
          }));
          
          // Generate the PDF
          const pdfBlob = await generateClientSidePDF(elementId, filename, options);
          
          // Save the PDF to the user's device
          saveBlob(pdfBlob, filename);
          
          // Update the export record
          const updatedExport: Export = {
            ...newExport,
            status: 'completed',
            updatedAt: new Date().toISOString()
          };
          
          // Update the export in the store
          set(state => ({
            exports: state.exports.map(e => e.id === newExport.id ? updatedExport : e),
            isLoading: false
          }));
          
          return updatedExport;
        } catch (error) {
          console.error('Error generating client-side PDF:', error);
          
          // Update the export record with error
          set(state => {
            const failedExport = state.exports.find(e => e.id.startsWith('client-') && e.resumeId === resumeId && e.status === 'processing');
            
            if (failedExport) {
              return {
                exports: state.exports.map(e => e.id === failedExport.id ? {
                  ...e,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  updatedAt: new Date().toISOString()
                } : e),
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
            
            return {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          });
          
          return null;
        }
      },
      
      // Download an export
      downloadExport: async (exportId: string) => {
        const exportItem = get().exports.find(e => e.id === exportId);
        
        if (!exportItem) {
          set({ error: 'Export not found' });
          return false;
        }
        
        try {
          // If it's a client-side generated PDF, we can't download it again
          if (exportItem.generatedClientSide) {
            set({ error: 'This export was generated client-side and is not available for download' });
            return false;
          }
          
          // For server-side generated PDFs, get the direct download URL and open it
          const directUrl = await get().getDirectDownloadUrl(exportId);
          
          if (directUrl) {
            window.open(directUrl, '_blank');
            return true;
          } else {
            set({ error: 'Failed to generate download URL' });
            return false;
          }
        } catch (error) {
          console.error('Error downloading export:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          });
          return false;
        }
      },
      
      // Get direct download URL
      getDirectDownloadUrl: async (exportId: string) => {
        const exportItem = get().exports.find(e => e.id === exportId);
        
        if (!exportItem) {
          set({ error: 'Export not found' });
          return null;
        }
        
        try {
          // If it's a client-side generated PDF, we can't get a direct URL
          if (exportItem.generatedClientSide) {
            set({ error: 'This export was generated client-side and does not have a direct URL' });
            return null;
          }
          
          // For server-side generated PDFs, generate a direct download URL with the share token
          if (exportItem.url) {
            const directUrl = await generateDirectDownloadUrl(exportItem.url, exportItem.resumeId);
            return directUrl;
          } else {
            set({ error: 'Export URL not available' });
            return null;
          }
        } catch (error) {
          console.error('Error generating direct download URL:', error);
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          });
          return null;
        }
      }
    }),
    {
      name: 'export-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ exports: state.exports }), // only persist exports
    }
  )
); 