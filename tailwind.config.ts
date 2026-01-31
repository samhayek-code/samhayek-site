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
        'border-subtle': 'var(--border-subtle)',
        'surface-elevated': 'var(--surface-elevated)',
        depth: 'var(--depth)',
        'accent-primary': 'var(--accent-primary)',
        'text-muted': 'var(--text-muted)',
        // Category colors (from design system)
        'type-design': '#E85907',
        'type-music': '#8B5CF6',
        'type-art': '#EC4899',
        'type-writing': '#3B82F6',
        'type-tools': '#22C55E',
        'type-downloads': '#F59E0B',
        'type-shop': '#06B6D4',
        'type-connect': '#EF4444',
      },
      fontFamily: {
        sans: ['Google Sans Flex', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.03em',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
