import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="font-bold text-xl">
            ResumeForge
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/builder" className="text-sm font-medium">
              Builder
            </Link>
            <Link href="/templates" className="text-sm font-medium">
              Templates
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Create professional resumes in minutes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Build, customize, and export your resume with our intuitive editor. Choose from multiple templates
                    and see changes in real-time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/builder">
                    <Button size="lg" className="gap-1.5">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button size="lg" variant="outline">
                      View Templates
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px]">
                  <div className="absolute left-0 top-0 h-full w-full rounded-lg border bg-background shadow-lg">
                    <div className="flex h-full flex-col">
                      <div className="border-b p-4">
                        <div className="h-6 w-3/4 rounded-md bg-muted"></div>
                      </div>
                      <div className="flex flex-1 overflow-hidden">
                        <div className="w-1/2 border-r p-4">
                          <div className="space-y-3">
                            <div className="h-4 w-full rounded-md bg-muted"></div>
                            <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                            <div className="h-4 w-4/6 rounded-md bg-muted"></div>
                          </div>
                          <div className="mt-6 space-y-3">
                            <div className="h-4 w-full rounded-md bg-muted"></div>
                            <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                            <div className="h-4 w-4/6 rounded-md bg-muted"></div>
                          </div>
                        </div>
                        <div className="w-1/2 p-4">
                          <div className="h-full rounded-md border bg-card p-4 shadow-sm">
                            <div className="space-y-2">
                              <div className="h-6 w-3/4 rounded-md bg-muted"></div>
                              <div className="h-4 w-full rounded-md bg-muted"></div>
                              <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                              <div className="h-4 w-4/6 rounded-md bg-muted"></div>
                            </div>
                            <div className="mt-6 space-y-2">
                              <div className="h-5 w-1/2 rounded-md bg-muted"></div>
                              <div className="h-4 w-full rounded-md bg-muted"></div>
                              <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                            </div>
                            <div className="mt-6 space-y-2">
                              <div className="h-5 w-1/2 rounded-md bg-muted"></div>
                              <div className="h-4 w-full rounded-md bg-muted"></div>
                              <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Everything you need to create a professional resume
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 9h6" />
                    <path d="M9 15h6" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Real-time Preview</h3>
                  <p className="text-muted-foreground">
                    See changes to your resume in real-time with our split-screen editor.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="8" height="8" x="2" y="2" rx="2" />
                    <rect width="8" height="8" x="14" y="2" rx="2" />
                    <rect width="8" height="8" x="2" y="14" rx="2" />
                    <rect width="8" height="8" x="14" y="14" rx="2" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Multiple Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from Professional, Minimalist, and Modern templates to match your style.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">One-click Export</h3>
                  <p className="text-muted-foreground">Export your resume as a PDF with a single click.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 ResumeForge. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

