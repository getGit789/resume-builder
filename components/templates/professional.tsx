export function ProfessionalTemplate({ data }) {
  return (
    <div className="font-serif">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <p className="text-lg text-gray-700">{data.personalInfo.title}</p>
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
          <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">Professional Summary</h2>
          <p className="text-sm">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">{section.title}</h2>
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
                {item.description && <p className="text-sm mt-1">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

