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
    "Develop and maintain web applications using modern JavaScript frameworks",
    "Write clean, maintainable, and efficient code",
    "Collaborate with cross-functional teams to define and implement new features",
    "Optimize applications for maximum speed and scalability",
    "Participate in code reviews and provide constructive feedback"
  ],
  "Product Manager": [
    "Define product vision and strategy",
    "Gather and analyze user feedback and market research",
    "Work with engineering teams to deliver high-quality products",
    "Prioritize features and create product roadmaps",
    "Track and measure product performance metrics"
  ],
  "Marketing Specialist": [
    "• Developed and executed digital marketing campaigns across multiple channels\n• Created engaging content for social media, email, and website\n• Analyzed campaign performance and optimized for improved results\n• Managed SEO strategy resulting in 40% increase in organic traffic\n• Collaborated with design team to create compelling marketing materials",
    "• Planned and implemented marketing strategies to support business objectives\n• Managed social media accounts, increasing follower engagement by 50%\n• Created and distributed email newsletters with 25% above-industry open rates\n• Conducted market research to identify trends and opportunities\n• Tracked and reported on key performance metrics to stakeholders"
  ],
  "Data Scientist": [
    "Analyze complex data sets to drive business decisions",
    "Build and deploy machine learning models",
    "Create data visualizations and reports",
    "Collaborate with stakeholders to understand business needs",
    "Develop and maintain data pipelines"
  ],
  "UX Designer": [
    "Create user-centered designs for digital products",
    "Conduct user research and usability testing",
    "Design wireframes, prototypes, and high-fidelity mockups",
    "Collaborate with developers to ensure design implementation",
    "Create and maintain design systems"
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

export async function POST(req: Request) {
  try {
    const { role, section } = await req.json();
    
    if (!role || !section) {
      return NextResponse.json(
        { error: "Role and section are required" },
        { status: 400 }
      );
    }

    const descriptions = jobDescriptions[role as keyof typeof jobDescriptions];
    
    if (!descriptions) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ suggestions: descriptions });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

// Helper function to check if a job title is valid
function isValidJobTitle(title: any): title is JobTitle {
  return typeof title === 'string' && 
    ["Software Engineer", "Product Manager", "Marketing Specialist", "Data Scientist", "UX Designer"].includes(title);
} 