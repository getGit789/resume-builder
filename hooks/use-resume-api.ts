import { useState } from 'react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
    summary?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    highlights?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    url?: string;
    highlights?: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency?: string;
  }>;
  settings?: {
    font?: string;
  };
}

interface Resume {
  id: string;
  name: string;
  data: ResumeData;
  template: string;
  colorTheme: string;
  createdAt: string;
  updatedAt: string;
}

interface Export {
  id: string;
  resumeId: string;
  format: 'pdf' | 'docx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useResumeApi() {
  const [resumesResponse, setResumesResponse] = useState<ApiResponse<Resume[]>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const [resumeResponse, setResumeResponse] = useState<ApiResponse<Resume>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const [exportsResponse, setExportsResponse] = useState<ApiResponse<Export[]>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const [exportResponse, setExportResponse] = useState<ApiResponse<Export>>({
    data: null,
    loading: false,
    error: null,
  });
  
  // Fetch all resumes
  const fetchResumes = async () => {
    setResumesResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch('/api/resumes');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setResumesResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setResumesResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Fetch a single resume
  const fetchResume = async (id: string) => {
    setResumeResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setResumeResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setResumeResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Create a new resume
  const createResume = async (name: string, data: ResumeData, template?: string, colorTheme?: string) => {
    setResumeResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, data, template, colorTheme }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const responseData = await response.json();
      setResumeResponse({ data: responseData, loading: false, error: null });
      return responseData;
    } catch (error: any) {
      setResumeResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Update an existing resume
  const updateResume = async (id: string, updates: Partial<Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setResumeResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setResumeResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setResumeResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Delete a resume
  const deleteResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return true;
    } catch (error: any) {
      return false;
    }
  };
  
  // Fetch all exports
  const fetchExports = async () => {
    setExportsResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch('/api/exports');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setExportsResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setExportsResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Fetch a single export
  const fetchExport = async (id: string) => {
    setExportResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch(`/api/exports/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setExportResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setExportResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Create a new export
  const createExport = async (resumeId: string, format: 'pdf' | 'docx') => {
    setExportResponse({ data: null, loading: true, error: null });
    try {
      const response = await fetch('/api/exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeId, format }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setExportResponse({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setExportResponse({ data: null, loading: false, error: error.message });
      return null;
    }
  };
  
  // Delete an export
  const deleteExport = async (id: string) => {
    try {
      const response = await fetch(`/api/exports/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return true;
    } catch (error: any) {
      return false;
    }
  };
  
  return {
    // Resume state
    resumesResponse,
    resumeResponse,
    
    // Export state
    exportsResponse,
    exportResponse,
    
    // Resume methods
    fetchResumes,
    fetchResume,
    createResume,
    updateResume,
    deleteResume,
    
    // Export methods
    fetchExports,
    fetchExport,
    createExport,
    deleteExport,
  };
} 