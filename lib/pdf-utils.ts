'use client';

import html2pdf from 'html2pdf.js';

export async function generatePDF(element: HTMLElement, filename: string = 'resume.pdf'): Promise<Blob> {
  // Configure html2pdf options with CORS handling
  const options = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,  // Enable CORS for images
      allowTaint: true, // Allow tainted canvas
      logging: true, // Enable logging for debugging
      letterRendering: true,
      foreignObjectRendering: false, // Disable foreignObject which can cause CORS issues
      removeContainer: true, // Remove the cloned container after rendering
      imageTimeout: 0, // No timeout for images
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as 'portrait' | 'landscape'
    }
  };

  try {
    // Ensure all fonts are loaded before generating PDF
    await document.fonts.ready;
    
    // Force a small delay to ensure fonts are fully applied
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create a deep clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply inline styles for fonts to ensure they're captured in the PDF
    const styles = window.getComputedStyle(element);
    clone.style.fontFamily = styles.fontFamily;
    clone.style.fontSize = styles.fontSize;
    clone.style.fontWeight = styles.fontWeight;
    
    // Generate PDF from the clone
    const pdf = await html2pdf().from(clone).set(options).output('blob');
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function generateDOCX(element: HTMLElement, filename: string = 'resume.docx'): Promise<Blob> {
  // For now, this is a placeholder that returns a PDF
  // In a real implementation, you would use a library like docx.js
  return generatePDF(element, filename);
} 