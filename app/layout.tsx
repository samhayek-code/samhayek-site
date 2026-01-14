import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import SplashCursor from '@/components/SplashCursor'

export const metadata: Metadata = {
  title: 'Sam Hayek | Artist + Designer',
  description: 'Building with sound, light, language, and code.',
  metadataBase: new URL('https://samhayek-site.vercel.app'),
  openGraph: {
    title: 'Sam Hayek | Artist + Designer',
    description: 'Building with sound, light, language, and code.',
    url: 'https://samhayek-site.vercel.app',
    siteName: 'Sam Hayek',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sam Hayek - Artist + Designer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sam Hayek | Artist + Designer',
    description: 'Building with sound, light, language, and code.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CustomCursor />
        <div className="iso-grid" />
        <SplashCursor />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
