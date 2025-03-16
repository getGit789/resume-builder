import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResumePreview from "@/components/resume-preview";

interface SharedResumePageProps {
  params: {
    token: string;
  };
}

export async function generateMetadata({ params }: SharedResumePageProps): Promise<Metadata> {
  const resume = await getResumeByToken(params.token);
  
  if (!resume) {
    return {
      title: "Resume Not Found",
      description: "The shared resume could not be found.",
    };
  }
  
  return {
    title: `${resume.name} | Shared Resume`,
    description: `View the shared resume: ${resume.name}`,
  };
}

async function getResumeByToken(token: string) {
  try {
    // Try to find the resume by share token
    const resume = await prisma.resume.findUnique({
      where: {
        shareToken: token,
        isPublic: true,
      },
    });
    
    if (!resume) {
      // Check if this is a mock token
      if (token.startsWith("mock-")) {
        return {
          id: `mock-${Date.now()}`,
          name: "Shared Mock Resume",
          data: {
            personalInfo: {
              firstName: "John",
              lastName: "Doe",
              title: "Software Engineer",
              email: "john@example.com",
              phone: "(555) 123-4567",
              location: "San Francisco, CA",
              summary: "Experienced software engineer with a passion for building scalable applications.",
              links: [
                { id: "1", title: "GitHub", url: "https://github.com/johndoe" },
                { id: "2", title: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
              ],
            },
            sections: [
              {
                id: "experience",
                title: "Experience",
                items: [
                  {
                    id: "exp1",
                    title: "Senior Software Engineer",
                    subtitle: "Tech Company",
                    date: "2020 - Present",
                    description: "Led development of key features for the main product.",
                  },
                ],
              },
              {
                id: "education",
                title: "Education",
                items: [
                  {
                    id: "edu1",
                    title: "Bachelor of Science in Computer Science",
                    subtitle: "University of Technology",
                    date: "2012 - 2016",
                    description: "Graduated with honors.",
                  },
                ],
              },
            ],
          },
          template: "professional",
          colorTheme: "blue",
        };
      }
      
      return null;
    }
    
    return resume;
  } catch (error) {
    console.error("Error fetching shared resume:", error);
    return null;
  }
}

export default async function SharedResumePage({ params }: SharedResumePageProps) {
  const resume = await getResumeByToken(params.token);
  
  if (!resume) {
    notFound();
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">{resume.name}</h1>
        <p className="text-muted-foreground">Shared Resume</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <ResumePreview 
          data={resume.data} 
          template={resume.template} 
          colorTheme={resume.colorTheme} 
        />
      </div>
    </div>
  );
} 