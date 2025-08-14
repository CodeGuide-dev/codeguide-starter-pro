import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'CodeGuide - AI-Powered Code Development Platform',
  description: 'Elevate your coding experience with AI-powered insights, real-time suggestions, and intelligent code analysis. Transform how you write, review, and optimize code with CodeGuide.',
  keywords: 'code analysis, AI programming, development tools, code review, programming assistant, software development, code optimization',
  authors: [{ name: 'CodeGuide Team' }],
  creator: 'CodeGuide',
  publisher: 'CodeGuide',
  robots: 'index, follow',
  openGraph: {
    title: 'CodeGuide - AI-Powered Code Development Platform',
    description: 'Revolutionize your development workflow with AI-powered code analysis, real-time suggestions, and intelligent programming assistance.',
    url: 'https://codeguide.dev',
    siteName: 'CodeGuide',
    type: 'website',
    images: [
      {
        url: '/codeguide-logo.png',
        width: 1200,
        height: 630,
        alt: 'CodeGuide - AI-Powered Development Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeGuide - AI-Powered Code Development Platform',
    description: 'Transform your coding experience with intelligent AI-powered development tools.',
    images: ['/codeguide-logo.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TanstackClientProvider>{children}</TanstackClientProvider>
      </body>
    </html>
  )
}
