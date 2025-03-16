import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorTheme, ResumeData } from '@/types';

// Define the editor state
interface EditorState {
  // Current resume being edited
  resumeId: string | null;
  resumeData: ResumeData | null;
  resumeName: string;
  
  // Template and styling
  template: string;
  colorTheme: ColorTheme;
  font: string;
  
  // Editing state
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setResumeId: (id: string | null) => void;
  setResumeData: (data: ResumeData | null) => void;
  setResumeName: (name: string) => void;
  
  setTemplate: (template: string) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setFont: (font: string) => void;
  
  markAsDirty: () => void;
  markAsClean: () => void;
  
  startSaving: () => void;
  finishSaving: (success: boolean) => void;
  
  // Helper to update a specific part of the resume data
  updatePersonalInfo: <K extends keyof ResumeData['personalInfo']>(
    field: K, 
    value: ResumeData['personalInfo'][K]
  ) => void;
  
  updateSection: (
    sectionId: string, 
    field: 'title', 
    value: string
  ) => void;
  
  updateSectionItem: (
    sectionId: string, 
    itemId: string, 
    field: 'title' | 'subtitle' | 'date' | 'description', 
    value: string
  ) => void;
  
  addSection: (title: string) => void;
  removeSection: (sectionId: string) => void;
  
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  
  // Reset the editor state
  resetEditor: () => void;
}

// Default empty resume data
const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    links: [],
  },
  sections: [],
};

// Create the store
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      resumeId: null,
      resumeData: null,
      resumeName: 'Untitled Resume',
      
      template: 'professional',
      colorTheme: 'default',
      font: "'Inter', sans-serif",
      
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      
      // Actions
      setResumeId: (id: string | null) => {
        set({ resumeId: id });
      },
      
      setResumeData: (data: ResumeData | null) => {
        set({ 
          resumeData: data,
          isDirty: false
        });
      },
      
      setResumeName: (name: string) => {
        set({ 
          resumeName: name,
          isDirty: true
        });
      },
      
      setTemplate: (template: string) => {
        set({ 
          template,
          isDirty: true
        });
      },
      
      setColorTheme: (theme: ColorTheme) => {
        set({ 
          colorTheme: theme,
          isDirty: true
        });
      },
      
      setFont: (font: string) => {
        set({ 
          font,
          isDirty: true
        });
      },
      
      markAsDirty: () => {
        set({ isDirty: true });
      },
      
      markAsClean: () => {
        set({ isDirty: false });
      },
      
      startSaving: () => {
        set({ isSaving: true });
      },
      
      finishSaving: (success: boolean) => {
        set({ 
          isSaving: false,
          isDirty: !success,
          lastSaved: success ? new Date() : get().lastSaved
        });
      },
      
      updatePersonalInfo: (field, value) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        set({
          resumeData: {
            ...resumeData,
            personalInfo: {
              ...resumeData.personalInfo,
              [field]: value
            }
          },
          isDirty: true
        });
      },
      
      updateSection: (sectionId, field, value) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        set({
          resumeData: {
            ...resumeData,
            sections: resumeData.sections.map(section => 
              section.id === sectionId 
                ? { ...section, [field]: value } 
                : section
            )
          },
          isDirty: true
        });
      },
      
      updateSectionItem: (sectionId, itemId, field, value) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        set({
          resumeData: {
            ...resumeData,
            sections: resumeData.sections.map(section => 
              section.id === sectionId 
                ? {
                    ...section,
                    items: section.items.map(item => 
                      item.id === itemId 
                        ? { ...item, [field]: value } 
                        : item
                    )
                  } 
                : section
            )
          },
          isDirty: true
        });
      },
      
      addSection: (title: string) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        const newSection = {
          id: `section-${Date.now()}`,
          title,
          items: []
        };
        
        set({
          resumeData: {
            ...resumeData,
            sections: [...resumeData.sections, newSection]
          },
          isDirty: true
        });
      },
      
      removeSection: (sectionId: string) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        set({
          resumeData: {
            ...resumeData,
            sections: resumeData.sections.filter(section => section.id !== sectionId)
          },
          isDirty: true
        });
      },
      
      addSectionItem: (sectionId: string) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        const newItem = {
          id: `item-${Date.now()}`,
          title: '',
          subtitle: '',
          date: '',
          description: ''
        };
        
        set({
          resumeData: {
            ...resumeData,
            sections: resumeData.sections.map(section => 
              section.id === sectionId 
                ? {
                    ...section,
                    items: [...section.items, newItem]
                  } 
                : section
            )
          },
          isDirty: true
        });
      },
      
      removeSectionItem: (sectionId: string, itemId: string) => {
        const { resumeData } = get();
        if (!resumeData) return;
        
        set({
          resumeData: {
            ...resumeData,
            sections: resumeData.sections.map(section => 
              section.id === sectionId 
                ? {
                    ...section,
                    items: section.items.filter(item => item.id !== itemId)
                  } 
                : section
            )
          },
          isDirty: true
        });
      },
      
      resetEditor: () => {
        set({
          resumeId: null,
          resumeData: defaultResumeData,
          resumeName: 'Untitled Resume',
          template: 'professional',
          colorTheme: 'default',
          font: "'Inter', sans-serif",
          isDirty: false,
          isSaving: false,
          lastSaved: null
        });
      },
    }),
    {
      name: 'editor-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        resumeId: state.resumeId,
        resumeData: state.resumeData,
        resumeName: state.resumeName,
        template: state.template,
        colorTheme: state.colorTheme,
        font: state.font,
        lastSaved: state.lastSaved
      }), // only persist these fields
    }
  )
); 