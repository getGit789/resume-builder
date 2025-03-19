'use client';

import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(element: HTMLElement, filename: string = 'resume.pdf'): Promise<Blob> {
  try {
    console.log('Starting PDF generation process');
    
    // Ensure all fonts are loaded before generating PDF
    await document.fonts.ready;
    
    // Force a small delay to ensure fonts are fully applied
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a deep clone of the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Mark this as an exporting container
    clone.setAttribute('data-exporting', 'true');
    
    // Apply A4 dimensions and styling to the clone
    clone.style.width = '210mm';
    clone.style.height = 'auto';
    clone.style.boxSizing = 'border-box';
    clone.style.backgroundColor = 'white';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '0';
    clone.style.overflow = 'visible';
    
    // Make sure all child elements are styled properly
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      const element = el as HTMLElement;
      // Ensure text colors are preserved
      if (element.style.color === 'transparent' || element.style.color === 'rgba(0, 0, 0, 0)') {
        element.style.color = 'black';
      }
      // Ensure backgrounds are preserved
      if (element.style.backgroundColor === 'transparent' || element.style.backgroundColor === 'rgba(0, 0, 0, 0)') {
        element.style.backgroundColor = 'white';
      }
      // Fix any zero-width elements
      if (element.style.width === '0px' || element.style.width === '0') {
        element.style.width = 'auto';
      }
      // Fix any zero-height elements
      if (element.style.height === '0px' || element.style.height === '0') {
        element.style.height = 'auto';
      }
    });
    
    // Make sure all child padding is preserved exactly
    const innerDiv = clone.querySelector('div');
    if (innerDiv) {
      innerDiv.style.padding = '0';
    }
    
    // Apply print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @page { size: A4; margin: 0; }
      * { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
        color-adjust: exact !important;
        font-smooth: always;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      body { background: white !important; }
      .resume-section { page-break-inside: avoid; }
      .page-break-after { page-break-after: always; }
      .page-break-before { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      [data-exporting="true"] {
        box-shadow: none !important;
        border-radius: 0 !important;
        background-color: white !important;
      }
    `;
    clone.appendChild(style);
    
    // Create a special wrapper for the export
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '210mm';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.zIndex = '-1000';
    wrapper.appendChild(clone);
    
    // Temporarily append the wrapper to the document body
    document.body.appendChild(wrapper);
    
    console.log('Preparing for PDF rendering, element dimensions:', {
      width: clone.offsetWidth,
      height: clone.offsetHeight
    });
    
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling'], // Fix scaling issues
    });
    
    // Calculate the number of pages needed
    const pageHeight = 297; // A4 height in mm
    const cloneHeight = clone.offsetHeight;
    const scale = 210 / clone.offsetWidth; // Scale to fit A4 width
    const scaledHeight = cloneHeight * scale;
    const totalPages = Math.ceil(scaledHeight / pageHeight);
    
    console.log('PDF calculation:', { scaledHeight, totalPages });
    
    // Render each page separately
    for (let i = 0; i < totalPages; i++) {
      // Add a new page for all pages except the first one
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate the portion of the element to render for this page
      const pageTop = i * pageHeight / scale;
      const pageBottom = (i + 1) * pageHeight / scale;
      
      console.log(`Rendering page ${i + 1}/${totalPages}`);
      
      // Create a canvas for this page
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: clone.offsetWidth,
        height: Math.min(pageBottom - pageTop, cloneHeight - pageTop),
        y: pageTop,
        scrollY: -pageTop,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Apply extra styles to the cloned document
          const extraStyle = clonedDoc.createElement('style');
          extraStyle.textContent = `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              font-smooth: always;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            body { background: white !important; }
            p, h1, h2, h3, h4, h5, h6, span, div {
              color: black !important;
              font-family: inherit !important;
            }
          `;
          clonedDoc.head.appendChild(extraStyle);
          
          // Fix any SVG elements that might be causing issues
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.setAttribute('width', svg.getAttribute('width') || '24');
            svg.setAttribute('height', svg.getAttribute('height') || '24');
          });
        }
      });
      
      // Add the canvas to the PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    }
    
    // Remove the wrapper from the document
    document.body.removeChild(wrapper);
    
    console.log('PDF generation completed');
    
    // Convert to blob and return
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function generateDOCX(element: HTMLElement, filename: string = 'resume.docx'): Promise<Blob> {
  // Currently we're using the same PDF generation method for DOCX because it's more reliable
  // In a future update, we could implement proper DOCX generation using docx.js
  console.log('Starting DOCX generation (using PDF method)');
  try {
    // Use the same PDF generation, but change the file extension
    const pdfBlob = await generatePDF(element, filename.replace('.docx', '.pdf'));
    
    // For now, we're returning the PDF blob with a different extension
    // In a production environment, you would convert this to an actual DOCX file
    return pdfBlob;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
}

// Client-side PDF generation using html2canvas and jsPDF
export async function generateClientSidePDF(
  elementId: string,
  filename: string = 'resume.pdf',
  options: {
    scale?: number;
    quality?: number;
    format?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
  } = {}
): Promise<Blob> {
  // Default options
  const {
    scale = 2,
    quality = 1,
    format = 'a4',
    orientation = 'portrait',
  } = options;

  // Get the element to convert
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      onclone: (document) => {
        // Apply print-specific styles to the cloned document
        const style = document.createElement('style');
        style.innerHTML = `
          @page {
            size: ${format} ${orientation};
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .resume-section {
            page-break-inside: avoid;
          }
        `;
        document.head.appendChild(style);
      }
    });

    // Calculate PDF dimensions based on format
    let pdfWidth, pdfHeight;
    if (format === 'a4') {
      pdfWidth = orientation === 'portrait' ? 210 : 297;
      pdfHeight = orientation === 'portrait' ? 297 : 210;
    } else { // letter
      pdfWidth = orientation === 'portrait' ? 215.9 : 279.4;
      pdfHeight = orientation === 'portrait' ? 279.4 : 215.9;
    }

    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Calculate the ratio to fit the canvas into the PDF
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Calculate scaling to fit the canvas into the PDF
    const pdfRatio = pdfWidth / pdfHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let imgWidth, imgHeight;
    
    if (canvasRatio >= pdfRatio) {
      // Canvas is wider than PDF
      imgWidth = pdfWidth;
      imgHeight = canvasHeight * (pdfWidth / canvasWidth);
    } else {
      // Canvas is taller than PDF
      imgHeight = pdfHeight;
      imgWidth = canvasWidth * (pdfHeight / canvasHeight);
    }
    
    // Center the image on the page
    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
    
    // Return the PDF as a blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Add a type declaration for IE/Edge msSaveOrOpenBlob
interface IENavigator extends Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

// Function to save a blob as a file
export function saveBlob(blob: Blob, filename: string): void {
  console.log(`Saving blob as ${filename}, size: ${blob.size} bytes, type: ${blob.type}`);
  
  try {
    // Create an object URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add the link to the document
    document.body.appendChild(link);
    
    // Click the link to start the download
    link.click();
    
    // Remove the link from the document
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log(`Download initiated for ${filename}`);
    }, 100);
  } catch (error) {
    console.error('Error saving blob:', error);
    
    // Fallback method if the main method fails
    try {
      // Alternate method using window.navigator.msSaveBlob for IE/Edge
      const ieNavigator = window.navigator as IENavigator;
      if (ieNavigator.msSaveOrOpenBlob) {
        ieNavigator.msSaveOrOpenBlob(blob, filename);
        console.log(`Download initiated using msSaveOrOpenBlob for ${filename}`);
        return;
      }
      
      // Another fallback using data URL (less efficient but more compatible)
      const reader = new FileReader();
      reader.onload = function() {
        const dataUrl = reader.result as string;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`Download initiated using data URL for ${filename}`);
      };
      reader.readAsDataURL(blob);
    } catch (fallbackError) {
      console.error('Fallback download method also failed:', fallbackError);
      throw new Error('Failed to download file. Please try again or check your browser settings.');
    }
  }
}