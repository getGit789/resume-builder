import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfessionalTemplate } from "@/components/templates/professional"
import { MinimalistTemplate } from "@/components/templates/minimalist"
import { ModernTemplate } from "@/components/templates/modern"
import { defaultResumeData } from "@/lib/default-data"

export default function TemplatesPage() {
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Resume Templates</h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose from our professionally designed templates to create your perfect resume
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-[3/4] overflow-hidden border-t border-b">
                    <div className="h-full w-full p-4 transform scale-[0.6] origin-top">
                      <ProfessionalTemplate data={defaultResumeData} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Link href="/builder?template=professional" className="w-full">
                    <Button className="w-full">Use Template</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Minimalist</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-[3/4] overflow-hidden border-t border-b">
                    <div className="h-full w-full p-4 transform scale-[0.6] origin-top">
                      <MinimalistTemplate data={defaultResumeData} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Link href="/builder?template=minimalist" className="w-full">
                    <Button className="w-full">Use Template</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Modern</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-[3/4] overflow-hidden border-t border-b">
                    <div className="h-full w-full p-4 transform scale-[0.6] origin-top">
                      <ModernTemplate data={defaultResumeData} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Link href="/builder?template=modern" className="w-full">
                    <Button className="w-full">Use Template</Button>
                  </Link>
                </CardFooter>
              </Card>
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

