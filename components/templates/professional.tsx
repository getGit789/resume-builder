"use client"

// Define the interface for the resume data structure
interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: {
      id: string;
      url: string;
      title: string;
    }[];
    summary?: string;
  };
  sections?: {
    id: string;
    type: string;
    title: string;
    items: {
      id: string;
      title: string;
      subtitle: string;
      date?: string;
      description?: string;
    }[];
  }[];
}

// Define valid color theme values
type ColorTheme = "default" | "blue" | "green" | "purple" | "red" | "orange" | "teal";

interface ProfessionalTemplateProps {
  data: ResumeData;
  colorTheme?: ColorTheme;
}

// Color theme mapping
const themeColors: Record<ColorTheme, string> = {
  default: "#000000",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",
  orange: "#F97316",
  teal: "#14B8A6",
};

export function ProfessionalTemplate({ data, colorTheme = "default" }: ProfessionalTemplateProps) {
  // Get the theme color
  const themeColor = themeColors[colorTheme] || themeColors.default;
  
  return (
    <div className="font-serif">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: themeColor }}>
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <p className="text-lg text-gray-700">
          {data.personalInfo.title}
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
        </div>
        {data.personalInfo.links && data.personalInfo.links.length > 0 && (
          <div className="flex justify-center gap-4 mt-1 text-sm">
            {data.personalInfo.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {data.personalInfo.summary && (
        <div className="mb-6">
          <h2 
            className="text-lg font-bold pb-1 mb-2"
            style={{ 
              color: themeColor,
              borderBottom: `2px solid ${themeColor}` 
            }}
          >
            Professional Summary
          </h2>
          <div 
            className="text-sm rich-text-content" 
            dangerouslySetInnerHTML={{ __html: data.personalInfo.summary }}
          />
        </div>
      )}

      {data.sections && data.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 
            className="text-lg font-bold pb-1 mb-2"
            style={{ 
              color: themeColor,
              borderBottom: `2px solid ${themeColor}` 
            }}
          >
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-gray-700">{item.subtitle}</p>
                  </div>
                  {item.date && <p className="text-gray-600 text-sm">{item.date}</p>}
                </div>
                {item.description && (
                  <div 
                    className="text-sm mt-1 rich-text-content" 
                    dangerouslySetInnerHTML={{ __html: item.description }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx global>{`
        .rich-text-content ul, .rich-text-content ol {
          list-style-position: outside;
          padding-left: 1.5rem;
          margin: 0;
          line-height: normal;
        }
        
        .rich-text-content ul {
          list-style-type: disc;
        }
        
        .rich-text-content ol {
          list-style-type: decimal;
        }
        
        .rich-text-content li {
          margin: 0;
          padding: 0;
          display: list-item;
          line-height: 1.2;
          vertical-align: top;
        }
        
        /* Remove the ::marker styling to avoid duplicate bullets */
        .rich-text-content ul li::marker {
          color: inherit;
        }
        
        .rich-text-content p {
          margin: 0;
          padding: 0;
          line-height: 1.5;
        }
        
        .rich-text-content ul li, .rich-text-content ol li {
          display: list-item !important;
          list-style-position: outside !important;
        }
        
        .rich-text-content {
          white-space: normal;
        }
        
        .rich-text-content a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: bold;
        }
        
        .rich-text-content strong, 
        .rich-text-content b {
          font-weight: bold;
        }
        
        .rich-text-content em,
        .rich-text-content i {
          font-style: italic;
        }
        
        .rich-text-content u {
          text-decoration: underline;
        }
        
        .rich-text-content s {
          text-decoration: line-through;
        }
        
        /* Page break handling */
        @media print {
          .mb-6 {
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
          }
          
          h2 {
            page-break-after: avoid;
          }
          
          h3 {
            page-break-after: avoid;
          }
          
          .rich-text-content > div {
            page-break-inside: avoid;
          }
          
          /* Ensure flex layout works in print */
          .flex {
            display: flex !important;
          }
          
          .justify-center {
            justify-content: center !important;
          }
          
          .justify-between {
            justify-content: space-between !important;
          }
          
          .gap-4 {
            gap: 1rem !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          .mt-1 {
            margin-top: 0.25rem !important;
          }
          
          .mt-2 {
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}
