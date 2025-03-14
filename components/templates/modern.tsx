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
  sections: {
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

interface ModernTemplateProps {
  data: ResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold">
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </h1>
          <p className="text-xl text-primary mt-1">{data.personalInfo.title}</p>

          {data.personalInfo.summary && (
            <div className="mt-4">
              <div 
                className="text-sm rich-text-content" 
                dangerouslySetInnerHTML={{ __html: data.personalInfo.summary }}
              />
            </div>
          )}
        </div>

        <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <div className="space-y-1 text-sm">
            {data.personalInfo.email && <p>{data.personalInfo.email}</p>}
            {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
            {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
          </div>
          {data.personalInfo.links && data.personalInfo.links.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-semibold mb-1">Links</h3>
              <div className="space-y-1">
                {data.personalInfo.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline text-sm"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {data.sections.slice(0, Math.ceil(data.sections.length / 2)).map((section) => (
            <div key={section.id}>
              <h2 className="text-lg font-bold text-primary border-b border-primary pb-1 mb-3">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between">
                      <h3 className="font-bold">{item.title}</h3>
                      {item.date && <p className="text-gray-600 text-sm">{item.date}</p>}
                    </div>
                    <p className="text-primary-foreground font-medium">{item.subtitle}</p>
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
        </div>

        <div className="space-y-6">
          {data.sections.slice(Math.ceil(data.sections.length / 2)).map((section) => (
            <div key={section.id}>
              <h2 className="text-lg font-bold text-primary border-b border-primary pb-1 mb-3">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between">
                      <h3 className="font-bold">{item.title}</h3>
                      {item.date && <p className="text-gray-600 text-sm">{item.date}</p>}
                    </div>
                    <p className="text-primary-foreground font-medium">{item.subtitle}</p>
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
        </div>
      </div>

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

