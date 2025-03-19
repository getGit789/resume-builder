import { ResumeData } from "@/types";

export const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    location: "San Francisco, CA",
    summary: JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Experienced software engineer with a passion for building user-friendly applications.",
                type: "text",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1
          }
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    }),
    links: [
      {
        id: "link-1",
        title: "LinkedIn",
        url: "https://linkedin.com/in/johndoe",
      },
      {
        id: "link-2",
        title: "GitHub",
        url: "https://github.com/johndoe",
      },
    ],
  },
  sections: [
    {
      id: "section-1",
      title: "Work Experience",
      items: [
        {
          id: "item-1",
          title: "Senior Software Engineer",
          subtitle: "Tech Company Inc.",
          date: "2020 - Present",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Led the development of a new product feature that increased user engagement by 25%.",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                },
                {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Collaborated with cross-functional teams to define requirements",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    },
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Implemented responsive UI components using React",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    },
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Optimized database queries to improve performance",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "list",
                  version: 1,
                  listType: "bullet",
                  start: 1,
                  tag: "ul"
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
        {
          id: "item-2",
          title: "Software Engineer",
          subtitle: "Startup XYZ",
          date: "2018 - 2020",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Developed and maintained web applications using modern JavaScript frameworks.",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                },
                {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Built RESTful APIs using Node.js and Express",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    },
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Implemented authentication and authorization features",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    },
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: "normal",
                          style: "",
                          text: "Wrote unit and integration tests",
                          type: "text",
                          version: 1
                        }
                      ],
                      direction: "ltr",
                      format: "",
                      indent: 0,
                      type: "listitem",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "list",
                  version: 1,
                  listType: "bullet",
                  start: 1,
                  tag: "ul"
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
      ],
    },
    {
      id: "section-2",
      title: "Education",
      items: [
        {
          id: "item-3",
          title: "Master of Computer Science",
          subtitle: "University of Technology",
          date: "2016 - 2018",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Focused on software engineering and artificial intelligence.",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
        {
          id: "item-4",
          title: "Bachelor of Science in Computer Science",
          subtitle: "State University",
          date: "2012 - 2016",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Graduated with honors. Relevant coursework: Data Structures, Algorithms, Database Systems.",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
      ],
    },
    {
      id: "section-3",
      title: "Skills",
      items: [
        {
          id: "item-5",
          title: "Programming Languages",
          subtitle: "",
          date: "",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "JavaScript, TypeScript, Python, Java, SQL",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
        {
          id: "item-6",
          title: "Frameworks & Libraries",
          subtitle: "",
          date: "",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "React, Node.js, Express, Next.js, Django",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
        {
          id: "item-7",
          title: "Tools & Technologies",
          subtitle: "",
          date: "",
          description: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Git, Docker, AWS, CI/CD, Agile methodologies",
                      type: "text",
                      version: 1
                    }
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1
            }
          }),
        },
      ],
    },
  ],
  settings: {
    font: "Inter"
  }
}; 