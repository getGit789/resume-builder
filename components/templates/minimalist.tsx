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

interface MinimalistTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

export function MinimalistTemplate({ 
  data, 
  colorTheme = "blue",
  font = "Inter"
}: MinimalistTemplateProps) {
  const randomId = useId().replace(/:/g, "");
  const themeColor = getThemeColor(colorTheme);

  return (
    <div className={randomId}>
      <style>
        {`
          .${randomId} {
            width: 210mm;
            min-height: 297mm;
            padding: 12.7mm;
            font-family: ${font}, sans-serif;
            color: black;
            background: white;
            line-height: 1.3;
            font-size: 11pt;
          }

          .${randomId} h1 {
            font-size: 24pt;
            font-weight: 600;
            color: ${themeColor};
            margin: 0;
            line-height: 1.2;
          }

          .${randomId} h2 {
            font-size: 14pt;
            font-weight: 600;
            color: ${themeColor};
            margin: 0 0 8pt 0;
            padding-bottom: 4pt;
            border-bottom: 1px solid ${themeColor};
            line-height: 1.2;
          }

          .${randomId} h3 {
            font-size: 12pt;
            font-weight: 600;
            color: black;
            margin: 0 0 4pt 0;
            line-height: 1.2;
          }

          .${randomId} p {
            margin: 0 0 4pt 0;
            line-height: 1.4;
          }

          .${randomId} .contact-info {
            font-size: 11pt;
            color: black;
            margin: 8pt 0;
            display: flex;
            flex-wrap: wrap;
            gap: 0 8pt;
          }

          .${randomId} .contact-info > *:not(:last-child)::after {
            content: "•";
            margin-left: 8pt;
            color: black;
          }

          .${randomId} .contact-info a {
            color: black !important;
            text-decoration: underline !important;
          }

          .${randomId} .section {
            margin: 16pt 0;
            break-inside: avoid;
          }

          .${randomId} .section:first-child {
            margin-top: 0;
          }

          .${randomId} .section-item {
            margin: 12pt 0;
            break-inside: avoid;
          }

          .${randomId} .section-item:first-child {
            margin-top: 8pt;
          }

          .${randomId} .section-item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4pt;
          }

          .${randomId} .date {
            font-size: 11pt;
            color: black;
          }

          .${randomId} .rich-text-content {
            font-size: 11pt;
            color: black;
          }

          .${randomId} .rich-text-content ul {
            margin: 4pt 0;
            padding-left: 16pt;
            list-style-type: disc !important;
          }

          .${randomId} .rich-text-content ul li {
            margin: 2pt 0;
            color: black;
          }

          .${randomId} .rich-text-content ul li::marker {
            color: black;
          }

          .${randomId} .rich-text-content a {
            color: ${themeColor} !important;
            text-decoration: underline !important;
            text-decoration-color: ${themeColor} !important;
          }

          @media print {
            .${randomId} {
              padding: 12.7mm;
              margin: 0;
              width: 210mm;
              min-height: 297mm;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .${randomId} .contact-info a {
              color: black !important;
              text-decoration: underline !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .rich-text-content a {
              color: ${themeColor} !important;
              text-decoration: underline !important;
              text-decoration-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div>
        <h1>{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
        {data.personalInfo.title && (
          <div style={{ fontSize: '14pt', color: 'black', marginTop: '4pt' }}>
            {data.personalInfo.title}
          </div>
        )}

        <div className="contact-info">
          {data.personalInfo.email && (
            <span>{data.personalInfo.email}</span>
          )}
          {data.personalInfo.phone && (
            <span>{data.personalInfo.phone}</span>
          )}
          {data.personalInfo.location && (
            <span>{data.personalInfo.location}</span>
          )}
          {data.personalInfo.links?.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.title}
            </a>
          ))}
        </div>

        {data.personalInfo.summary && (
          <div className="section">
            <h2>Professional Summary</h2>
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.personalInfo.summary) }} />
          </div>
        )}

        {data.sections.map((section) => (
          <div key={section.id} className="section">
            <h2>{section.title}</h2>
            {section.items.map((item) => (
              <div key={item.id} className="section-item">
                <div className="section-item-header">
                  <h3>{item.title}</h3>
                  {item.date && <span className="date">{item.date}</span>}
                </div>
                {item.subtitle && (
                  <div style={{ fontSize: '11pt', marginBottom: '4pt' }}>
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

