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
          if (node.format & 8) text = `${text}<br/>`;
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

interface MinimalistTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

export function MinimalistTemplate({ 
  data, 
  colorTheme = "gray",
  font = "'Calibri', 'Segoe UI', sans-serif"
}: MinimalistTemplateProps) {
  const randomId = useId().replace(/:/g, "");
  const themeColor = getThemeColor(colorTheme);

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
      <style>
        {`
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

          .${randomId} .minimal-header {
            margin-bottom: 30pt;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .${randomId} .minimal-name {
            font-size: 20pt;
            font-weight: 400;
            color: #000;
            margin: 0;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .${randomId} .minimal-title {
            font-size: 11pt;
            color: #666;
            margin: 5pt 0 15pt;
            font-weight: 400;
            letter-spacing: 0.05em;
          }

          .${randomId} .minimal-contact {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5pt;
            font-size: 9pt;
            color: #666;
          }

          .${randomId} .minimal-contact-item {
            white-space: nowrap;
          }

          .${randomId} .minimal-contact a {
            color: ${themeColor};
            text-decoration: none;
          }

          .${randomId} .minimal-divider {
            width: 25pt;
            height: 1pt;
            background-color: ${themeColor};
            margin: 10pt 0 25pt 0;
          }

          .${randomId} .minimal-section {
            margin: 25pt 0;
            break-inside: avoid;
          }

          .${randomId} .minimal-section-title {
            font-size: 11pt;
            font-weight: 500;
            color: ${themeColor};
            margin: 0 0 15pt;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-align: left;
          }

          .${randomId} .minimal-section-item {
            margin: 20pt 0;
            break-inside: avoid;
          }

          .${randomId} .minimal-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6pt;
          }

          .${randomId} .minimal-item-title {
            font-size: 11pt;
            font-weight: 500;
            color: #000;
            margin: 0;
            text-align: left;
          }

          .${randomId} .minimal-item-date {
            font-size: 9pt;
            color: #777;
            white-space: nowrap;
            margin-left: 8pt;
            text-align: right;
          }

          .${randomId} .minimal-item-subtitle {
            font-size: 10pt;
            color: #555;
            margin: 5pt 0;
            font-style: italic;
            text-align: left;
          }

          .${randomId} .minimal-rich-text {
            font-size: 10pt;
            color: #555;
            line-height: 1.6;
            text-align: left;
          }

          .${randomId} .minimal-rich-text p {
            margin: 5pt 0;
            text-align: left;
          }

          .${randomId} .minimal-rich-text ul {
            margin: 5pt 0;
            padding-left: 12pt;
            list-style-type: disc !important;
          }

          .${randomId} .minimal-rich-text ul li {
            margin: 3pt 0;
            display: list-item !important;
            list-style-type: disc !important;
          }

          .${randomId} .minimal-rich-text ol {
            margin: 5pt 0;
            padding-left: 15pt;
            list-style-type: decimal !important;
          }

          .${randomId} .minimal-rich-text ol li {
            margin: 3pt 0;
            display: list-item !important;
            list-style-type: decimal !important;
          }

          .${randomId} .minimal-rich-text a {
            color: ${themeColor};
            text-decoration: none;
            border-bottom: 1px dotted ${themeColor};
          }

          .${randomId} .minimal-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10pt;
            justify-content: flex-start;
          }

          .${randomId} .minimal-skill-tag {
            padding: 4pt 10pt;
            background-color: #f5f5f5;
            border-radius: 3pt;
            font-size: 9pt;
            color: #555;
          }

          .${randomId} .minimal-summary {
            font-size: 10pt;
            color: #555;
            line-height: 1.6;
            margin-bottom: 25pt;
            text-align: left;
          }

          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            .${randomId} {
              margin: 0;
              width: 210mm;
              height: 297mm;
            }

            .${randomId} .minimal-section-title {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .minimal-divider {
              background-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .minimal-contact a, 
            .${randomId} .minimal-rich-text a {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .minimal-rich-text ul li {
              display: list-item !important;
              list-style-type: disc !important;
            }

            .${randomId} .minimal-rich-text ol li {
              display: list-item !important;
              list-style-type: decimal !important;
            }
          }
        `}
      </style>

      <div className="minimal-header">
        <h1 className="minimal-name">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
        
        {data.personalInfo.title && (
          <div className="minimal-title">{data.personalInfo.title}</div>
        )}
        
        <div className="minimal-contact">
          {data.personalInfo.email && (
            <div className="minimal-contact-item">{data.personalInfo.email}</div>
          )}
          
          {data.personalInfo.phone && (
            <div className="minimal-contact-item">{data.personalInfo.phone}</div>
          )}
          
          {data.personalInfo.location && (
            <div className="minimal-contact-item">{data.personalInfo.location}</div>
          )}
          
          {data.personalInfo.links?.map((link) => (
            <div key={link.id} className="minimal-contact-item">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="minimal-divider"></div>

      {data.personalInfo.summary && (
        <div className="minimal-summary" dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.personalInfo.summary) }}></div>
      )}

      {data.sections.map((section) => (
        <div key={section.id} className="minimal-section">
          <h2 className="minimal-section-title">{section.title}</h2>
          
          {/* Handle Skills sections differently */}
          {(section.title.toLowerCase().includes('skill') || 
            section.title.toLowerCase().includes('competenc')) ? (
            <div className="minimal-skills">
              {section.items.map((item) => (
                <div key={item.id} className="minimal-skill-tag">
                  {item.title}
                </div>
              ))}
            </div>
          ) : (
            // Regular sections
            section.items.map((item) => (
              <div key={item.id} className="minimal-section-item">
                <div className="minimal-item-header">
                  <h3 className="minimal-item-title">{item.title}</h3>
                  {item.date && <div className="minimal-item-date">{item.date}</div>}
                </div>
                
                {item.subtitle && (
                  <div className="minimal-item-subtitle">{item.subtitle}</div>
                )}
                
                {item.description && (
                  <div 
                    className="minimal-rich-text"
                    dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
} 