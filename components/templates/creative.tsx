"use client"

import { ColorTheme, ResumeData, themeColors } from "@/types"
import { useId } from "react"

function getThemeColor(colorTheme: ColorTheme): string {
  return themeColors[colorTheme] || themeColors.default;
}

function getAccentColor(colorTheme: ColorTheme): string {
  // Create accent color by darkening the main color
  const hexColor = getThemeColor(colorTheme).replace('#', '');
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Darken the color by 20%
  const darkenFactor = 0.8;
  const rDark = Math.floor(r * darkenFactor);
  const gDark = Math.floor(g * darkenFactor);
  const bDark = Math.floor(b * darkenFactor);
  
  return `#${rDark.toString(16).padStart(2, '0')}${gDark.toString(16).padStart(2, '0')}${bDark.toString(16).padStart(2, '0')}`;
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

interface CreativeTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

export function CreativeTemplate({ 
  data, 
  colorTheme = "blue",
  font = "'Calibri', 'Segoe UI', sans-serif"
}: CreativeTemplateProps) {
  const randomId = useId().replace(/:/g, "");
  const themeColor = getThemeColor(colorTheme);
  const accentColor = getAccentColor(colorTheme);
  
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
            display: flex;
            position: relative;
          }

          .${randomId} .sidebar {
            background-color: ${themeColor};
            color: white;
            padding: 30pt 20pt;
            min-height: 297mm;
          }

          .${randomId} .main-content {
            padding: 30pt 25pt;
          }

          .${randomId} .photo-placeholder {
            width: 100pt;
            height: 100pt;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            margin: 0 auto 20pt;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32pt;
            font-weight: 300;
          }

          .${randomId} .creative-name {
            font-size: 22pt;
            font-weight: 700;
            color: white;
            margin: 0;
            line-height: 1.1;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .${randomId} .creative-title {
            font-size: 12pt;
            color: rgba(255, 255, 255, 0.9);
            margin: 6pt 0 15pt;
            line-height: 1.2;
            text-align: center;
            font-weight: 400;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }

          .${randomId} .contact-title {
            font-size: 13pt;
            font-weight: 600;
            color: white;
            margin: 20pt 0 10pt;
            padding-bottom: 5pt;
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .${randomId} .contact-info {
            font-size: 10pt;
            color: rgba(255, 255, 255, 0.9);
            margin: 12pt 0;
            line-height: 1.7;
          }

          .${randomId} .contact-info-item {
            display: flex;
            align-items: center;
            margin-bottom: 8pt;
          }

          .${randomId} .contact-info-item-icon {
            width: 16pt;
            margin-right: 8pt;
            text-align: center;
            font-weight: bold;
          }

          .${randomId} .contact-info a {
            color: white !important;
            text-decoration: none !important;
            transition: opacity 0.2s;
          }

          .${randomId} .contact-info a:hover {
            opacity: 0.8;
          }

          .${randomId} .creative-section-title {
            font-size: 16pt;
            font-weight: 700;
            color: ${themeColor};
            margin: 20pt 0 12pt;
            line-height: 1.2;
            position: relative;
            padding-left: 12pt;
          }

          .${randomId} .creative-section-title::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5pt;
            background-color: ${themeColor};
          }

          .${randomId} .section-container {
            margin: 16pt 0;
            break-inside: avoid;
          }

          .${randomId} .section-item {
            margin: 16pt 0;
            break-inside: avoid;
            position: relative;
            padding-left: 14pt;
          }

          .${randomId} .section-item::before {
            content: "";
            position: absolute;
            left: 0;
            top: 8pt;
            width: 8pt;
            height: 8pt;
            background-color: ${themeColor};
            border-radius: 50%;
          }

          .${randomId} .section-item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            margin-bottom: 6pt;
          }

          .${randomId} .section-item-title {
            font-size: 12pt;
            font-weight: 700;
            color: #333;
            margin: 0;
            line-height: 1.2;
            flex: 1;
            min-width: 60%;
          }

          .${randomId} .section-item-subtitle {
            font-size: 11pt;
            color: #555;
            margin: 4pt 0;
            line-height: 1.4;
            font-weight: 500;
            font-style: italic;
          }

          .${randomId} .date {
            font-size: 10pt;
            color: ${themeColor};
            font-weight: 600;
            background-color: rgba(0, 0, 0, 0.05);
            padding: 2pt 6pt;
            border-radius: 4pt;
          }

          .${randomId} .summary-text {
            font-size: 11pt;
            line-height: 1.6;
            color: #444;
          }

          .${randomId} .rich-text-content {
            font-size: 10.5pt;
            color: #444;
            line-height: 1.5;
          }

          .${randomId} .rich-text-content ul {
            margin: 4pt 0;
            padding-left: 12pt;
            list-style-type: none !important;
          }

          .${randomId} .rich-text-content ul li {
            margin: 4pt 0;
            color: #444;
            position: relative;
            padding-left: 12pt;
          }

          .${randomId} .rich-text-content ul li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: ${themeColor};
            font-weight: bold;
          }

          .${randomId} .skills-section {
            margin-top: 16pt;
          }

          .${randomId} .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10pt;
            margin-top: 12pt;
          }

          .${randomId} .skill-item {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 6pt 10pt;
            border-radius: 4pt;
            font-size: 10pt;
            margin-bottom: 6pt;
          }

          .${randomId} .rich-text-content a {
            color: ${themeColor} !important;
            text-decoration: none !important;
            border-bottom: 1px dotted ${themeColor};
            transition: border-bottom 0.2s;
          }

          .${randomId} .rich-text-content a:hover {
            border-bottom: 1px solid ${themeColor};
          }

          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            .${randomId} {
              padding: 0;
              margin: 0;
              width: 210mm;
              height: 297mm;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .${randomId} .sidebar {
              background-color: ${themeColor} !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .creative-section-title {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .creative-section-title::before {
              background-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .section-item::before {
              background-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .date {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .rich-text-content ul li::before {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div className="sidebar">
        <div className="photo-placeholder">
          {data.personalInfo.firstName.charAt(0)}{data.personalInfo.lastName.charAt(0)}
        </div>
        
        <h1 className="creative-name">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
        
        {data.personalInfo.title && (
          <div className="creative-title">
            {data.personalInfo.title}
          </div>
        )}

        <h2 className="contact-title">Contact</h2>
        <div className="contact-info">
          {data.personalInfo.email && (
            <div className="contact-info-item">
              <div className="contact-info-item-icon">@</div>
              <div>{data.personalInfo.email}</div>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="contact-info-item">
              <div className="contact-info-item-icon">☎</div>
              <div>{data.personalInfo.phone}</div>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="contact-info-item">
              <div className="contact-info-item-icon">⌖</div>
              <div>{data.personalInfo.location}</div>
            </div>
          )}
          {data.personalInfo.links?.map((link) => (
            <div key={link.id} className="contact-info-item">
              <div className="contact-info-item-icon">⧉</div>
              <div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section (if exists) */}
        {data.sections.find(section => 
          section.title.toLowerCase().includes('skill') || 
          section.title.toLowerCase().includes('competenc')
        ) && (
          <div className="skills-section">
            <h2 className="contact-title">Skills</h2>
            <div className="skills-grid">
              {data.sections.find(section => 
                section.title.toLowerCase().includes('skill') || 
                section.title.toLowerCase().includes('competenc')
              )?.items.map(item => (
                <div key={item.id} className="skill-item">
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="main-content">
        {data.personalInfo.summary && (
          <div className="section-container">
            <h2 className="creative-section-title">Professional Summary</h2>
            <div className="summary-text rich-text-content" dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.personalInfo.summary) }} />
          </div>
        )}

        {data.sections
          .filter(section => 
            !section.title.toLowerCase().includes('skill') && 
            !section.title.toLowerCase().includes('competenc')
          )
          .map((section) => (
          <div key={section.id} className="section-container">
            <h2 className="creative-section-title">{section.title}</h2>
            {section.items.map((item) => (
              <div key={item.id} className="section-item">
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
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.description) }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 