export function ModernTemplate({ data }) {
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
              <p className="text-sm">{data.personalInfo.summary}</p>
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
                    {item.description && <p className="text-sm mt-1">{item.description}</p>}
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
                    {item.description && <p className="text-sm mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

