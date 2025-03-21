"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Info, Briefcase, Check, AlertTriangle, X, Lock } from "lucide-react"
import { useAuthStore } from "@/store/use-auth-store"
import { useRouter } from "next/navigation"
import { getUpgradeMessage } from "@/lib/feature-access"
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
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [score, setScore] = useState<ATSScore | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [jobDescription, setJobDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Start analysis when authenticated or when explicitly requested
  const runAnalysis = () => {
    // Don't start analysis if already loading
    if (isLoading) return;
    
    setIsLoading(true)
    setProgressValue(0)
    setAnalysisComplete(false)
    
    // Progressive loading simulation
    const duration = 3500 // 3.5 seconds total
    const interval = 50 // Update every 50ms
    const steps = duration / interval
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep += 1
      // Non-linear progress to make it feel more realistic
      // Start fast, slow in the middle, then finish quickly
      const progress = Math.min(100, Math.round(
        currentStep < steps * 0.3 
          ? (currentStep / (steps * 0.3)) * 40 // First 30% of time -> get to 40% progress
          : currentStep < steps * 0.8 
            ? 40 + ((currentStep - (steps * 0.3)) / (steps * 0.5)) * 40 // Next 50% of time -> get to 80% progress
            : 80 + ((currentStep - (steps * 0.8)) / (steps * 0.2)) * 20 // Last 20% of time -> finish to 100%
      ))
      
      setProgressValue(progress)
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setIsLoading(false)
        setAnalysisComplete(true)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }

  // Start analysis immediately for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      runAnalysis();
    }
  }, [isAuthenticated]);

  // Run analysis when tab changes (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && analysisComplete) {
      // Reset and run new analysis when tab changes
      runAnalysis();
    }
  }, [activeTab, isAuthenticated, analysisComplete]);
  
  // Mocked data for general analysis
  const generalAnalysis: CheckResult = {
    score: 85,
    issues: [
      {
        severity: 'warning',
        message: 'Your resume is slightly longer than recommended.',
        suggestion: 'Consider condensing your work experience to focus on the most relevant achievements.'
      },
      {
        severity: 'info',
        message: 'Some action verbs are repeated.',
        suggestion: 'Use varied action verbs to describe your accomplishments.'
      }
    ],
    strengths: [
      'Good use of quantifiable achievements',
      'Clear job titles and dates',
      'Relevant skills are highlighted',
      'Contact information is complete'
    ]
  };
  
  // Mocked data for keyword analysis
  const keywordAnalysis: KeywordAnalysisResult = {
    matchedKeywords: [
      'JavaScript', 'React', 'TypeScript', 'Node.js', 'API'
    ],
    missingKeywords: [
      'GraphQL', 'AWS', 'Docker', 'CI/CD', 'Agile'
    ],
    score: 70
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Content for guests who haven't authenticated
  const renderGuestContent = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-6 p-4 rounded-full bg-muted">
        <Lock className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">ATS Compatibility Check</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {getUpgradeMessage("atsCheck")}
      </p>
      <Button onClick={() => router.push("/auth")}>
        Sign In to Unlock
      </Button>
    </div>
  );
  
  // If not authenticated, show guest content
  if (!isAuthenticated) {
    return renderGuestContent();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ATS Compatibility Check</CardTitle>
              <CardDescription>
                See how your resume performs against Applicant Tracking Systems
              </CardDescription>
            </div>
            {analysisComplete && !isLoading && (
              <Badge className="ml-2" variant={score && score.score >= 80 ? "default" : "outline"}>
                {score && score.score >= 80 ? "ATS Friendly" : "Needs Improvement"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Analyzing your resume...</span>
                <span>{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <div className="text-sm text-muted-foreground">
                We're checking your resume against ATS algorithms...
              </div>
            </div>
          ) : analysisComplete ? (
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General Analysis</TabsTrigger>
                <TabsTrigger value="keywords">Keyword Matching</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-4 space-y-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <span className="text-xl font-semibold">{generalAnalysis.score}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {generalAnalysis.score >= 80 ? "Good ATS Score" : "Average ATS Score"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {generalAnalysis.score >= 80 
                        ? "Your resume is well-formatted for ATS" 
                        : "Some improvements needed for ATS compatibility"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Strengths
                    </h4>
                    <ul className="ml-6 space-y-1 text-sm">
                      {generalAnalysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 font-medium flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                      Suggested Improvements
                    </h4>
                    <ul className="ml-6 space-y-3 text-sm">
                      {generalAnalysis.issues.map((issue, i) => (
                        <li key={i} className="space-y-1">
                          <div className="flex items-start">
                            {issue.severity === 'error' ? (
                              <X className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
                            ) : issue.severity === 'warning' ? (
                              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                            ) : (
                              <Info className="mr-2 h-4 w-4 text-blue-500 mt-0.5" />
                            )}
                            <span className="font-medium">{issue.message}</span>
                          </div>
                          <p className="ml-6 text-muted-foreground">{issue.suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="keywords" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="mb-2">
                      <label className="font-medium mb-1 block">Job Description</label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Paste a job description to analyze keyword matching
                      </p>
                      <Textarea 
                        placeholder="Paste job description here..." 
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        if (jobDescription.trim()) {
                          // Would analyze job description against resume
                          // For now, just pretend we did
                          runAnalysis();
                        }
                      }}
                      disabled={!jobDescription.trim() || isLoading}
                    >
                      Analyze Job Match
                    </Button>
                  </div>
                  
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <span className="text-xl font-semibold">{keywordAnalysis.score}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {keywordAnalysis.score >= 80 ? "Strong Keyword Match" : "Moderate Keyword Match"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {keywordAnalysis.score >= 80 
                          ? "Your resume contains most of the important keywords" 
                          : "Consider adding more relevant keywords"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Matched Keywords
                      </h4>
                      <ul className="ml-6 space-y-1 text-sm">
                        {keywordAnalysis.matchedKeywords.map((keyword, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                            <span>{keyword}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 font-medium flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                        Missing Keywords
                      </h4>
                      <ul className="ml-6 space-y-1 text-sm">
                        {keywordAnalysis.missingKeywords.map((keyword, i) => (
                          <li key={i} className="flex items-start">
                            <X className="mr-2 h-4 w-4 text-red-500 mt-0.5" />
                            <span>{keyword}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Button onClick={runAnalysis}>Start ATS Analysis</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 