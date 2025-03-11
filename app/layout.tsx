import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
