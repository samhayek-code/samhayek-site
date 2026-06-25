import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import ScrollBlur from '@/components/ScrollBlur'

export const metadata: Metadata = {
  title: 'Sam Hayek | Artist + Designer',
  description: 'Building with sound, light, language, and code.',
  metadataBase: new URL('https://samhayek.com'),
  openGraph: {
    title: 'Sam Hayek | Artist + Designer',
    description: 'Building with sound, light, language, and code.',
    url: 'https://samhayek.com',
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

// Script to prevent flash of wrong theme on load
const themeScript = `
  (function() {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        document.documentElement.classList.add('light');
      }
      // No saved preference → dark by default.
      // Card-style swap: apply the saved preference before paint (no flash)
      if (localStorage.getItem('cardInvert') === 'true') {
        document.documentElement.classList.add('cards-invert');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Geist+Mono:wght@100..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=sentient@400,500,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <CustomCursor />
        <div className="iso-grid" />
        <div className="noise-overlay" />
        {children}
        <ScrollBlur />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
