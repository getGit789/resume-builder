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
    type?: string;
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

interface ATSTemplateProps {
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

export function MinimalistTemplate({ data, colorTheme = "default" }: ATSTemplateProps) {
  // Get the theme color
  const themeColor = themeColors[colorTheme] || themeColors.default;
  
  return (
    <div className="font-sans">
      {/* Header with name */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: themeColor }}>
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        {data.personalInfo.title && (
          <p className="text-gray-700">
            {data.personalInfo.title}
          </p>
        )}
      </div>

      {/* Contact information in a single line */}
      <div className="mb-6">
        <p className="text-sm">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span> | {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span> | {data.personalInfo.location}</span>}
          
          {data.personalInfo.links && data.personalInfo.links.length > 0 && (
            <>
              {data.personalInfo.links.map((link, index) => (
                <span key={link.id}>
                  {' | '}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {link.title}
                  </a>
                </span>
              ))}
            </>
          )}
        </p>
      </div>

      {/* Professional Summary */}
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

      {/* Resume Sections */}
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
              <div key={item.id} className="mb-3">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <div className="flex justify-between items-baseline">
                    <p className="text-gray-700">{item.subtitle}</p>
                    {item.date && <p className="text-gray-600 text-sm">{item.date}</p>}
                  </div>
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

      {/* Styling for rich text content */}
      <style jsx global>{`
        .rich-text-content ul, .rich-text-content ol {
          list-style-position: outside;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .rich-text-content ul {
          list-style-type: square;
        }
        
        .rich-text-content ol {
          list-style-type: decimal;
        }
        
        .rich-text-content li {
          margin: 0.25rem 0;
          display: list-item;
        }
        
        .rich-text-content a {
          color: #2563eb; /* Blue color */
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
      `}</style>
    </div>
  )
}

