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
        'type-downloads': '#F59E0B',
        'type-shop': '#06B6D4',
        'type-connect': '#EF4444',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
        display: ['Sentient', 'Georgia', 'Times New Roman', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tightest: '-0.02em',
      },
      // === SOFT SURFACE TOKENS — additive, never overwriting color/font keys ===
      borderRadius: {
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
        pill: 'var(--radius-pill)',
        btn: 'var(--radius-btn)',
        input: 'var(--radius-input)',
        chip: 'var(--radius-chip)',
        tag: 'var(--radius-tag)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      transitionTimingFunction: {
        'out-craft': 'cubic-bezier(0.2,0,0,1)',
        'in-craft': 'cubic-bezier(0.4,0,1,1)',
        spring: 'cubic-bezier(0.16,1,0.3,1)',
        wiggle: 'cubic-bezier(0.22,0.61,0.36,1)',
      },
      fontSize: {
        display: ['clamp(2.4rem,3.4vw,3.4rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        h2: ['1.9rem', { lineHeight: '1.12', letterSpacing: '-0.014em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.5', letterSpacing: '-0.008em' }],
        'body-d': ['0.9375rem', { lineHeight: '1.55', letterSpacing: '-0.004em' }],
        label: ['0.8125rem', { lineHeight: '1.3' }],
        overline: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.13em' }],
        'mono-d': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.002em' }],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
