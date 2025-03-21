"use client"

import { ColorTheme, ResumeData, themeColors } from "@/types"
import { useId } from "react"

function getThemeColor(colorTheme: ColorTheme): string {
  return themeColors[colorTheme] || themeColors.default;
}

function lexicalToHtml(jsonString: string): string {
  try {
    const content = JSON.parse(jsonString);
    let html = '';

    function processNode(node: any): string {
      if (!node) return '';

      switch (node.type) {
        case 'text':
          let text = node.text;
          if (node.format & 1) text = `<strong>${text}</strong>`;
          if (node.format & 2) text = `<em>${text}</em>`;
          if (node.format & 4) text = `<u>${text}</u>`;
          if (node.format & 8) text = `<s>${text}</s>`;
          return text;
        case 'paragraph':
          return `<p>${node.children?.map(processNode).join('') || ''}</p>`;
        case 'list':
          const tag = node.tag || (node.listType === 'bullet' ? 'ul' : 'ol');
          return `<${tag}>${node.children?.map(processNode).join('') || ''}</${tag}>`;
        case 'listitem':
          return `<li>${node.children?.map(processNode).join('') || ''}</li>`;
        case 'link':
          return `<a href="${node.url}">${node.children?.map(processNode).join('') || ''}</a>`;
        default:
          return node.children?.map(processNode).join('') || '';
      }
    }

    html = processNode(content.root);
    return html;
  } catch (error) {
    console.error('Error converting Lexical JSON to HTML:', error);
    return jsonString; // Return the original string if parsing fails
  }
}

interface ExecutiveTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

export function ExecutiveTemplate({ 
  data, 
  colorTheme = "blue",
  font = "'Calibri', 'Segoe UI', sans-serif"
}: ExecutiveTemplateProps) {
  const randomId = useId().replace(/:/g, "");
  const themeColor = getThemeColor(colorTheme);
  const { personalInfo, sections } = data;
  
  // Adjust font weight and style based on font family
  let fontWeight = "normal";
  let letterSpacing = "normal";
  
  if (font.includes("Times New Roman") || font.includes("Georgia")) {
    letterSpacing = "0.01em";
  } else if (font.includes("Arial")) {
    letterSpacing = "0.02em";
  } else if (font.includes("Helvetica")) {
    letterSpacing = "0.03em";
  }

  return (
    <div className={randomId}>
      <div className="executive-resume" style={{ fontFamily: font }}>
        <div className="executive-header">
          {/* Three-column layout: name/occupation, contact info, links */}
          <div className="header-grid">
            {/* Left column: Name and occupation */}
            <div className="executive-name-container">
              <h1 className="executive-name">{personalInfo.firstName} {personalInfo.lastName}</h1>
              <h2 className="executive-title">{personalInfo.title}</h2>
            </div>
            
            {/* Middle column: Primary contact info */}
            <div className="contact-primary-col">
              {personalInfo.email && (
                <div className="contact-info-item">
                  <span className="contact-value">{personalInfo.email}</span>
                </div>
              )}
              
              {personalInfo.phone && (
                <div className="contact-info-item">
                  <span className="contact-value">{personalInfo.phone}</span>
                </div>
              )}
              
              {personalInfo.location && (
                <div className="contact-info-item">
                  <span className="contact-value">{personalInfo.location}</span>
                </div>
              )}
            </div>
            
            {/* Right column: Links */}
            <div className="contact-links-col">
              {personalInfo.links && personalInfo.links.map((link) => (
                <div className="contact-info-item" key={link.id}>
                  <a 
                    href={link.url} 
                    className="contact-value contact-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {link.title}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {personalInfo.summary && (
          <div className="executive-summary">
            <div 
              className="executive-rich-text"
              dangerouslySetInnerHTML={{ __html: lexicalToHtml(personalInfo.summary) }}
            />
          </div>
        )}
        
        <div className="executive-content">
          {sections.map((section) => (
            <div key={section.id} className="executive-section">
              <h3 className="executive-section-title">{section.title}</h3>
              {section.items.map((item) => (
                <div key={item.id} className="executive-section-item">
                  <div className="section-item-header">
                    <h3 className="section-item-title">{item.title}</h3>
                    {item.date && <span className="date">{item.date}</span>}
                  </div>
                  {item.subtitle && (
                    <div className="section-item-subtitle">
                      {item.subtitle}
                    </div>
                  )}
                  {item.description && (
                    <div className="executive-rich-text" dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .${randomId} {
          width: 210mm;
          min-height: 297mm;
          padding: 12.7mm;
          font-family: ${font};
          font-weight: ${fontWeight};
          letter-spacing: ${letterSpacing};
          color: #333;
          background: white;
          line-height: 1.3;
        }
        
        .executive-resume {
          width: 100%;
          max-width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          margin: 0 auto;
          background: white;
          color: #333;
          line-height: 1.5;
        }
        
        .executive-header {
          border-bottom: 1pt solid ${themeColor};
          padding-bottom: 10pt;
          margin-bottom: 15pt;
        }
        
        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10pt;
          align-items: flex-start;
        }
        
        .executive-name-container {
          margin-bottom: 0;
        }
        
        .executive-name {
          font-size: 20pt;
          font-weight: bold;
          margin: 0;
          color: ${themeColor};
        }
        
        .executive-title {
          font-size: 14pt;
          color: #666;
          margin: 5pt 0;
          font-weight: 500;
        }
        
        .contact-primary-col,
        .contact-links-col {
          display: flex;
          flex-direction: column;
          font-size: 10pt;
          color: #444;
        }
        
        .contact-info-item {
          margin-bottom: 4pt;
          white-space: nowrap;
          display: block;
        }
        
        .contact-value {
          text-align: left;
        }
        
        .contact-link {
          color: ${themeColor};
          text-decoration: none;
        }
        
        .executive-summary {
          margin-bottom: 15pt;
        }
        
        .executive-section {
          margin-bottom: 15pt;
        }
        
        .executive-section-title {
          color: ${themeColor};
          font-size: 14pt;
          font-weight: 600;
          margin: 0 0 8pt 0;
          border-bottom: 0.5pt solid #eee;
          padding-bottom: 4pt;
        }
        
        .executive-section-item {
          margin-bottom: 12pt;
        }
        
        .section-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4pt;
        }
        
        .section-item-title {
          font-weight: 600;
          font-size: 12pt;
          margin: 0;
        }
        
        .section-item-subtitle {
          font-style: italic;
          font-size: 10pt;
          margin-bottom: 4pt;
        }
        
        .date {
          font-size: 10pt;
          color: #666;
        }
        
        .executive-rich-text ul, 
        .executive-rich-text ol {
          margin: 0;
          padding: 0 0 0 16pt;
        }
        
        .executive-rich-text ul li,
        .executive-rich-text ol li {
          margin-bottom: 2pt;
          list-style-type: disc !important;
          display: list-item !important;
        }
        
        .executive-rich-text ol li {
          list-style-type: decimal !important;
        }
        
        @page {
          size: A4;
          margin: 12.7mm;
        }
        
        @media print {
          .executive-resume {
            padding: 0;
            margin: 0;
            box-shadow: none;
            width: 100%;
            min-height: 100%;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .executive-rich-text ul li {
            list-style-type: disc !important;
            display: list-item !important;
          }
          
          .executive-rich-text ol li {
            list-style-type: decimal !important;
            display: list-item !important;
          }
        }
      `}</style>
    </div>
  );
} 