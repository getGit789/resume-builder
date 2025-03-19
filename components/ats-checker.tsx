"use client"

import { useState, useEffect } from "react"
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
import type { ResumeData } from "@/types"

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

interface ATSScore {
  score: number
  issues: string[]
  suggestions: string[]
  keywords: string[]
}

export function ATSChecker({ resumeData }: { resumeData: ResumeData }) {
  const [score, setScore] = useState<ATSScore | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [jobDescription, setJobDescription] = useState("")

  useEffect(() => {
    analyzeResume(resumeData)
  }, [resumeData])

  const analyzeResume = async (data: ResumeData) => {
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const issues: string[] = []
    const suggestions: string[] = []
    const keywords: string[] = []
    let scoreValue = 100
    
    // Check personal info
    if (!data.personalInfo.email) {
      issues.push("Missing email address")
      scoreValue -= 10
    }
    if (!data.personalInfo.phone) {
      issues.push("Missing phone number")
      scoreValue -= 5
    }
    if (!data.personalInfo.location) {
      issues.push("Missing location")
      scoreValue -= 5
    }
    
    // Check summary
    if (!data.personalInfo.summary) {
      issues.push("Missing professional summary")
      scoreValue -= 10
      suggestions.push("Add a professional summary highlighting your key qualifications")
    } else if (data.personalInfo.summary.length < 100) {
      issues.push("Professional summary is too short")
      scoreValue -= 5
      suggestions.push("Expand your professional summary to 100-200 characters")
    }
    
    // Check work experience
    const experienceSection = data.sections.find(s => 
      s.title.toLowerCase().includes("experience") ||
      s.title.toLowerCase().includes("work")
    )
    
    if (!experienceSection) {
      issues.push("Missing work experience section")
      scoreValue -= 15
      suggestions.push("Add a work experience section with your employment history")
    } else {
      if (experienceSection.items.length === 0) {
        issues.push("Work experience section is empty")
        scoreValue -= 10
      }
      
      experienceSection.items.forEach(item => {
        if (!item.date) {
          issues.push(`Missing dates for position: ${item.title}`)
          scoreValue -= 5
        }
        if (!item.description) {
          issues.push(`Missing description for position: ${item.title}`)
          scoreValue -= 5
        }
        
        // Extract keywords from descriptions
        const description = item.description.toLowerCase()
        const commonKeywords = [
          "managed", "developed", "created", "implemented", "led",
          "increased", "decreased", "improved", "achieved", "launched",
          "coordinated", "designed", "built", "analyzed", "resolved"
        ]
        
        commonKeywords.forEach(keyword => {
          if (description.includes(keyword) && !keywords.includes(keyword)) {
            keywords.push(keyword)
          }
        })
      })
    }
    
    // Check education
    const educationSection = data.sections.find(s => 
      s.title.toLowerCase().includes("education")
    )
    
    if (!educationSection) {
      issues.push("Missing education section")
      scoreValue -= 10
      suggestions.push("Add an education section with your academic background")
    }
    
    // Check skills
    const skillsSection = data.sections.find(s => 
      s.title.toLowerCase().includes("skills")
    )
    
    if (!skillsSection) {
      issues.push("Missing skills section")
      scoreValue -= 10
      suggestions.push("Add a skills section highlighting your technical and soft skills")
    }
    
    // Add general suggestions
    if (scoreValue < 90) {
      suggestions.push("Use industry-standard section titles (Experience, Education, Skills)")
    }
    if (keywords.length < 5) {
      suggestions.push("Include more action verbs and measurable achievements")
    }
    
    setScore({
      score: Math.max(0, scoreValue),
      issues,
      suggestions,
      keywords
    })
    setIsAnalyzing(false)
  }

  const analyzeKeywords = () => {
    if (!jobDescription.trim()) {
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate API call or processing time
    setTimeout(() => {
      const keywordResult = analyzeKeywordMatch(resumeData, jobDescription);
      setScore({
        score: keywordResult.score,
        issues: [],
        suggestions: [],
        keywords: keywordResult.matchedKeywords
      });
      setIsAnalyzing(false);
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
                  setScore(null);
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
                  {!score && !isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="mb-4 text-center">
                        <h3 className="text-lg font-medium">Ready to check your resume</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          We'll analyze your resume for ATS compatibility and provide suggestions for improvement.
                        </p>
                      </div>
                      <Button onClick={() => analyzeResume(resumeData)}>
                        Start Analysis
                      </Button>
                    </div>
                  )}
                  
                  {isAnalyzing && (
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
                  
                  {score && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">ATS Compatibility Score</h3>
                        <div className="relative w-32 h-32 mx-auto">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{score.score}%</span>
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
                              stroke={score.score >= 80 ? "#10b981" : "#ef4444"} 
                              strokeWidth="10" 
                              strokeDasharray={`${score.score * 2.83} 283`} 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                            />
                          </svg>
                        </div>
                        <div className="mt-2">
                          <Badge variant={score.score >= 80 ? "success" : "destructive"}>
                            {score.score}%
                          </Badge>
                        </div>
                      </div>
                      
                      {score.issues.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Issues to Address</CardTitle>
                            <CardDescription>
                              Fix these issues to improve your resume's ATS compatibility.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {score.issues.map((issue, index) => (
                                <li key={index} className="flex gap-3">
                                  <div className="mt-0.5 flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{issue}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                      
                      {score.suggestions.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Suggestions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {score.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex gap-3">
                                  <Info className="h-5 w-5 text-blue-500" />
                                  <span>{suggestion}</span>
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
                        disabled={isAnalyzing || !jobDescription.trim()}
                      >
                        {isAnalyzing ? (
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
                  
                  {score && !isAnalyzing && (
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
                              <span className="text-sm font-medium">Match Rate: {score.score}%</span>
                            </div>
                            <Progress value={score.score} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Matched Keywords</h4>
                              <div className="flex flex-wrap gap-2">
                                {score.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="success" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {score.keywords.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No matching keywords found.</p>
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
                            {score.issues.length > 0 && (
                              <li className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Address the issues found</p>
                                  <p className="text-sm text-muted-foreground">
                                    Use the suggestions provided to improve your resume.
                                  </p>
                                </div>
                              </li>
                            )}
                            
                            {score.keywords.length < 5 && (
                              <li className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Include more keywords</p>
                                  <p className="text-sm text-muted-foreground">
                                    Add more relevant keywords to your resume.
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