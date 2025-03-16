import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorTheme } from '@/types';

// Define the UI state
interface UIState {
  // Dialog states
  isDeleteDialogOpen: boolean;
  isExportDialogOpen: boolean;
  isShareDialogOpen: boolean;
  
  // Current selections
  currentResumeId: string | null;
  currentExportId: string | null;
  
  // User preferences
  preferredTemplate: string;
  preferredColorTheme: ColorTheme;
  preferredFont: string;
  
  // Actions
  openDeleteDialog: (resumeId: string) => void;
  closeDeleteDialog: () => void;
  
  openExportDialog: (resumeId: string) => void;
  closeExportDialog: () => void;
  
  openShareDialog: (resumeId: string) => void;
  closeShareDialog: () => void;
  
  setPreferredTemplate: (template: string) => void;
  setPreferredColorTheme: (theme: ColorTheme) => void;
  setPreferredFont: (font: string) => void;
}

// Create the store
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isDeleteDialogOpen: false,
      isExportDialogOpen: false,
      isShareDialogOpen: false,
      
      currentResumeId: null,
      currentExportId: null,
      
      preferredTemplate: 'professional',
      preferredColorTheme: 'default',
      preferredFont: "'Inter', sans-serif",
      
      // Actions
      openDeleteDialog: (resumeId: string) => {
        set({ 
          isDeleteDialogOpen: true,
          currentResumeId: resumeId
        });
      },
      
      closeDeleteDialog: () => {
        set({ 
          isDeleteDialogOpen: false,
          currentResumeId: null
        });
      },
      
      openExportDialog: (resumeId: string) => {
        set({ 
          isExportDialogOpen: true,
          currentResumeId: resumeId
        });
      },
      
      closeExportDialog: () => {
        set({ 
          isExportDialogOpen: false,
          currentResumeId: null
        });
      },
      
      openShareDialog: (resumeId: string) => {
        set({ 
          isShareDialogOpen: true,
          currentResumeId: resumeId
        });
      },
      
      closeShareDialog: () => {
        set({ 
          isShareDialogOpen: false,
          currentResumeId: null
        });
      },
      
      setPreferredTemplate: (template: string) => {
        set({ preferredTemplate: template });
      },
      
      setPreferredColorTheme: (theme: ColorTheme) => {
        set({ preferredColorTheme: theme });
      },
      
      setPreferredFont: (font: string) => {
        set({ preferredFont: font });
      },
    }),
    {
      name: 'ui-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        preferredTemplate: state.preferredTemplate,
        preferredColorTheme: state.preferredColorTheme,
        preferredFont: state.preferredFont
      }), // only persist preferences
    }
  )
); 