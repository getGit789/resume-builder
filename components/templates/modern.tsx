"use client"

import { ColorTheme, ResumeData, themeColors } from "@/types"
import { useId } from "react"

function getThemeColor(colorTheme: ColorTheme): string {
  return themeColors[colorTheme] || themeColors.default;
}

function getSecondaryColor(colorTheme: ColorTheme): string {
  // Create a lighter version of the theme color for secondary elements
  const hexColor = getThemeColor(colorTheme).replace('#', '');
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Mix with white for a lighter shade
  const factor = 0.85;
  const rLight = Math.floor(r * factor + 255 * (1 - factor));
  const gLight = Math.floor(g * factor + 255 * (1 - factor));
  const bLight = Math.floor(b * factor + 255 * (1 - factor));
  
  return `#${rLight.toString(16).padStart(2, '0')}${gLight.toString(16).padStart(2, '0')}${bLight.toString(16).padStart(2, '0')}`;
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

interface ModernTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

export function ModernTemplate({ 
  data, 
  colorTheme = "blue",
  font = "'Calibri', 'Segoe UI', sans-serif" 
}: ModernTemplateProps) {
  const randomId = useId().replace(/:/g, "");
  const themeColor = getThemeColor(colorTheme);
  const secondaryColor = getSecondaryColor(colorTheme);
  
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
            line-height: 1.5;
            font-size: 10.5pt;
          }

          .${randomId} .modern-header {
            margin-bottom: 20pt;
            position: relative;
            padding-bottom: 20pt;
          }

          .${randomId} .modern-header-wrapper {
            display: grid;
            grid-template-columns: 70% 30%;
            column-gap: 15pt;
          }

          .${randomId} .modern-name {
            font-size: 24pt;
            font-weight: 600;
            color: #222;
            margin: 0;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }

          .${randomId} .modern-title {
            font-size: 13pt;
            color: ${themeColor};
            margin: 5pt 0 12pt;
            font-weight: 400;
          }

          .${randomId} .modern-accent-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4pt;
            width: 80pt;
            background-color: ${themeColor};
          }

          .${randomId} .modern-contact {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8pt;
            font-size: 9.5pt;
            color: #555;
            margin-top: 5pt;
          }

          .${randomId} .modern-contact-item {
            display: flex;
            align-items: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .${randomId} .modern-contact-icon {
            margin-right: 5pt;
            font-size: 10pt;
            color: ${themeColor};
          }

          .${randomId} .modern-contact a {
            color: #555;
            text-decoration: none;
            transition: color 0.2s;
          }

          .${randomId} .modern-contact a:hover {
            color: ${themeColor};
          }

          .${randomId} .modern-summary {
            background-color: ${secondaryColor};
            padding: 15pt;
            margin-bottom: 20pt;
            border-radius: 4pt;
          }

          .${randomId} .modern-summary-text {
            font-size: 10.5pt;
            color: #444;
            line-height: 1.5;
            margin: 0;
          }

          .${randomId} .modern-content {
            display: grid;
            grid-template-columns: 64% 32%;
            gap: 4%;
          }

          .${randomId} .modern-main-column {
            
          }

          .${randomId} .modern-side-column {
            
          }

          .${randomId} .modern-section {
            margin-bottom: 20pt;
            break-inside: avoid;
          }

          .${randomId} .modern-section-title {
            font-size: 12.5pt;
            font-weight: 600;
            color: #222;
            margin: 0 0 10pt;
            display: flex;
            align-items: center;
          }

          .${randomId} .modern-section-title::before {
            content: "";
            display: inline-block;
            width: 12pt;
            height: 12pt;
            background-color: ${themeColor};
            margin-right: 8pt;
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          }

          .${randomId} .modern-section-item {
            margin: 12pt 0;
            padding-left: 20pt;
            position: relative;
            break-inside: avoid;
          }

          .${randomId} .modern-section-item::before {
            content: "";
            position: absolute;
            left: 6pt;
            top: 0;
            bottom: 0;
            width: 1pt;
            background-color: #e0e0e0;
          }

          .${randomId} .modern-section-item::after {
            content: "";
            position: absolute;
            left: 4.5pt;
            top: 8pt;
            width: 4pt;
            height: 4pt;
            border-radius: 50%;
            background-color: ${themeColor};
          }

          .${randomId} .modern-item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            margin-bottom: 4pt;
          }

          .${randomId} .modern-item-title {
            font-size: 11pt;
            font-weight: 600;
            color: #333;
            margin: 0;
            line-height: 1.2;
          }

          .${randomId} .modern-item-subtitle {
            font-size: 10pt;
            color: #555;
            margin: 3pt 0 5pt;
            line-height: 1.3;
          }

          .${randomId} .modern-date {
            font-size: 9.5pt;
            color: ${themeColor};
            font-weight: 500;
            white-space: nowrap;
            margin-left: 8pt;
          }

          .${randomId} .modern-rich-text {
            font-size: 10pt;
            color: #444;
            line-height: 1.5;
          }

          .${randomId} .modern-rich-text p {
            margin: 5pt 0;
          }

          .${randomId} .modern-rich-text ul {
            margin: 5pt 0;
            padding-left: 15pt;
          }

          .${randomId} .modern-rich-text ul li {
            margin: 3pt 0;
          }

          .${randomId} .modern-rich-text a {
            color: ${themeColor};
            text-decoration: none;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            transition: border-bottom 0.2s;
          }

          .${randomId} .modern-rich-text a:hover {
            border-bottom: 1px solid ${themeColor};
          }

          .${randomId} .modern-skills {
            display: flex;
            flex-direction: column;
            gap: 8pt;
          }

          .${randomId} .modern-skill-item {
            display: flex;
            align-items: center;
          }

          .${randomId} .modern-skill-name {
            font-weight: 500;
            margin-right: 8pt;
            min-width: 120pt;
          }

          .${randomId} .modern-skill-bar {
            height: 6pt;
            flex-grow: 1;
            background-color: #f0f0f0;
            border-radius: 3pt;
            overflow: hidden;
          }

          .${randomId} .modern-skill-level {
            height: 100%;
            background-color: ${themeColor};
            border-radius: 3pt;
          }

          .${randomId} .modern-awards-certs {
            display: flex;
            flex-direction: column;
            gap: 10pt;
          }

          .${randomId} .modern-award-item {
            padding: 10pt;
            background-color: #f9f9f9;
            border-radius: 4pt;
          }

          .${randomId} .modern-award-title {
            font-weight: 600;
            margin-bottom: 3pt;
          }

          .${randomId} .modern-award-date {
            font-size: 9pt;
            color: #777;
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

            .${randomId} .modern-title {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .modern-accent-bar,
            .${randomId} .modern-section-title::before,
            .${randomId} .modern-section-item::after,
            .${randomId} .modern-skill-level {
              background-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .modern-summary {
              background-color: ${secondaryColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .modern-contact-icon,
            .${randomId} .modern-date {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .modern-rich-text a {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div className="modern-header">
        <div className="modern-header-wrapper">
          <div>
            <h1 className="modern-name">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
            {data.personalInfo.title && <div className="modern-title">{data.personalInfo.title}</div>}
          </div>
          
          <div className="modern-contact">
            {data.personalInfo.email && (
              <div className="modern-contact-item">
                <span className="modern-contact-icon">✉</span>
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            
            {data.personalInfo.phone && (
              <div className="modern-contact-item">
                <span className="modern-contact-icon">☎</span>
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            
            {data.personalInfo.location && (
              <div className="modern-contact-item">
                <span className="modern-contact-icon">⌖</span>
                <span>{data.personalInfo.location}</span>
              </div>
            )}
            
            {data.personalInfo.links?.map((link) => (
              <div key={link.id} className="modern-contact-item">
                <span className="modern-contact-icon">⧉</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title}
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="modern-accent-bar"></div>
      </div>

      {data.personalInfo.summary && (
        <div className="modern-summary">
          <div className="modern-summary-text" dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.personalInfo.summary) }}></div>
        </div>
      )}

      <div className="modern-content">
        <div className="modern-main-column">
          {data.sections
            .filter(section => 
              section.title.toLowerCase().includes('experience') || 
              section.title.toLowerCase().includes('work') ||
              section.title.toLowerCase().includes('employment') ||
              section.title.toLowerCase().includes('education') ||
              section.title.toLowerCase().includes('project')
            )
            .map((section) => (
              <div key={section.id} className="modern-section">
                <h2 className="modern-section-title">{section.title}</h2>
                {section.items.map((item) => (
                  <div key={item.id} className="modern-section-item">
                    <div className="modern-item-header">
                      <h3 className="modern-item-title">{item.title}</h3>
                      {item.date && <span className="modern-date">{item.date}</span>}
                    </div>
                    
                    {item.subtitle && (
                      <div className="modern-item-subtitle">{item.subtitle}</div>
                    )}
                    
                    {item.description && (
                      <div 
                        className="modern-rich-text"
                        dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
        
        <div className="modern-side-column">
          {/* Skills Section */}
          {data.sections.find(section => 
            section.title.toLowerCase().includes('skill') || 
            section.title.toLowerCase().includes('competenc')
          ) && (
            <div className="modern-section">
              <h2 className="modern-section-title">
                {data.sections.find(section => 
                  section.title.toLowerCase().includes('skill') || 
                  section.title.toLowerCase().includes('competenc')
                )?.title}
              </h2>
              <div className="modern-skills">
                {data.sections.find(section => 
                  section.title.toLowerCase().includes('skill') || 
                  section.title.toLowerCase().includes('competenc')
                )?.items.map((item, index) => {
                  // Generate pseudo-random skill level between 70-95%
                  const skillLevel = 70 + (((index * 17) % 26));
                  
                  return (
                    <div key={item.id} className="modern-skill-item">
                      <div className="modern-skill-name">{item.title}</div>
                      <div className="modern-skill-bar">
                        <div 
                          className="modern-skill-level" 
                          style={{ width: `${skillLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other side sections */}
          {data.sections
            .filter(section => 
              !section.title.toLowerCase().includes('experience') && 
              !section.title.toLowerCase().includes('work') &&
              !section.title.toLowerCase().includes('employment') &&
              !section.title.toLowerCase().includes('education') &&
              !section.title.toLowerCase().includes('project') &&
              !section.title.toLowerCase().includes('skill') &&
              !section.title.toLowerCase().includes('competenc')
            )
            .map((section) => (
              <div key={section.id} className="modern-section">
                <h2 className="modern-section-title">{section.title}</h2>
                
                {/* Render as awards/certifications with special styling */}
                {(section.title.toLowerCase().includes('certification') || 
                  section.title.toLowerCase().includes('award')
                ) ? (
                  <div className="modern-awards-certs">
                    {section.items.map((item) => (
                      <div key={item.id} className="modern-award-item">
                        <div className="modern-award-title">{item.title}</div>
                        {item.subtitle && <div>{item.subtitle}</div>}
                        {item.date && <div className="modern-award-date">{item.date}</div>}
                        {item.description && (
                          <div 
                            className="modern-rich-text"
                            dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Regular section items
                  section.items.map((item) => (
                    <div key={item.id} className="modern-section-item">
                      <div className="modern-item-header">
                        <h3 className="modern-item-title">{item.title}</h3>
                        {item.date && <span className="modern-date">{item.date}</span>}
                      </div>
                      
                      {item.subtitle && (
                        <div className="modern-item-subtitle">{item.subtitle}</div>
                      )}
                      
                      {item.description && (
                        <div 
                          className="modern-rich-text"
                          dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 