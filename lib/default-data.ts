export const defaultResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    title: "Software Engineer",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    summary:
      "Experienced software engineer with a passion for building scalable web applications and solving complex problems.",
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
      id: "experience",
      title: "Work Experience",
      items: [
        {
          id: "exp-1",
          title: "Senior Software Engineer",
          subtitle: "Tech Company Inc.",
          date: "Jan 2020 - Present",
          description:
            "Led development of a microservices architecture. Improved system performance by 40%. Mentored junior developers.",
        },
        {
          id: "exp-2",
          title: "Software Engineer",
          subtitle: "Startup XYZ",
          date: "Jun 2017 - Dec 2019",
          description:
            "Developed and maintained RESTful APIs. Implemented CI/CD pipelines. Collaborated with cross-functional teams.",
        },
      ],
    },
    {
      id: "education",
      title: "Education",
      items: [
        {
          id: "edu-1",
          title: "Master of Computer Science",
          subtitle: "University of Technology",
          date: "2015 - 2017",
          description: "Specialized in Artificial Intelligence and Machine Learning. GPA: 3.8/4.0",
        },
        {
          id: "edu-2",
          title: "Bachelor of Science in Computer Science",
          subtitle: "State University",
          date: "2011 - 2015",
          description: "Dean's List. Participated in ACM programming competitions.",
        },
      ],
    },
    {
      id: "skills",
      title: "Skills",
      items: [
        {
          id: "skill-1",
          title: "Programming Languages",
          subtitle: "JavaScript, TypeScript, Python, Java",
          date: "",
          description: "",
        },
        {
          id: "skill-2",
          title: "Frameworks & Libraries",
          subtitle: "React, Node.js, Express, Next.js",
          date: "",
          description: "",
        },
        {
          id: "skill-3",
          title: "Tools & Technologies",
          subtitle: "Git, Docker, AWS, CI/CD, Agile/Scrum",
          date: "",
          description: "",
        },
      ],
    },
  ],
}

