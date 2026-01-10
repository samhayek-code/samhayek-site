import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sam Hayek | Artist + Designer',
  description: 'Building with sound, light, language, and code.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
