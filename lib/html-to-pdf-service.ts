'use client';

/**
 * HTML to PDF Service - Client Interface
 * 
 * This service handles communication with the external HTML to PDF conversion service
 * via our server-side API proxy to avoid exposing the service directly to the client.
 */

// Service configuration
const PDF_EXPORT_API_URL = '/api/export/pdf';

// Types
interface ConversionOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number;
  preferCssPageSize?: boolean;
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  timeout?: number;
}

interface ConversionResponse {
  success: boolean;
  pdfUrl?: string;
  pdfBlob?: Blob;
  error?: string;
}

/**
 * Converts HTML string to PDF using the server-side API proxy
 */
export async function convertHtmlToPdf(
  html: string,
  options: ConversionOptions = {}
): Promise<ConversionResponse> {
  try {
    console.log('Starting HTML to PDF conversion via server API');

    const response = await fetch(PDF_EXPORT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        options: {
          format: options.format || 'A4',
          orientation: options.orientation || 'portrait',
          margin: options.margin || {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          scale: options.scale || 1,
          preferCssPageSize: options.preferCssPageSize !== undefined ? options.preferCssPageSize : true,
          printBackground: options.printBackground !== undefined ? options.printBackground : true,
          displayHeaderFooter: options.displayHeaderFooter || false,
          headerTemplate: options.headerTemplate || '',
          footerTemplate: options.footerTemplate || '',
          timeout: options.timeout || 30000,
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = 'PDF conversion failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `Service error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Get the PDF as blob directly from the response
    const pdfBlob = await response.blob();
    
    return {
      success: true,
      pdfBlob,
    };
  } catch (error) {
    console.error('HTML to PDF conversion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    };
  }
}

/**
 * Converts a DOM element to PDF using the external conversion service
 * This is an alternative to the generatePDF function in pdf-utils.ts
 */
export async function convertElementToPdf(
  element: HTMLElement,
  options: ConversionOptions = {}
): Promise<ConversionResponse> {
  try {
    if (!element) {
      throw new Error("Element is null or undefined");
    }

    // Create a temporary container for the clone
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // Wait for fonts to load and force a repaint
    await document.fonts.ready;
    element.style.display = 'none';
    element.offsetHeight; // Force reflow
    element.style.display = '';

    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    container.appendChild(clone);

    // Process all elements in the clone to apply computed styles
    const processElement = (el: HTMLElement) => {
      try {
        const computed = window.getComputedStyle(el);
        const originalEl = element.querySelector(`[data-id="${el.getAttribute('data-id')}"]`) as HTMLElement;
        
        if (originalEl) {
          const originalComputed = window.getComputedStyle(originalEl);
          
          // Apply essential styles with !important
          const essentialStyles = [
            'font-family', 'font-size', 'font-weight', 'line-height',
            'color', 'background-color', 'padding', 'margin', 'border',
            'display', 'width', 'height', 'position', 'top', 'left',
            'right', 'bottom', 'flex', 'grid', 'gap', 'text-align'
          ];

          essentialStyles.forEach(style => {
            const value = originalComputed.getPropertyValue(style);
            if (value) {
              el.style.setProperty(style, value, 'important');
            }
          });
        }
      } catch (styleError) {
        console.warn('Error applying styles to element:', styleError);
      }
    };

    // Add unique identifiers to elements for style mapping
    let idCounter = 0;
    const addIds = (el: HTMLElement) => {
      el.setAttribute('data-id', `export-${idCounter++}`);
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          addIds(child);
        }
      });
    };

    addIds(element);
    addIds(clone);

    // Process all elements
    const elements = clone.getElementsByTagName('*');
    Array.from(elements).forEach(el => {
      if (el instanceof HTMLElement) {
        processElement(el);
      }
    });

    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: ${options.format || 'A4'} ${options.orientation || 'portrait'};
        margin: 0;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          width: auto !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    clone.insertBefore(style, clone.firstChild);

    // Convert to PDF
    const result = await convertHtmlToPdf(clone.outerHTML, options);

    // Cleanup
    document.body.removeChild(container);

    return result;
  } catch (error) {
    console.error('PDF conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during PDF conversion'
    };
  }
}

/**
 * Save a blob as a file download
 */
export function saveBlobAsFile(blob: Blob, filename: string): void {
  try {
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Add to the DOM briefly to enable the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to save blob as file:', error);
    throw error;
  }
} 