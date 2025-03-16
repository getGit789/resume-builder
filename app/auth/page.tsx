"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { status } = useSession()
  
  // Get the callback URL from the query parameters
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  
  // Redirect to callback URL if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleContinueAsGuest = () => {
    // Set a flag in localStorage to indicate guest mode
    localStorage.setItem("guestMode", "true")
    
    // Also set a cookie for the middleware
    document.cookie = "guestMode=true; path=/; max-age=86400"
    
    // Show a toast notification
    toast({
      title: "Guest Mode Activated",
      description: "You're continuing as a guest. Your data will not be saved between sessions.",
      duration: 5000,
    })
    
    // Redirect to the builder page or callback URL
    router.push(callbackUrl.startsWith("/builder") ? callbackUrl : "/builder")
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In or Create Account</CardTitle>
          <CardDescription>
            Create professional resumes in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={() => router.push(callbackUrl)} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleContinueAsGuest}
          >
            Continue as Guest
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Guest users can create and export resumes, but data won't be saved between sessions.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 