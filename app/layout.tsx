import type { Metadata } from 'next'
import { Inter, Open_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { NextAuthProvider } from '@/components/auth/next-auth-provider'
import { Header } from '@/components/header'

// Load fonts with Next.js
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'Create professional resumes with ease',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${openSans.variable} antialiased`} suppressHydrationWarning>
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
            </ThemeProvider>
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  )
}
