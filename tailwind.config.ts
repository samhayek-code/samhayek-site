import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#e5e5e5',
        muted: '#666',
        subtle: '#444',
        border: '#151515',
        'border-hover': '#222',
        // Type colors
        'type-music': '#ffffff',
        'type-art': '#a3e635',
        'type-writing': '#fbbf24',
        'type-downloads': '#a78bfa',
        'type-tools': '#f472b6',
        'type-shop': '#f87171',
        'type-design': '#60a5fa',
        'type-chat': '#34d399',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
