import { NextResponse } from 'next/server';

// Define types for our suggestion data
type JobTitle = "Software Engineer" | "Product Manager" | "Marketing Specialist" | "Data Scientist" | "UX Designer";

type SummaryData = {
  [key in JobTitle]: string[];
};

type DescriptionData = {
  [key in JobTitle]: string[];
};

type SkillsData = {
  [key in JobTitle]: string[][];
};

// Mock AI suggestions for different types of content
const professionalSummaries: SummaryData = {
  "Software Engineer": [
    "Innovative Software Engineer with 5+ years of experience developing robust applications using JavaScript, TypeScript, and React. Passionate about clean code and user-centric design. Proven track record of delivering high-quality solutions that improve efficiency and user experience.",
    "Detail-oriented Software Engineer specializing in full-stack development with expertise in Node.js and React. Committed to writing maintainable, scalable code and implementing best practices. Experienced in agile environments with a focus on continuous improvement and collaborative problem-solving."
  ],
  "Product Manager": [
    "Strategic Product Manager with experience driving product development from conception to launch. Skilled in market analysis, user research, and cross-functional team leadership. Passionate about creating intuitive products that solve real user problems and drive business growth.",
    "Results-driven Product Manager with a background in user experience and data analysis. Adept at translating business requirements into product features and coordinating across engineering, design, and marketing teams. Committed to building products that delight users and exceed business objectives."
  ],
  "Marketing Specialist": [
    "Creative Marketing Specialist with expertise in digital marketing campaigns and content strategy. Skilled in SEO, social media management, and analytics. Proven ability to increase brand awareness and drive engagement through innovative marketing initiatives.",
    "Data-driven Marketing Specialist with experience in campaign optimization and performance analysis. Proficient in creating compelling content across multiple channels and measuring ROI. Passionate about leveraging marketing technology to reach target audiences effectively."
  ],
  "Data Scientist": [
    "Analytical Data Scientist with expertise in machine learning, statistical analysis, and data visualization. Experienced in Python, R, and SQL with a track record of extracting actionable insights from complex datasets. Committed to solving business problems through data-driven approaches.",
    "Innovative Data Scientist specializing in predictive modeling and algorithm development. Skilled in transforming raw data into valuable business insights using advanced analytics techniques. Passionate about using data science to drive strategic decision-making and business growth."
  ],
  "UX Designer": [
    "User-focused UX Designer with expertise in creating intuitive, accessible digital experiences. Skilled in user research, wireframing, prototyping, and usability testing. Passionate about designing products that balance user needs with business goals.",
    "Creative UX Designer with a human-centered approach to problem-solving. Experienced in conducting user research and translating insights into engaging designs. Committed to creating seamless user experiences that drive product adoption and satisfaction."
  ]
};

const jobDescriptions: DescriptionData = {
  "Software Engineer": [
    "• Developed and maintained web applications using React, TypeScript, and Node.js\n• Collaborated with cross-functional teams to define, design, and ship new features\n• Implemented responsive design and ensured cross-browser compatibility\n• Optimized applications for maximum speed and scalability\n• Participated in code reviews and provided constructive feedback to other developers",
    "• Architected and implemented scalable backend services using Node.js and Express\n• Built and maintained RESTful APIs and microservices\n• Improved application performance by optimizing database queries and implementing caching\n• Wrote unit and integration tests to ensure code quality\n• Mentored junior developers and participated in agile development processes"
  ],
  "Product Manager": [
    "• Led product development from concept to launch, resulting in 30% revenue growth\n• Conducted market research and competitive analysis to identify opportunities\n• Created product roadmaps and prioritized features based on business impact\n• Collaborated with engineering and design teams to deliver high-quality products\n• Analyzed user feedback and metrics to inform product decisions",
    "• Managed the entire product lifecycle from strategic planning to tactical activities\n• Gathered and prioritized product requirements from stakeholders and customers\n• Defined product vision, strategy, and roadmap aligned with company goals\n• Worked closely with engineering teams to deliver features on time and within budget\n• Monitored product performance and made data-driven decisions for improvements"
  ],
  "Marketing Specialist": [
    "• Developed and executed digital marketing campaigns across multiple channels\n• Created engaging content for social media, email, and website\n• Analyzed campaign performance and optimized for improved results\n• Managed SEO strategy resulting in 40% increase in organic traffic\n• Collaborated with design team to create compelling marketing materials",
    "• Planned and implemented marketing strategies to support business objectives\n• Managed social media accounts, increasing follower engagement by 50%\n• Created and distributed email newsletters with 25% above-industry open rates\n• Conducted market research to identify trends and opportunities\n• Tracked and reported on key performance metrics to stakeholders"
  ],
  "Data Scientist": [
    "• Built predictive models using machine learning algorithms to forecast business trends\n• Cleaned and preprocessed large datasets for analysis\n• Developed data visualization dashboards to communicate insights to stakeholders\n• Collaborated with cross-functional teams to implement data-driven solutions\n• Conducted A/B tests to optimize business processes",
    "• Analyzed complex datasets to identify patterns and trends\n• Developed and deployed machine learning models to solve business problems\n• Created automated data pipelines for efficient data processing\n• Presented findings and recommendations to non-technical stakeholders\n• Collaborated with engineering teams to implement models in production"
  ],
  "UX Designer": [
    "• Conducted user research through interviews, surveys, and usability testing\n• Created wireframes, prototypes, and user flows for web and mobile applications\n• Collaborated with product managers to align designs with business requirements\n• Worked closely with developers to ensure design implementation accuracy\n• Iterated designs based on user feedback and analytics",
    "• Designed intuitive user interfaces for complex web applications\n• Created and maintained design systems to ensure consistency across products\n• Conducted usability testing and incorporated feedback into design iterations\n• Collaborated with cross-functional teams throughout the product development lifecycle\n• Advocated for user-centered design principles within the organization"
  ]
};

