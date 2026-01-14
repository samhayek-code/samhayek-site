# CLAUDE.md

Project guide for Claude Code when working with this repository.

## Project Overview

Personal portfolio site for **Sam Hayek** - artist, musician, and brand designer.

- **Live site**: https://samhayek.com
- **Sanity Studio**: https://samhayek.sanity.studio
- **Repo**: https://github.com/samhayek-code/samhayek-site

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS + CSS variables for theming |
| Fonts | Google Sans Flex (sans), IBM Plex Mono Medium (mono) |
| CMS | Sanity v3 with GROQ queries |
| Rich Text | @portabletext/react |
| Images | @sanity/image-url |
| Video | MUX (sanity-plugin-mux-input + @mux/mux-player-react) |
| Animations | anime.js |
| Deployment | Vercel (auto-deploys on push to main) |

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run sanity       # Start Sanity Studio locally
npx sanity deploy    # Deploy Sanity Studio

# Deploy site
git add . && git commit -m "message" && git push origin main
```

## Project Structure

```
├── app/
│   ├── globals.css      # CSS variables, theme definitions
│   ├── layout.tsx       # Root layout with theme flash prevention
│   └── page.tsx         # Home page (fetches from Sanity)
├── components/
│   ├── HomeClient.tsx   # Main client component (state, filtering, sound)
│   ├── NavBar.tsx       # Navigation with filter tabs + theme toggle
│   ├── PageHeader.tsx   # Dynamic header based on active filter
│   ├── ArchiveGrid.tsx  # Card grid layout
│   ├── Card.tsx         # Individual card with hover effects
│   ├── Modal.tsx        # Detail view with embeds, galleries, checkout
│   ├── CustomCursor.tsx # Custom cursor element
│   ├── LiveClock.tsx    # Footer clock display
│   └── WalletButton.tsx # Crypto wallet copy button (Support modal)
├── lib/
│   ├── sanity.ts        # Sanity client + GROQ queries
│   └── types.ts         # TypeScript types + constants
└── sanity/
    └── schemaTypes/     # Sanity schema definitions
```

## Theming

The site supports dark and light modes via CSS variables.

**Theme toggle**: NavBar sun/moon button
**Persistence**: localStorage + system preference fallback
**Flash prevention**: Inline script in layout.tsx `<head>`

### Key CSS Variables (globals.css)

| Variable | Dark | Light |
|----------|------|-------|
| --background | #0a0a0a | #f5f5f5 |
| --foreground | #f0f0f0 | #0a0a0a |
| --surface | #131313 | #ffffff |
| --border | #1a1a1a | #e0e0e0 |
| --muted | #777777 | #666666 |
| --subtle | #555555 | #888888 |

Theme class is applied to `<html>` element: `:root` (dark) or `:root.light`

## Content Types

Cards are stored as `archiveItem` in Sanity. Each type has unique modal behavior:

| Type | Color | Modal Behavior |
|------|-------|----------------|
| Design | #60a5fa | Gallery with lightbox, Figma embed, prototype link |
| Music | #ffffff | Spotify/YouTube embed |
| Art | #a3e635 | Gallery with lightbox |
| Writing | #fbbf24 | Body text (Portable Text), no CTA |
| Tools | #f472b6 | External URL |
| Downloads | #a78bfa | File download |
| Shop | #f87171 | Lemon Squeezy checkout overlay |
| Connect | #34d399 | Cal.com booking or YouForm embed |
| Lab | #06b6d4 | Cross-disciplinary (hidden from nav) |

### Special Slugs

- `send-message` - YouForm contact embed
- `book-a-call` - Cal.com booking embed
- `support` - Crypto wallet QR codes
- `samhayek-com` - Case study with rich text body

## Card Ordering

Cards sort by `order` ASC, then `date` DESC.

| Order Value | Effect |
|-------------|--------|
| -10 | Pinned to top |
| 0 (default) | Sorts by date |
| 100+ | Pushed to bottom |

## Key Patterns

### Modal Content Rendering

```tsx
// Gallery types (Art, Design) - full-width images
{isGalleryType && <GalleryDisplay />}

