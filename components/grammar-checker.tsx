"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, FileText, X, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface GrammarCheckerProps {
  resumeData: any;
}

interface GrammarIssue {
  text: string;
  offset: number;
  length: number;
  type: 'grammar' | 'spelling' | 'style' | 'punctuation';
  suggestions: string[];
  context: string;
  severity: 'high' | 'medium' | 'low';
}

interface GrammarCheckResult {
  score: number;
  issues: GrammarIssue[];
  statistics: {
    totalIssues: number;
    grammarIssues: number;
    spellingIssues: number;
    styleIssues: number;
    punctuationIssues: number;
  };
}

export function GrammarChecker({ resumeData }: GrammarCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Extract all text from resume for analysis
  const extractResumeText = () => {
    let allText = "";
    
    // Add personal info text
    allText += `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}\n`;
    allText += `${resumeData.personalInfo.title}\n`;
    allText += resumeData.personalInfo.summary || "";
    
    // Add section text
    resumeData.sections.forEach((section: any) => {
      allText += `\n${section.title}\n`;
      
      section.items.forEach((item: any) => {
        allText += `${item.title} - ${item.subtitle}\n`;
        allText += `${item.date || ""}\n`;
        allText += stripHtml(item.description || "") + "\n";
      });
    });
    
    return allText;
  };
  
  // Helper to strip HTML tags
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const checkGrammar = () => {
    setIsChecking(true);
    
    // In a real implementation, this would call an API
    // For now, we'll simulate the check with a timeout and mock data
    setTimeout(() => {
      const mockResult = simulateGrammarCheck(extractResumeText());
      setResult(mockResult);
      setIsChecking(false);
    }, 2000);
  };
  
  // Simulate grammar check with mock data
  const simulateGrammarCheck = (text: string): GrammarCheckResult => {
    // Create some mock issues based on common resume mistakes
    const mockIssues: GrammarIssue[] = [];
    
    // Look for common grammar issues
    if (text.includes("i ")) {
      mockIssues.push({
        text: "i ",
        offset: text.indexOf("i "),
        length: 1,
        type: 'grammar',
        suggestions: ["I "],
        context: "...text with i instead of I...",
        severity: 'high'
      });
    }
    
    // Look for passive voice
    if (text.includes("was responsible for")) {
      mockIssues.push({
        text: "was responsible for",
        offset: text.indexOf("was responsible for"),
        length: 19,
        type: 'style',
        suggestions: ["led", "managed", "directed", "oversaw"],
        context: "...was responsible for the team...",
        severity: 'medium'
      });
    }
    
    // Look for weak verbs
    const weakVerbs = ["helped", "worked on", "assisted with", "participated in"];
    weakVerbs.forEach(verb => {
      if (text.toLowerCase().includes(verb)) {
        mockIssues.push({
          text: verb,
          offset: text.toLowerCase().indexOf(verb),
          length: verb.length,
          type: 'style',
          suggestions: ["led", "implemented", "delivered", "achieved", "created"],
          context: `...${verb} the project...`,
          severity: 'medium'
        });
      }
    });
    
    // Look for spelling mistakes
    const spellingMistakes = [
      { wrong: "recieved", right: "received" },
      { wrong: "acheived", right: "achieved" },
      { wrong: "managment", right: "management" },
      { wrong: "comunication", right: "communication" }
    ];
    
    spellingMistakes.forEach(mistake => {
      if (text.toLowerCase().includes(mistake.wrong)) {
        mockIssues.push({
          text: mistake.wrong,
          offset: text.toLowerCase().indexOf(mistake.wrong),
          length: mistake.wrong.length,
          type: 'spelling',
          suggestions: [mistake.right],
          context: `...${mistake.wrong}...`,
          severity: 'high'
        });
      }
    });
    
    // Add some punctuation issues
    if (text.includes("  ")) {
      mockIssues.push({
        text: "  ",
        offset: text.indexOf("  "),
        length: 2,
        type: 'punctuation',
        suggestions: [" "],
        context: "...word  with...",
        severity: 'low'
      });
    }
    
    // Calculate statistics
    const statistics = {
      totalIssues: mockIssues.length,
      grammarIssues: mockIssues.filter(i => i.type === 'grammar').length,
      spellingIssues: mockIssues.filter(i => i.type === 'spelling').length,
      styleIssues: mockIssues.filter(i => i.type === 'style').length,
      punctuationIssues: mockIssues.filter(i => i.type === 'punctuation').length
    };
    
    // Calculate score (higher is better)
    // Base score of 100, minus points for issues based on severity
    let score = 100;
    mockIssues.forEach(issue => {
      if (issue.severity === 'high') score -= 5;
      else if (issue.severity === 'medium') score -= 3;
      else score -= 1;
    });
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      score,
      issues: mockIssues,
      statistics
    };
  };

  // Get sections with issues for the sections tab
  const getSectionsWithIssues = () => {
    if (!result) return [];
    
    const sections = [
      { id: "personal", title: "Personal Information", text: resumeData.personalInfo.summary || "" },
      ...resumeData.sections.map((section: any) => ({
        id: section.id,
        title: section.title,
        text: section.items.map((item: any) => stripHtml(item.description || "")).join("\n")
      }))
    ];
    
    return sections;
  };
  
  // Get issues for a specific section
  const getIssuesForSection = (sectionId: string) => {
    if (!result) return [];
    
    // In a real implementation, we would filter issues by section
    // For now, just return all issues
    return result.issues;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Grammar Check
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 gap-0 flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>Grammar & Language Check</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Analyze your resume for grammar, spelling, and style issues to ensure professional quality.
            </DialogDescription>
          </DialogHeader>
          
          {result && (
            <div className="px-6 pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="issues">All Issues</TabsTrigger>
                  <TabsTrigger value="sections">By Section</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-140px)]">
            <div className="px-6 py-4">
              {!result && !isChecking && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 text-center">
                    <h3 className="text-lg font-medium">Ready to check your resume</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll analyze your resume for grammar, spelling, and style issues to ensure it looks professional.
                    </p>
                  </div>
                  <Button onClick={checkGrammar}>
                    Start Grammar Check
                  </Button>
                </div>
              )}
              
              {isChecking && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Checking your resume...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzing grammar, spelling, and style.
                  </p>
                </div>
              )}
              
              {result && activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Writing Quality Score</h3>
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
                          stroke={result.score >= 90 ? "#10b981" : result.score >= 70 ? "#f59e0b" : "#ef4444"} 
                          strokeWidth="10" 
                          strokeDasharray={`${result.score * 2.83} 283`} 
                          strokeDashoffset="0" 
                          transform="rotate(-90 50 50)" 
                        />
                      </svg>
                    </div>
                    <div className="mt-2">
                      <Badge variant={result.score >= 90 ? "success" : result.score >= 70 ? "warning" : "destructive"}>
                        {result.score >= 90 ? "Excellent" : result.score >= 70 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Issues Summary</CardTitle>
                      <CardDescription>
                        Overview of writing issues found in your resume.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Grammar Issues</span>
                            <span className="text-sm text-muted-foreground">{result.statistics.grammarIssues}</span>
                          </div>
                          <Progress value={result.statistics.grammarIssues > 0 ? 100 : 0} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Spelling Issues</span>
                            <span className="text-sm text-muted-foreground">{result.statistics.spellingIssues}</span>
                          </div>
                          <Progress value={result.statistics.spellingIssues > 0 ? 100 : 0} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Style Issues</span>
                            <span className="text-sm text-muted-foreground">{result.statistics.styleIssues}</span>
                          </div>
                          <Progress value={result.statistics.styleIssues > 0 ? 100 : 0} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Punctuation Issues</span>
                            <span className="text-sm text-muted-foreground">{result.statistics.punctuationIssues}</span>
                          </div>
                          <Progress value={result.statistics.punctuationIssues > 0 ? 100 : 0} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Writing Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Use active voice</p>
                            <p className="text-sm text-muted-foreground">
                              Replace phrases like "was responsible for" with strong action verbs like "led" or "managed".
                            </p>
                          </div>
                        </li>
                        
                        <li className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Be specific with achievements</p>
                            <p className="text-sm text-muted-foreground">
                              Include numbers and percentages to quantify your accomplishments.
                            </p>
                          </div>
                        </li>
                        
                        <li className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Use industry-specific terminology</p>
                            <p className="text-sm text-muted-foreground">
                              Include relevant keywords and phrases from your industry.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {result && activeTab === "issues" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">All Issues ({result.issues.length})</CardTitle>
                      <CardDescription>
                        Review and fix these issues to improve your resume.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.issues.length > 0 ? (
                        <ul className="space-y-4">
                          {result.issues.map((issue, index) => (
                            <li key={index} className="border-b pb-4 last:border-0 last:pb-0">
                              <div className="flex gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                  {issue.type === 'grammar' || issue.type === 'spelling' ? (
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                  ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{issue.text}</p>
                                    <Badge variant={
                                      issue.type === 'grammar' ? "destructive" : 
                                      issue.type === 'spelling' ? "destructive" : 
                                      issue.type === 'style' ? "warning" : "outline"
                                    } className="text-xs">
                                      {issue.type}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Context: "{issue.context}"
                                  </p>
                                  
                                  {issue.suggestions.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Suggestions:</p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {issue.suggestions.map((suggestion, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {suggestion}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No issues found. Great job!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {result && activeTab === "sections" && (
                <div className="space-y-4">
                  {selectedSection ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                          {getSectionsWithIssues().find(s => s.id === selectedSection)?.title}
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSection(null)}>
                          Back to Sections
                        </Button>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Issues in this Section</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {getIssuesForSection(selectedSection).length > 0 ? (
                            <ul className="space-y-4">
                              {getIssuesForSection(selectedSection).map((issue, index) => (
                                <li key={index} className="border-b pb-4 last:border-0 last:pb-0">
                                  <div className="flex gap-3">
                                    <div className="mt-0.5 flex-shrink-0">
                                      {issue.type === 'grammar' || issue.type === 'spelling' ? (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                      ) : (
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{issue.text}</p>
                                        <Badge variant={
                                          issue.type === 'grammar' ? "destructive" : 
                                          issue.type === 'spelling' ? "destructive" : 
                                          issue.type === 'style' ? "warning" : "outline"
                                        } className="text-xs">
                                          {issue.type}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Context: "{issue.context}"
                                      </p>
                                      
                                      {issue.suggestions.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-sm font-medium">Suggestions:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {issue.suggestions.map((suggestion, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {suggestion}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">
                              No issues found in this section. Great job!
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Resume Sections</CardTitle>
                        <CardDescription>
                          Select a section to view its specific issues.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {getSectionsWithIssues().map((section) => (
                            <li key={section.id}>
                              <Button 
                                variant="outline" 
                                className="w-full justify-between"
                                onClick={() => setSelectedSection(section.id)}
                              >
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  {section.title}
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {/* In a real implementation, we would count issues per section */}
                                  {Math.floor(Math.random() * 3)} issues
                                </Badge>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
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