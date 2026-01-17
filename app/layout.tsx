import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'

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
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
    } else if (!saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDark) {
        document.documentElement.classList.add('light');
      }
    }
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <CustomCursor />
        <div className="iso-grid" />
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
