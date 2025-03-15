"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Info, Search, Briefcase, X } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    links: {
      id: string;
      title: string;
      url: string;
    }[];
  };
  sections: {
    id: string;
    title: string;
    items: {
      id: string;
      title: string;
      subtitle: string;
      date: string;
      description: string;
    }[];
  }[];
}

interface ATSCheckerProps {
  resumeData: ResumeData;
}

interface CheckResult {
  score: number;
  issues: {
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }[];
  strengths: string[];
}

interface KeywordAnalysisResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  score: number;
}

export function ATSChecker({ resumeData }: ATSCheckerProps) {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [keywordResult, setKeywordResult] = useState<KeywordAnalysisResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [jobDescription, setJobDescription] = useState("");

  const checkResume = () => {
    setIsChecking(true);
    
    // Simulate API call or processing time
    setTimeout(() => {
      const checkResult = analyzeResume(resumeData);
      setResult(checkResult);
      setIsChecking(false);
    }, 1500);
  };

  const analyzeKeywords = () => {
    if (!jobDescription.trim()) {
      return;
    }
    
    setIsChecking(true);
    
    // Simulate API call or processing time
    setTimeout(() => {
      const keywordResult = analyzeKeywordMatch(resumeData, jobDescription);
      setKeywordResult(keywordResult);
      setIsChecking(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          ATS Checker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 gap-0 flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>ATS Compatibility Check</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setResult(null);
                  setKeywordResult(null);
                  setIsOpen(false);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Analyze your resume for compatibility with Applicant Tracking Systems (ATS).
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General Analysis</TabsTrigger>
                <TabsTrigger value="keywords">Keyword Match</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-140px)]">
            <div className="px-6 py-4">
              {activeTab === "general" && (
                <div className="space-y-4">
                  {!result && !isChecking && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="mb-4 text-center">
                        <h3 className="text-lg font-medium">Ready to check your resume</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll analyze your resume for ATS compatibility and provide suggestions for improvement.
                        </p>
                      </div>
                      <Button onClick={checkResume}>
                        Start Analysis
                      </Button>
                    </div>
                  )}
                  
                  {isChecking && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin mb-4">
                        <Search className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">Analyzing your resume...</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This will only take a moment.
                      </p>
                    </div>
                  )}
                  
                  {result && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">ATS Compatibility Score</h3>
                        <div className="relative w-32 h-32 mx-auto">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{result.score}%</span>
                          </div>
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke="#e2e8f0" 
                              strokeWidth="10" 
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke={result.score >= 80 ? "#10b981" : result.score >= 60 ? "#f59e0b" : "#ef4444"} 
                              strokeWidth="10" 
                              strokeDasharray={`${result.score * 2.83} 283`} 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                            />
                          </svg>
                        </div>
                        <div className="mt-2">
                          <Badge variant={result.score >= 80 ? "success" : result.score >= 60 ? "warning" : "destructive"}>
                            {result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </div>
                      </div>
                      
                      {result.issues.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Issues to Address</CardTitle>
                            <CardDescription>
                              Fix these issues to improve your resume's ATS compatibility.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {result.issues.map((issue, index) => (
                                <li key={index} className="flex gap-3">
                                  <div className="mt-0.5 flex-shrink-0">
                                    {issue.severity === 'error' ? (
                                      <AlertCircle className="h-5 w-5 text-destructive" />
                                    ) : issue.severity === 'warning' ? (
                                      <AlertCircle className="h-5 w-5 text-amber-500" />
                                    ) : (
                                      <Info className="h-5 w-5 text-blue-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{issue.message}</p>
                                    <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                      
                      {result.strengths.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Strengths</CardTitle>
                            <CardDescription>
                              These aspects of your resume are well-optimized for ATS.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {result.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "keywords" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Job Description Analysis</CardTitle>
                      <CardDescription>
                        Paste a job description to check if your resume contains the relevant keywords.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        placeholder="Paste the job description here..." 
                        className="min-h-[150px]"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      <Button 
                        onClick={analyzeKeywords} 
                        className="mt-4 w-full"
                        disabled={isChecking || !jobDescription.trim()}
                      >
                        {isChecking ? (
                          <>
                            <span className="animate-spin mr-2">
                              <Search className="h-4 w-4" />
                            </span>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Briefcase className="mr-2 h-4 w-4" />
                            Analyze Keywords
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {keywordResult && !isChecking && (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Keyword Match Score</CardTitle>
                          <CardDescription>
                            How well your resume matches the job description keywords.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Match Rate: {keywordResult.score}%</span>
                            </div>
                            <Progress value={keywordResult.score} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Matched Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {keywordResult.matchedKeywords.map((keyword, index) => (
                                  <Badge key={index} variant="success" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {keywordResult.matchedKeywords.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No matching keywords found.</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Missing Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {keywordResult.missingKeywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {keywordResult.missingKeywords.length === 0 && (
                                  <p className="text-sm text-muted-foreground">Your resume includes all important keywords!</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {keywordResult.missingKeywords.length > 0 && (
                              <li className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Add missing keywords to your resume</p>
                                  <p className="text-sm text-muted-foreground">
                                    Include the missing keywords in your resume where relevant, especially in your work experience and skills sections.
                                  </p>
                                </div>
                              </li>
                            )}
                            
                            {keywordResult.matchedKeywords.length > 0 && keywordResult.score < 70 && (
                              <li className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Emphasize matching keywords</p>
                                  <p className="text-sm text-muted-foreground">
                                    Make sure matching keywords are prominently featured in your resume, especially in section headings and bullet points.
                                  </p>
                                </div>
                              </li>
                            )}
                            
                            {keywordResult.score >= 70 && (
                              <li className="flex gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Good keyword match</p>
                                  <p className="text-sm text-muted-foreground">
                                    Your resume contains many of the important keywords from the job description.
                                  </p>
                                </div>
                              </li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ATS analysis logic
function analyzeResume(resumeData: ResumeData): CheckResult {
  const issues: CheckResult['issues'] = [];
  const strengths: string[] = [];
  let score = 100; // Start with perfect score and deduct points for issues
  
  // Check for contact information
  if (!resumeData.personalInfo.email) {
    issues.push({
      severity: 'error',
      message: 'Missing email address',
      suggestion: 'Add your email address to ensure recruiters can contact you.'
    });
    score -= 10;
  } else {
    strengths.push('Email address is present');
  }
  
  if (!resumeData.personalInfo.phone) {
    issues.push({
      severity: 'warning',
      message: 'Missing phone number',
      suggestion: 'Include your phone number for recruiters to reach you directly.'
    });
    score -= 5;
  } else {
    strengths.push('Phone number is present');
  }
  
  // Check for professional summary
  if (!resumeData.personalInfo.summary) {
    issues.push({
      severity: 'warning',
      message: 'Missing professional summary',
      suggestion: 'Add a concise professional summary to highlight your key qualifications.'
    });
    score -= 8;
  } else if (resumeData.personalInfo.summary.length < 100) {
    issues.push({
      severity: 'info',
      message: 'Professional summary is too short',
      suggestion: 'Expand your summary to include more relevant skills and experience.'
    });
    score -= 3;
  } else {
    strengths.push('Professional summary is well-developed');
  }
  
  // Check for sections
  if (resumeData.sections.length === 0) {
    issues.push({
      severity: 'error',
      message: 'No resume sections found',
      suggestion: 'Add sections like Work Experience, Education, and Skills to your resume.'
    });
    score -= 15;
  }
  
  // Check for work experience
  const workExperienceSection = resumeData.sections.find(section => 
    section.title.toLowerCase().includes('experience') || 
    section.title.toLowerCase().includes('work')
  );
  
  if (!workExperienceSection) {
    issues.push({
      severity: 'error',
      message: 'Missing work experience section',
      suggestion: 'Add a work experience section to showcase your professional background.'
    });
    score -= 12;
  } else if (workExperienceSection.items.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Work experience section is empty',
      suggestion: 'Add your work history with detailed descriptions of your responsibilities and achievements.'
    });
    score -= 10;
  } else {
    // Check experience items
    let hasWeakDescriptions = false;
    let hasStrongDescriptions = false;
    
    workExperienceSection.items.forEach(item => {
      if (!item.description || item.description.length < 100) {
        hasWeakDescriptions = true;
      }
      
      if (item.description && item.description.length >= 200) {
        hasStrongDescriptions = true;
      }
      
      // Check for dates
      if (!item.date) {
        issues.push({
          severity: 'warning',
          message: `Missing date for "${item.title}" position`,
          suggestion: 'Add employment dates to all work experiences.'
        });
        score -= 3;
      }
    });
    
    if (hasWeakDescriptions) {
      issues.push({
        severity: 'warning',
        message: 'Some work experiences have minimal descriptions',
        suggestion: 'Expand your job descriptions with specific achievements and responsibilities.'
      });
      score -= 5;
    }
    
    if (hasStrongDescriptions) {
      strengths.push('Detailed work experience descriptions');
    }
    
    if (workExperienceSection.items.length > 0) {
      strengths.push('Work experience section is present');
    }
  }
  
  // Check for education
  const educationSection = resumeData.sections.find(section => 
    section.title.toLowerCase().includes('education')
  );
  
  if (!educationSection) {
    issues.push({
      severity: 'warning',
      message: 'Missing education section',
      suggestion: 'Add an education section with your academic background.'
    });
    score -= 8;
  } else if (educationSection.items.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'Education section is empty',
      suggestion: 'Add your educational background with degrees, institutions, and graduation dates.'
    });
    score -= 5;
  } else {
    strengths.push('Education section is present');
  }
  
  // Check for skills
  const skillsSection = resumeData.sections.find(section => 
    section.title.toLowerCase().includes('skills')
  );
  
  if (!skillsSection) {
    issues.push({
      severity: 'warning',
      message: 'Missing skills section',
      suggestion: 'Add a dedicated skills section to highlight your technical and soft skills.'
    });
    score -= 8;
  } else if (skillsSection.items.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'Skills section is empty',
      suggestion: 'List your relevant skills, especially those mentioned in the job description.'
    });
    score -= 5;
  } else {
    strengths.push('Skills section is present');
  }
  
  // Check for keywords in professional title
  if (!resumeData.personalInfo.title) {
    issues.push({
      severity: 'warning',
      message: 'Missing professional title',
      suggestion: 'Add a clear professional title that matches your target position.'
    });
    score -= 5;
  } else {
    strengths.push('Professional title is present');
  }
  
  // Check for links
  if (resumeData.personalInfo.links && resumeData.personalInfo.links.length > 0) {
    const hasLinkedIn = resumeData.personalInfo.links.some(link => 
      link.title.toLowerCase().includes('linkedin') || 
      link.url.toLowerCase().includes('linkedin.com')
    );
    
    if (!hasLinkedIn) {
      issues.push({
        severity: 'info',
        message: 'LinkedIn profile not included',
        suggestion: 'Add your LinkedIn profile to enhance your professional credibility.'
      });
      score -= 2;
    } else {
      strengths.push('LinkedIn profile is included');
    }
  } else {
    issues.push({
      severity: 'info',
      message: 'No professional links',
      suggestion: 'Consider adding your LinkedIn profile or professional website.'
    });
    score -= 3;
  }
  
  // Ensure score stays within 0-100 range
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return {
    score,
    issues,
    strengths
  };
}

// Keyword analysis function
function analyzeKeywordMatch(resumeData: ResumeData, jobDescription: string): KeywordAnalysisResult {
  // Extract all text from resume
  let resumeText = '';
  
  // Add personal info
  resumeText += `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} `;
  resumeText += `${resumeData.personalInfo.title} `;
  resumeText += `${resumeData.personalInfo.summary} `;
  
  // Add sections
  resumeData.sections.forEach(section => {
    resumeText += `${section.title} `;
    
    section.items.forEach(item => {
      resumeText += `${item.title} ${item.subtitle} ${item.description} `;
    });
  });
  
  // Clean up HTML tags
  resumeText = resumeText.replace(/<\/?[^>]+(>|$)/g, ' ');
  
  // Extract potential keywords from job description
  const jobDescriptionLower = jobDescription.toLowerCase();
  
  // Common words to exclude
  const excludeWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'on', 'at', 'to', 'from', 'by',
    'with', 'in', 'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'will', 'just', 'should', 'now', 'if', 'of', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'doing', 'would', 'could', 'should',
    'must', 'shall', 'may', 'might', 'that', 'this', 'these', 'those', 'we', 'you', 'they', 'i', 'he',
    'she', 'it', 'who', 'whom', 'whose', 'which', 'what', 'whatever', 'whoever', 'whomever',
    'job', 'description', 'company', 'position', 'role', 'candidate', 'applicant', 'application',
    'resume', 'apply', 'please', 'thank', 'opportunity', 'about', 'us', 'our', 'we'
  ]);
  
  // Extract words from job description
  const words = jobDescriptionLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !excludeWords.has(word))
    .map(word => word.trim());
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Take top keywords (up to 20)
  const topKeywords = sortedWords.slice(0, 20);
  
  // Check which keywords are in the resume
  const resumeTextLower = resumeText.toLowerCase();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  topKeywords.forEach(keyword => {
    if (resumeTextLower.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  // Calculate score
  const score = topKeywords.length > 0 
    ? Math.round((matchedKeywords.length / topKeywords.length) * 100) 
    : 0;
  
  return {
    matchedKeywords,
    missingKeywords,
    score
  };
}

// Custom Badge component with success and warning variants
declare module "@/components/ui/badge" {
  interface BadgeVariants {
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
} 