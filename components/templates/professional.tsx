"use client"

import { ColorTheme, ResumeData, themeColors } from "@/types"
import { useEffect, useRef, useId } from "react"

interface ProfessionalTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
  font?: string;
}

function getThemeColor(colorTheme: ColorTheme): string {
  return themeColors[colorTheme] || themeColors.blue;
}

export function ProfessionalTemplate({ 
  data, 
  colorTheme = "blue",
  font = "Inter"
}: ProfessionalTemplateProps) {
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
            font-family: ${font}, serif;
            color: black;
            background: white;
            line-height: 1.3;
            font-size: 11pt;
          }

          .${randomId} .professional-name {
            font-size: 24pt;
            font-weight: 600;
            color: ${themeColor};
            margin: 0;
            line-height: 1.2;
            text-align: center;
          }

          .${randomId} .professional-title {
            font-size: 14pt;
            color: black;
            margin: 4pt 0 0 0;
            line-height: 1.2;
            text-align: center;
          }

          .${randomId} .contact-info {
            font-size: 11pt;
            color: black;
            margin: 8pt 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0 8pt;
            text-align: center;
          }

          .${randomId} .contact-info > *:not(:last-child)::after {
            content: "•";
            margin-left: 8pt;
            color: black;
          }

          .${randomId} .professional-section-title {
            font-size: 14pt;
            font-weight: 600;
            color: ${themeColor};
            margin: 16pt 0 8pt 0;
            padding-bottom: 4pt;
            border-bottom: 1px solid ${themeColor};
            line-height: 1.2;
          }

          .${randomId} .section-container {
            margin: 16pt 0;
            break-inside: avoid;
          }

          .${randomId} .section-container:first-child {
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

          .${randomId} .section-item-title {
            font-size: 12pt;
            font-weight: 600;
            color: black;
            margin: 0;
            line-height: 1.2;
          }

          .${randomId} .section-item-subtitle {
            font-size: 11pt;
            color: black;
            margin: 0 0 4pt 0;
            line-height: 1.4;
          }

          .${randomId} .date {
            font-size: 11pt;
            color: black;
          }

          .${randomId} .rich-text-content {
            font-size: 11pt;
            color: black;
            line-height: 1.4;
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

          .${randomId} .professional-link {
            color: black !important;
            text-decoration: underline !important;
          }

          .${randomId} .rich-text-content a {
            color: ${themeColor} !important;
            text-decoration: underline !important;
            text-decoration-color: ${themeColor} !important;
          }

          @page {
            size: A4;
            margin: 12.7mm;
          }

          @media print {
            .${randomId} {
              padding: 0;
              margin: 0;
              width: 100%;
              min-height: 100%;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .${randomId} .professional-section-title {
              color: ${themeColor} !important;
              border-color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .professional-name {
              color: ${themeColor} !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .${randomId} .professional-link {
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
        <h1 className="professional-name">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
        {data.personalInfo.title && (
          <div className="professional-title">
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
              className="professional-link"
            >
              {link.title}
            </a>
          ))}
        </div>

        {data.personalInfo.summary && (
          <div className="section-container">
            <h2 className="professional-section-title">Professional Summary</h2>
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: data.personalInfo.summary }} />
          </div>
        )}

        {data.sections.map((section) => (
          <div key={section.id} className="section-container">
            <h2 className="professional-section-title">{section.title}</h2>
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
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
