"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { GuestModeButton } from "@/components/auth/guest-mode-button"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Define error types
const AUTH_ERROR_MESSAGES: Record<string, { title: string; description: string; type: "error" | "warning" }> = {
  default: {
    title: "Authentication Error",
    description: "There was a problem signing you in. Please try again.",
    type: "error"
  },
  Signin: {
    title: "Sign-in Failed",
    description: "The sign-in attempt was unsuccessful. Please check your credentials.",
    type: "error"
  },
  OAuthSignin: {
    title: "OAuth Sign-in Failed",
    description: "There was a problem initializing OAuth sign-in. This may be due to cookies being blocked.",
    type: "error"
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "There was a problem processing the OAuth callback. Try enabling cookies in your browser settings.",
    type: "error"
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description: "We couldn't create a user account with the OAuth provider.",
    type: "error"
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another account. Please sign in using your original provider.",
    type: "warning"
  },
  cors: {
    title: "Browser Security Restriction",
    description: "Your browser might be blocking third-party cookies needed for Google authentication.",
    type: "warning"
  }
};

// Loading component for suspense fallback
function AuthPageLoading() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

// Main component that uses searchParams
function AuthPageContent() {
  const [activeTab, setActiveTab] = useState<string>("login")
  const [errorInfo, setErrorInfo] = useState<{title: string; description: string; type: "error" | "warning"} | null>(null)
  const [showError, setShowError] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  // Get the callback URL for post-login redirect
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  
  // Check for auth errors
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      const errorMessage = AUTH_ERROR_MESSAGES[errorParam] || AUTH_ERROR_MESSAGES.default
      setErrorInfo(errorMessage)
      setShowError(true)
    }
  }, [searchParams])
  
  // Detect CORS errors
  useEffect(() => {
    const detectCorsIssues = (event: ErrorEvent) => {
      if (
        event.message.includes('blocked by CORS policy') ||
        event.message.toLowerCase().includes('cookie') ||
        event.message.toLowerCase().includes('third party') ||
        (event.filename && event.filename.includes('accounts.google.com'))
      ) {
        setErrorInfo(AUTH_ERROR_MESSAGES.cors)
        setShowError(true)
        event.preventDefault();
        return true;
      }
      return false;
    };
    
    window.addEventListener('error', detectCorsIssues);
    return () => window.removeEventListener('error', detectCorsIssues);
  }, []);
  
  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])
  
  // If the user is being redirected from the guest mode button, show the sign up tab
  useEffect(() => {
    const fromGuest = searchParams?.get("fromGuest")
    if (fromGuest === "true") {
      setActiveTab("signup")
    }
  }, [searchParams])
  
  // While we're checking the session, show a loading state
  if (status === "loading") {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Create and manage your professional resumes
          </CardDescription>
        </CardHeader>
        
        {showError && errorInfo && (
          <div className="px-6 pb-2">
            <Alert variant={errorInfo.type === "error" ? "destructive" : "default"} className="relative">
              <div className="absolute right-2 top-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full" 
                  onClick={() => setShowError(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {errorInfo.type === "error" ? 
                <AlertCircle className="h-4 w-4" /> : 
                <AlertTriangle className="h-4 w-4" />
              }
              <AlertTitle>{errorInfo.title}</AlertTitle>
              <AlertDescription>
                {errorInfo.description}
                {errorInfo.type === "warning" && errorInfo.title.includes("Browser") && (
                  <p className="text-xs mt-1">
                    <Link href="/auth/error" className="underline">
                      Click here for troubleshooting steps
                    </Link>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent>
          <div className="grid gap-4">
            <GoogleAuthButton 
              callbackUrl={callbackUrl}
              className="w-full"
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onSuccess={() => router.push(callbackUrl)} callbackUrl={callbackUrl} />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm onSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try without an account
              </span>
            </div>
          </div>
          <GuestModeButton className="w-full" />
          <p className="text-xs text-center text-muted-foreground">
            Guest users can create and export resumes, but data won't be saved between sessions.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main component wrapped with Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthPageContent />
    </Suspense>
  )
} 