export function MinimalistTemplate({ data }) {
  return (
    <div className="font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <p className="text-gray-700">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {data.personalInfo.links && data.personalInfo.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2 text-sm">
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

      {data.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-md font-bold uppercase tracking-wider mb-2">Summary</h2>
          <p className="text-sm">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-md font-bold uppercase tracking-wider mb-2">{section.title}</h2>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.date && <p className="text-gray-600 text-xs">{item.date}</p>}
                </div>
                <p className="text-gray-700 text-sm">{item.subtitle}</p>
                {item.description && <p className="text-sm mt-1">{item.description}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

