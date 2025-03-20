/**
 * DOCX Export Utility
 * This module provides a client-side function to export HTML content to DOCX
 * via an API call, avoiding direct use of Node.js modules in the browser.
 */

interface DocxExportOptions {
  font?: string;
  title?: string;
  fileName?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Exports HTML content to a DOCX file using the server API
 */
export async function exportHtmlToDocx(
  html: string,
  options: DocxExportOptions = {}
): Promise<Blob> {
  try {
    const response = await fetch('/api/export/docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        options: {
          font: options.font || 'Calibri',
          title: options.title || 'Resume',
          fileName: options.fileName || 'resume',
          margins: options.margins || {
            top: 1440, // 1 inch in twips
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      }),
    });

    if (!response.ok) {
      // Try to parse error details from response
      try {
        const errorData = await response.json();
        if (errorData.error) {
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}` 
            : errorData.error;
          throw new Error(errorMessage);
        }
      } catch (parseError) {
        // If we can't parse JSON, use the status text
        throw new Error(`DOCX generation failed (${response.status}): ${response.statusText}`);
      }
      throw new Error('DOCX generation failed');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error in exportHtmlToDocx:', error);
    throw error; // Rethrow to allow handling by the caller
  }
}

/**
 * Saves a blob as a file with the given filename
 */
export function saveDocxBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
} 