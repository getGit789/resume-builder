"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { GuestModeButton } from "@/components/auth/guest-mode-button"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { useSession } from "next-auth/react"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  // Get the callback URL for post-login redirect
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  
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