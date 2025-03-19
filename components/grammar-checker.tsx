import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResumeData } from "@/types";
import { cn } from "@/lib/utils";

interface GrammarCheckerProps {
  resumeData: ResumeData;
}

interface GrammarIssue {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: string[];
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  type: {
    typeName: string;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface AnalysisResult {
  score: number;
  issues: GrammarIssue[];
  categorizedIssues: {
    [key: string]: GrammarIssue[];
  };
  suggestions: string[];
}

async function checkGrammarWithAPI(text: string): Promise<any> {
  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      text,
      language: "en-US",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to check grammar");
  }

  return response.json();
}

export function GrammarChecker({ resumeData }: GrammarCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    checkGrammar();
  }, [resumeData]);

  const extractText = (data: ResumeData): string => {
    const parts = [
      // Personal info
      `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
      data.personalInfo.title,
      data.personalInfo.summary,
    ];

    // Sections
    data.sections.forEach(section => {
      parts.push(section.title);
      section.items.forEach(item => {
        parts.push(item.title);
        parts.push(item.subtitle);
        // Clean HTML from description
        const cleanDescription = item.description.replace(/<[^>]*>/g, ' ');
        parts.push(cleanDescription);
      });
    });

    return parts.filter(Boolean).join("\n\n");
  };

  const analyzeIssues = (matches: any[]): AnalysisResult => {
    const issues = matches.map(match => ({
      ...match,
      replacements: match.replacements.map((r: any) => r.value)
    }));

    // Categorize issues
    const categorizedIssues: { [key: string]: GrammarIssue[] } = {};
    issues.forEach(issue => {
      const category = issue.rule.category.name;
      if (!categorizedIssues[category]) {
        categorizedIssues[category] = [];
      }
      categorizedIssues[category].push(issue);
    });

    // Calculate score based on number and severity of issues
    const maxScore = 100;
    const deductionPerIssue = {
      "GRAMMAR": 5,
      "PUNCTUATION": 3,
      "TYPOS": 2,
      "STYLE": 1
    };

    let score = maxScore;
    issues.forEach(issue => {
      const category = issue.rule.category.name.toUpperCase();
      const deduction = deductionPerIssue[category as keyof typeof deductionPerIssue] || 1;
      score = Math.max(0, score - deduction);
    });

    // Generate suggestions
    const suggestions = Array.from(new Set(issues.map(issue => {
      const fix = issue.replacements.length > 0 
        ? `Replace with "${issue.replacements[0]}"`
        : issue.message;
      return `${issue.rule.category.name}: ${fix}`;
    })));

    return {
      score,
      issues,
      categorizedIssues,
      suggestions
    };
  };

  const checkGrammar = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const text = extractText(resumeData);
      const response = await checkGrammarWithAPI(text);
      const result = analyzeIssues(response.matches);
      setAnalysis(result);
    } catch (err) {
      console.error('Grammar check error:', err);
      setError('Failed to check grammar. Please try again later.');
    } finally {
      setIsChecking(false);
    }
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Grammar
          </CardTitle>
          <CardDescription>
            Analyzing your resume for grammar, spelling, and style issues...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "GRAMMAR":
        return "destructive";
      case "PUNCTUATION":
        return "orange";
      case "TYPOS":
        return "yellow";
      case "STYLE":
        return "blue";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Writing Score</CardTitle>
            <span className={cn("text-2xl font-bold", getScoreColor(analysis.score))}>
              {analysis.score}%
            </span>
          </div>
          <Progress 
            value={analysis.score} 
            className={cn(
              "h-2",
              analysis.score >= 90 ? "bg-green-500" :
              analysis.score >= 70 ? "bg-yellow-500" :
              "bg-red-500"
            )}
          />
          <CardDescription>
            {analysis.score >= 90 ? (
              <span className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Excellent writing quality!
              </span>
            ) : analysis.score >= 70 ? (
              "Good writing quality with some room for improvement"
            ) : (
              "Several issues found that need attention"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Issues by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Issues</CardTitle>
          <CardDescription>
            Found {analysis.issues.length} issues in your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(analysis.categorizedIssues).map(([category, issues]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={getCategoryColor(category) as any}>
                  {category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                </span>
              </div>
              <div className="space-y-3 pl-4">
                {issues.map((issue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium">{issue.message}</div>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <div className="font-mono">
                        {issue.context.text.substring(0, issue.context.offset)}
                        <span className="bg-yellow-200 dark:bg-yellow-900">
                          {issue.context.text.substr(issue.context.offset, issue.context.length)}
                        </span>
                        {issue.context.text.substring(issue.context.offset + issue.context.length)}
                      </div>
                    </div>
                    {issue.replacements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">Suggestions:</span>
                        {issue.replacements.slice(0, 3).map((replacement, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50">
                            {replacement}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Fixes</CardTitle>
          <CardDescription>
            Quick suggestions to improve your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
