export type ItemType =
  | 'Music'
  | 'Art'
  | 'Writing'
  | 'Downloads'
  | 'Tools'
  | 'Shop'
  | 'Design'
  | 'Connect'

export interface ArchiveItem {
  _id: string
  title: string
  slug: { current: string }
  type: ItemType
  label: string
  price?: string
  year?: string
  description: string
  body?: any // Portable Text
  cta: string
  coverImage?: any // Sanity image
  gallery?: any[] // Array of Sanity images
  embedUrl?: string
  externalUrl?: string
  lemonSqueezyUrl?: string
  videoUrl?: string
}

export const typeColors: Record<string, { dot: string; bg: string }> = {
  Everything: { dot: '#e5e5e5', bg: 'rgba(255,255,255,0.05)' },
  Music: { dot: '#ffffff', bg: 'rgba(255,255,255,0.08)' },
  Art: { dot: '#a3e635', bg: 'rgba(163,230,53,0.08)' },
  Writing: { dot: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  Downloads: { dot: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  Tools: { dot: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  Shop: { dot: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  Design: { dot: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  Connect: { dot: '#34d399', bg: 'rgba(52,211,153,0.08)' },
}

export const filterCategories = [
  'Everything',
  'Design',
  'Music',
  'Art',
  'Writing',
  'Tools',
  'Downloads',
  'Shop',
  'Connect',
]

// Helper to extract plain text from Portable Text (preserves line breaks)
export function extractPlainText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks
    .filter((block) => block._type === 'block')
    .map((block) => {
      if (!block.children) return ''
      return block.children
        .filter((child: any) => child._type === 'span')
        .map((span: any) => span.text)
        .join('')
    })
    .join('\n')
}

export const headerContent: Record<string, { title: string; subtitle: string }> = {
  Everything: {
    title: 'Artist + Designer',
    subtitle: 'Building with sound, light, language, and code.',
  },
  Music: {
    title: 'Soundwaves.',
    subtitle: 'The space between silence and meaning.',
  },
  Art: {
    title: 'Visual meditations.',
    subtitle: 'Paintings, mixed media, and explorations in form.',
  },
  Writing: {
    title: 'Language arts.',
    subtitle: 'Poetry, essays, and thoughts worth preserving.',
  },
  Downloads: {
    title: 'Take something with you.',
    subtitle: 'Free resources and digital products.',
  },
  Tools: {
    title: 'Built to be useful.',
    subtitle: 'Small utilities for designers and creators.',
  },
  Shop: {
    title: 'Own a piece.',
    subtitle: 'Limited edition prints, apparel, and physical goods.',
  },
  Design: {
    title: 'Identity + Function.',
    subtitle: 'Strategic systems for founders with vision.',
  },
  Connect: {
    title: "Let's chat.",
    subtitle: 'Building something?',
  },
}
