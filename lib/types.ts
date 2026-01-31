export type ItemType =
  | 'Music'
  | 'Art'
  | 'Writing'
  | 'Downloads'
  | 'Tools'
  | 'Shop'
  | 'Design'
  | 'Connect'
  | 'Lab'

export interface CollectionPiece {
  _key: string
  title: string
  image: any // Sanity image
  poemText: string
}

export interface MuxVideoAsset {
  _type: 'mux.videoAsset'
  playbackId: string
  assetId: string
  status: string
}

export interface MuxVideo {
  _type: 'mux.video'
  asset: MuxVideoAsset
}

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
  whopPlanId?: string // Whop checkout plan ID
  muxVideo?: MuxVideo // MUX video asset
  figmaUrl?: string
  prototypeUrl?: string
  collectionPieces?: CollectionPiece[]
  collectionBanner?: any // Sanity image for collection intro
  merchGallery?: any[] // Array of Sanity images
}

export const typeColors: Record<string, { dot: string; bg: string }> = {
  Everything: { dot: '#E8E8E9', bg: 'rgba(232,232,233,0.05)' },
  Design: { dot: '#E85907', bg: '#E8590720' },
  Music: { dot: '#8B5CF6', bg: '#8B5CF620' },
  Art: { dot: '#EC4899', bg: '#EC489920' },
  Writing: { dot: '#3B82F6', bg: '#3B82F620' },
  Tools: { dot: '#22C55E', bg: '#22C55E20' },
  Downloads: { dot: '#F59E0B', bg: '#F59E0B20' },
  Shop: { dot: '#06B6D4', bg: '#06B6D420' },
  Connect: { dot: '#EF4444', bg: '#EF444420' },
  Lab: { dot: '#8B5CF6', bg: '#8B5CF620' },
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

// Card code prefix per type (e.g., D-001 for Design)
export const typeInitials: Record<string, string> = {
  Design: "D",
  Music: "M",
  Art: "A",
  Writing: "W",
  Tools: "T",
  Downloads: "L",
  Shop: "S",
  Connect: "C",
  Lab: "X",
};

export const headerContent: Record<string, { title: string; subtitle: string }> = {
  Everything: {
    title: 'Artist + Designer',
    subtitle: 'I build with pixels, ink, audio, and code.',
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
  Lab: {
    title: 'Experiments.',
    subtitle: 'Cross-disciplinary work that defies categorization.',
  },
}
