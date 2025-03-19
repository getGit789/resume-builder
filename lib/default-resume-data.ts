import { ResumeData } from "@/types";

export const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    location: "San Francisco, CA",
    summary: "Experienced software engineer with a passion for building user-friendly applications.",
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
          description: "<p>Led the development of a new product feature that increased user engagement by 25%.</p><ul><li>Collaborated with cross-functional teams to define requirements</li><li>Implemented responsive UI components using React</li><li>Optimized database queries to improve performance</li></ul>",
        },
        {
          id: "item-2",
          title: "Software Engineer",
          subtitle: "Startup XYZ",
          date: "2018 - 2020",
          description: "<p>Developed and maintained web applications using modern JavaScript frameworks.</p><ul><li>Built RESTful APIs using Node.js and Express</li><li>Implemented authentication and authorization features</li><li>Wrote unit and integration tests</li></ul>",
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
          description: "<p>Focused on software engineering and artificial intelligence.</p>",
        },
        {
          id: "item-4",
          title: "Bachelor of Science in Computer Science",
          subtitle: "State University",
          date: "2012 - 2016",
          description: "<p>Graduated with honors. Relevant coursework: Data Structures, Algorithms, Database Systems.</p>",
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
          description: "<p>JavaScript, TypeScript, Python, Java, SQL</p>",
        },
        {
          id: "item-6",
          title: "Frameworks & Libraries",
          subtitle: "",
          date: "",
          description: "<p>React, Node.js, Express, Next.js, Django</p>",
        },
        {
          id: "item-7",
          title: "Tools & Technologies",
          subtitle: "",
          date: "",
          description: "<p>Git, Docker, AWS, CI/CD, Agile methodologies</p>",
        },
      ],
    },
  ],
  settings: {
    font: "Inter"
  }
}; 