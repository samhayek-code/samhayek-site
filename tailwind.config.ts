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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        // Type colors (same in both modes)
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
        sans: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
