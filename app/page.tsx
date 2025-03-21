"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { ArrowRight, CheckCircle2, MousePointerClick, FileDown, PenLine } from "lucide-react"
import Image from "next/image"
import { FeatureComparison } from "@/components/feature-comparison"

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const handleGuestAccess = () => {
    router.push("/builder?guest=true")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center py-24 md:py-32">
            {/* Left content */}
            <div className="w-full lg:w-1/2 space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Create a professional <span className="text-accent-red">resume</span> in minutes
                  </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl">
                Craft standout resumes that get you noticed. Easy to use, modern templates, and AI-powered suggestions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {session ? (
                  <Button className="h-12 px-8 text-base rounded-md bg-accent-red hover:bg-accent-red/90 text-white transition-all hover:shadow-md hover:scale-[1.03]" asChild>
                    <Link href="/builder">
                      Start Building <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -top-8 left-0 w-full overflow-hidden h-6">
                        <div className="flex justify-center">
                          <div className="typing-animation text-accent-red font-medium">
                            Create Now
                          </div>
                        </div>
                </div>
                      <Button className="h-12 px-8 text-base rounded-md bg-accent-red hover:bg-accent-red/90 text-white transition-all hover:shadow-md hover:scale-[1.03]" onClick={() => signIn()}>
                        Sign In to Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    </div>
                    <Button variant="outline" className="h-12 px-8 text-base rounded-md border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:shadow-sm hover:scale-[1.03]" onClick={handleGuestAccess}>
                      Continue as Guest
                    </Button>
                  </>
                )}
              </div>
                </div>
            
            {/* Right content - Resume Preview */}
            <div className="w-full lg:w-1/2 mt-12 lg:mt-0 animate-slide-in-right">
              <div 
                className="relative shadow-2xl rounded-lg overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500 group hover:shadow-xl border-trace"
              >
                {/* Ink drop effects */}
                <div className="ink-drop-container">
                  <div className="ink-drop ink-drop-1"></div>
                  <div className="ink-drop ink-drop-2"></div>
                  <div className="ink-drop ink-drop-3"></div>
                  <div className="ink-drop ink-drop-4"></div>
                </div>
                
                <div className="w-full aspect-[3/4] bg-white dark:bg-gray-800 relative p-8 overflow-hidden rounded-lg">
                  <div className="flex flex-col h-full">
                    {/* Header with highlight animation */}
                    <div className="border-b pb-4 mb-4 relative">
                      <div className="h-10 w-3/4 rounded-sm bg-gray-200 dark:bg-gray-700 mb-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-accent-red/10 animate-section-highlight-1"></div>
                      </div>
                      <div className="h-6 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                    
                    <div className="flex-grow space-y-6">
                      {/* Experience section with highlight animation */}
                      <div className="space-y-2">
                        <div className="h-5 w-24 bg-accent-red/30 rounded-sm"></div>
                        <div className="pl-4 border-l-2 border-accent-red/20 relative">
                          <div className="absolute inset-0 bg-accent-red/10 animate-section-highlight-2"></div>
                          <div className="h-5 w-3/5 bg-gray-200 dark:bg-gray-700 rounded-sm mb-1"></div>
                          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-sm mb-1"></div>
                          <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                        </div>
                      </div>
                      
                      {/* Education section with highlight animation */}
                            <div className="space-y-2">
                        <div className="h-5 w-24 bg-accent-red/30 rounded-sm"></div>
                        <div className="pl-4 border-l-2 border-accent-red/20 relative">
                          <div className="absolute inset-0 bg-accent-red/10 animate-section-highlight-3"></div>
                          <div className="h-5 w-3/5 bg-gray-200 dark:bg-gray-700 rounded-sm mb-1"></div>
                          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-sm mb-1"></div>
                          <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills section */}
                    <div className="mt-4">
                      <div className="h-5 w-16 bg-accent-red/30 rounded-sm mb-2"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Features section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: "0.1s"}}>
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mb-6">
                <PenLine className="w-6 h-6 text-accent-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Editing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simple and intuitive interface to add and edit your resume information with real-time preview.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: "0.2s"}}>
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mb-6">
                <MousePointerClick className="w-6 h-6 text-accent-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multiple Templates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from various professional templates that are designed for different industries and career levels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: "0.3s"}}>
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mb-6">
                <FileDown className="w-6 h-6 text-accent-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3">One-Click Export</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Export your finished resume in PDF, DOCX, or share online with a direct link in just one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <FeatureComparison />

      {/* Guest Mode Info */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Build without signing in</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our guest mode lets you create, customize, and export resumes without creating an account. 
                Perfect for quickly creating a one-time resume.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Create and customize</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Design your resume with our templates, fonts, and color themes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Export to PDF and DOCX</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Download your resume in multiple formats for job applications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">No account required</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Zero signup process - just start building right away
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="h-12 px-6 text-base rounded-md bg-accent-red hover:bg-accent-red/90 text-white" onClick={handleGuestAccess}>
                  Try Guest Mode <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-center">Want more features?</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span>ATS Compatibility Check</span>
                  <span className="text-sm px-2 py-1 bg-accent-red/10 text-accent-red rounded">Premium</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span>AI-Powered Content Suggestions</span>
                  <span className="text-sm px-2 py-1 bg-accent-red/10 text-accent-red rounded">Premium</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span>Grammar Checking</span>
                  <span className="text-sm px-2 py-1 bg-accent-red/10 text-accent-red rounded">Premium</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span>Auto-Save & Cloud Storage</span>
                  <span className="text-sm px-2 py-1 bg-accent-red/10 text-accent-red rounded">Premium</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span>Multiple Resume Versions</span>
                  <span className="text-sm px-2 py-1 bg-accent-red/10 text-accent-red rounded">Premium</span>
                </div>
              </div>
              
              <Button className="w-full h-12" onClick={() => signIn()}>
                Sign In for Premium Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What our users say</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 animate-fade-in" style={{animationDelay: "0.1s"}}>
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-gray-500">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">
                "This resume builder helped me create a professional resume in under 30 minutes. I got called for an interview the next day!"
              </p>
            </div>
              
            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 animate-fade-in" style={{animationDelay: "0.2s"}}>
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold">Jane Smith</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">
                "The templates are modern and clean. I love how easy it is to switch between different designs while keeping all my information."
              </p>
            </div>
              
            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 animate-fade-in" style={{animationDelay: "0.3s"}}>
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-semibold">RB</span>
                </div>
                <div>
                  <p className="font-semibold">Robert Brown</p>
                  <p className="text-sm text-gray-500">Marketing Specialist</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">
                "As a marketing professional, I needed a resume that stands out. This tool gave me exactly what I needed with minimal effort."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent-red text-white">
        <div className="container px-4 mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">Ready to build your professional resume?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in">
            Join thousands of job seekers who have successfully landed their dream jobs with our resume builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            {session ? (
              <Button className="h-12 px-8 text-base rounded-md bg-white text-accent-red hover:bg-gray-100" asChild>
                <Link href="/builder">
                  Create Your Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button className="h-12 px-8 text-base rounded-md bg-white text-accent-red hover:bg-gray-100" onClick={() => signIn()}>
                  Sign In <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="h-12 px-8 text-base rounded-md border-white bg-transparent hover:bg-white/10" onClick={handleGuestAccess}>
                  Continue as Guest
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Resume Builder</h3>
              <p className="text-sm">Create professional resumes in minutes</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/builder" className="hover:text-white transition-colors">
                Resume Creator
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