// Collections (Writing) - carousel with pieces
{isCollection && <CollectionCarousel />}

// Embeds (Music) - iframe
{item.embedUrl && <EmbedIframe />}

// Rich text (Case studies)
{item.body && <PortableText value={item.body} />}
```

### Theme-Aware Components

Components receive `theme` prop from HomeClient:
```tsx
<Card item={item} theme={theme} />
```

Use CSS variables for colors:
```tsx
style={{ color: 'var(--foreground)' }}
className="text-foreground bg-background"
```

### Card Animations

- Entrance: Staggered fade-up via CSS animation with `--entrance-delay`
- Hover: Border glow via anime.js SVG animation
- Images: Blur/opacity transition on hover

## Sanity Schema Fields

| Field | Type | Usage |
|-------|------|-------|
| title | string | Card title |
| slug | slug | URL/identifier |
| type | string | Content category |
| label | string | Badge text (e.g., "Branding") |
| cta | string | Button text |
| order | number | Sort priority |
| date | date | Chronological sort |
| year | string | Display year |
| price | string | For Shop items |
| description | text | Modal description |
| body | portable text | Rich content |
| coverImage | image | Card + modal hero |
| gallery | image[] | Additional images |
| embedUrl | url | Spotify/YouTube |
| externalUrl | url | External link |
| lemonSqueezyUrl | url | Checkout overlay |
| whopPlanId | string | Whop checkout |
| muxVideo | mux.video | Video content |
| figmaUrl | url | Figma file embed |
| prototypeUrl | url | Prototype link |
| collectionPieces | array | Poetry/art pieces |
| merchGallery | image[] | Merch photos |

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=jpxmevq8
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token>

# MUX Video
MUX_TOKEN_ID=<token>
MUX_TOKEN_SECRET=<secret>
SANITY_STUDIO_MUX_TOKEN_ID=<token>
SANITY_STUDIO_MUX_TOKEN_SECRET=<secret>
```

## External Services

| Service | Purpose |
|---------|---------|
| Vercel | Hosting + auto-deploy |
| Sanity | Headless CMS |
| MUX | Video hosting |
| Lemon Squeezy | Shop checkout |
| Cal.com | Booking embed |
| YouForm | Contact form |
| Figma | Design embeds |

## Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | Google Sans Flex | Regular (400) |
| Body | Google Sans Flex | Light (300) / Regular (400) |
| Nav name | Google Sans Flex | Medium (500) |
| Labels/Mono | IBM Plex Mono | Medium (500) |
| Card titles | Google Sans Flex | Regular (400) |

Letter spacing: `-0.03em` (tracking-tighter) on headings

## Responsive Breakpoints

- Desktop: `lg:` (1024px+) - horizontal nav, keyboard navigation hints
- Mobile/Tablet: Below 1024px - 3x3 nav grid, touch-friendly sizing

## Common Tasks

### Adding a new content item
1. Open Sanity Studio (samhayek.sanity.studio)
2. Create new archiveItem
3. Set type, label, CTA, and relevant fields
4. Publish - site auto-updates via revalidation

### Modifying theme colors
1. Edit `app/globals.css`
2. Update both `:root` (dark) and `:root.light` sections
3. Use existing variable names where possible

### Adding a new filter category
1. Add to `filterCategories` array in `lib/types.ts`
2. Add color entry to `typeColors` object
3. Add header content to `headerContent` object
4. Add to Sanity schema if needed

## Wallet Addresses (Support card)

- **SOL**: HCvLdXCkmN4CFMwjPYAuvdLduNJYP53ziiQuCYiKdzkJ
- **ETH**: 0x35ccffF3e9bA23EA6FD6030aE24C4fc7032E23d1
- **BTC**: bc1qwsr58r24ckt2dc0p2aa2qc8gp6punt7t4tdsea
