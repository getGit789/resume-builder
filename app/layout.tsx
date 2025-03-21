import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { NextAuthProvider } from '@/components/auth/next-auth-provider'
import Header from '@/components/header'
import ErrorBoundary from '@/components/error-boundary'
import { DebugPanel } from '@/components/debug-panel'

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'Create professional resumes with ease',
  generator: 'Next.js',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <NextAuthProvider>
            <Providers>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
                storageKey="resume-builder-theme"
              >
                <Header />
                <main>{children}</main>
                <Toaster />
                <DebugPanel />
              </ThemeProvider>
            </Providers>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