const skillSuggestions: SkillsData = {
  "Software Engineer": [
    ["JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS", "Git", "RESTful APIs", "GraphQL", "Jest", "CI/CD", "Agile/Scrum", "Problem Solving"],
    ["Python", "Java", "AWS", "Docker", "Kubernetes", "MongoDB", "SQL", "Redux", "Next.js", "Microservices", "System Design", "Test-Driven Development"]
  ],
  "Product Manager": [
    ["Product Strategy", "Market Research", "User Stories", "Roadmapping", "Agile/Scrum", "Data Analysis", "Stakeholder Management", "Prioritization", "A/B Testing", "User Interviews", "Product Metrics", "Presentation Skills"],
    ["Competitive Analysis", "Product Launch", "User Experience", "JIRA", "SQL", "Product Analytics", "Customer Journey Mapping", "Wireframing", "Strategic Planning", "Cross-functional Leadership", "Backlog Management", "Requirements Gathering"]
  ],
  "Marketing Specialist": [
    ["Digital Marketing", "Content Creation", "Social Media Management", "SEO/SEM", "Email Marketing", "Analytics", "Campaign Management", "Copywriting", "Adobe Creative Suite", "Marketing Automation", "Brand Development", "Market Research"],
    ["Google Analytics", "Facebook Ads", "Instagram Marketing", "Content Strategy", "Lead Generation", "A/B Testing", "CRM Systems", "Marketing Funnels", "Influencer Marketing", "Video Production", "Public Relations", "Event Planning"]
  ],
  "Data Scientist": [
    ["Python", "R", "SQL", "Machine Learning", "Statistical Analysis", "Data Visualization", "Pandas", "NumPy", "Scikit-learn", "Jupyter Notebooks", "Feature Engineering", "Regression Analysis"],
    ["TensorFlow", "PyTorch", "Big Data", "Hadoop", "Spark", "Natural Language Processing", "Deep Learning", "Time Series Analysis", "A/B Testing", "Data Mining", "Tableau", "Power BI"]
  ],
  "UX Designer": [
    ["User Research", "Wireframing", "Prototyping", "Usability Testing", "Figma", "Adobe XD", "Information Architecture", "Interaction Design", "User Flows", "Accessibility", "Design Systems", "Visual Design"],
    ["Sketch", "InVision", "User Personas", "Journey Mapping", "Heuristic Evaluation", "A/B Testing", "Mobile Design", "Responsive Design", "UI Animation", "Design Thinking", "HTML/CSS", "User-Centered Design"]
  ]
};

export async function POST(request: Request) {
  try {
    const { type, jobTitle } = await request.json();
    
    // Default to Software Engineer if no job title is provided or if the job title is not in our list
    const normalizedJobTitle = isValidJobTitle(jobTitle) ? jobTitle : "Software Engineer";
    
    let suggestions: string[] | string[][] = [];
    
    switch (type) {
      case 'summary':
        suggestions = professionalSummaries[normalizedJobTitle];
        break;
      case 'description':
        suggestions = jobDescriptions[normalizedJobTitle];
        break;
      case 'skills':
        suggestions = skillSuggestions[normalizedJobTitle];
        break;
      default:
        return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });
    }
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}

// Helper function to check if a job title is valid
function isValidJobTitle(title: any): title is JobTitle {
  return typeof title === 'string' && 
    ["Software Engineer", "Product Manager", "Marketing Specialist", "Data Scientist", "UX Designer"].includes(title);
} 