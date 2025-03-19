"use client"

import { ProfessionalTemplate } from "@/components/templates/professional"
import { MinimalistTemplate } from "@/components/templates/minimalist"
import { ColorTheme, ResumeData } from "@/types"
import { useEffect, useState, useRef } from "react"

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: string;
  colorTheme?: ColorTheme;
  font?: string;
  isExport?: boolean;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export function ResumePreview({ 
  resumeData, 
  template, 
  colorTheme = "blue",
  font = "Inter",
  isExport = false,
  previewRef
}: ResumePreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const internalRef = useRef<HTMLDivElement>(null);
  
  // Use the provided ref or the internal one
  const resolvedRef = previewRef || internalRef;

  useEffect(() => {
    console.log('ResumePreview mounted with props:', { 
      template, colorTheme, font, isExport,
      resumeDataSample: resumeData ? JSON.stringify(resumeData).substring(0, 100) + '...' : 'null'
    });
    
    try {
      // Validate resume data
      if (!resumeData || !resumeData.personalInfo) {
        console.error('Invalid resume data:', resumeData);
        setError('Invalid resume data structure');
        return;
      }
      
      // Force a repaint to ensure styles are applied
      if (resolvedRef.current) {
        resolvedRef.current.style.visibility = 'hidden';
        resolvedRef.current.offsetHeight; // Force reflow
        resolvedRef.current.style.visibility = 'visible';
      }
      
      setIsLoaded(true);
    } catch (err) {
      console.error('Error in ResumePreview:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [resumeData, template, colorTheme, font, isExport, resolvedRef]);

  // Add export-specific styles when in export mode or when data-exporting attribute is present
  useEffect(() => {
    // Check if we're in export mode or if the parent has data-exporting attribute
    const isExporting = isExport || resolvedRef.current?.hasAttribute('data-exporting');
    
    if (isExporting) {
      console.log('Applying export-specific styles');
      // Add export-specific styles
      const style = document.createElement("style");
      style.id = "resume-export-styles";
      style.textContent = `
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .resume-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-export-page {
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        .pdf-export-container {
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #resume-preview, [data-exporting="true"] {
          margin: 0 !important;
          padding: 0 !important;
          max-height: none !important;
          overflow: visible !important;
          height: auto !important;
          transform: none !important;
          background: white !important;
        }
        
        /* Improve print layout */
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          
          #resume-preview, [data-exporting="true"] {
            height: auto !important;
            overflow: visible !important;
            transform: none !important;
          }
        }
      `;
      
      // Remove any existing export styles
      const existingStyle = document.getElementById("resume-export-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, [isExport, resolvedRef]);

  // Also add a watcher for the data-exporting attribute
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'data-exporting') {
          console.log('Export attribute changed, refreshing styles');
          // Force a repaint to ensure styles are applied
          if (resolvedRef.current) {
            resolvedRef.current.style.visibility = 'hidden';
            resolvedRef.current.offsetHeight; // Force reflow
            resolvedRef.current.style.visibility = 'visible';
          }
        }
      }
    });
    
    if (resolvedRef.current) {
      observer.observe(resolvedRef.current, { attributes: true });
    }
    
    return () => {
      observer.disconnect();
    };
  }, [resolvedRef]);

  const renderTemplate = () => {
    if (error) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500">Error rendering resume</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      );
    }
    
    if (!isLoaded) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-600">Loading resume template...</p>
        </div>
      );
    }
    
    console.log(`Rendering template: ${template}`);
    
    try {
      switch (template) {
        case "professional":
          return <ProfessionalTemplate data={resumeData} colorTheme={colorTheme} font={font} />;
        case "minimalist":
          return <MinimalistTemplate data={resumeData} colorTheme={colorTheme} font={font} />;
        default:
          return <ProfessionalTemplate data={resumeData} colorTheme={colorTheme} font={font} />;
      }
    } catch (err) {
      console.error('Error rendering template:', err);
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500">Error rendering template</h2>
          <p className="mt-2 text-gray-600">{err instanceof Error ? err.message : 'Unknown error'}</p>
        </div>
      );
    }
  };

  return (
    <div 
      id="resume-preview" 
      ref={resolvedRef}
      className={`bg-white ${isExport ? 'pdf-export-preview' : 'shadow-lg rounded-lg'} overflow-visible mx-auto`}
      style={{
        width: '100%',
        maxWidth: isExport ? 'none' : '800px',
        transformOrigin: 'top left',
        padding: isExport ? '0' : undefined,
        margin: isExport ? '0' : undefined,
        backgroundColor: 'white',
      }}
      data-loaded={isLoaded}
      data-template={template}
      data-export={isExport}
    >
      <div 
        className={isExport ? 'p-0' : 'p-6'} 
        style={{
          backgroundColor: 'white',
          color: 'black',
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}

