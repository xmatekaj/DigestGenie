import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'DigestGenie - Your AI Newsletter Genie',
    template: '%s | DigestGenie'
  },
  description: 'Organize, summarize, and simplify your newsletters with AI magic. DigestGenie grants three wishes: automatic organization, instant summaries, and time savings.',
  keywords: [
    'newsletter',
    'ai',
    'email organization', 
    'digest',
    'summarization',
    'productivity',
    'inbox management',
    'newsletter aggregator'
  ],
  authors: [{ name: 'DigestGenie Team' }],
  creator: 'DigestGenie',
  publisher: 'DigestGenie',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://digestgenie.com',
    siteName: 'DigestGenie',
    title: 'DigestGenie - Your AI Newsletter Genie',
    description: 'Organize, summarize, and simplify your newsletters with AI magic.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DigestGenie - AI Newsletter Organization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigestGenie - Your AI Newsletter Genie',
    description: 'Organize, summarize, and simplify your newsletters with AI magic.',
    images: ['/twitter-image.png'],
    creator: '@digestgenie',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}