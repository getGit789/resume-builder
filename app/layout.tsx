import type { Metadata } from 'next'
import { Inter, Open_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { NextAuthProvider } from '@/components/auth/next-auth-provider'

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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${openSans.variable} light`}>
      <body className={inter.className} suppressHydrationWarning>
        <NextAuthProvider>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <SiteHeader />
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  )
}
