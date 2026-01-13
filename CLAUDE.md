# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for **Sam Hayek** — artist, musician, and brand designer.
- **Live site**: https://samhayek.com
- **Sanity Studio**: https://samhayek.sanity.studio
- **Repo**: https://github.com/samhayek-code/samhayek-site

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **CMS**: Sanity v3 with GROQ queries
- **Rich Text**: `@portabletext/react`
- **Images**: `@sanity/image-url` for transforms
- **Video**: MUX (`sanity-plugin-mux-input` + `@mux/mux-player-react`)
- **Deployment**: Vercel (auto-deploys on push to main)

## Sanity CMS

**Project ID**: `jpxmevq8`
**Dataset**: `production`

### Schema Fields (archiveItem)

| Field | Type | Description |
|-------|------|-------------|
| title | string | Required |
| slug | slug | Required, auto-generated from title |
| type | string | Music, Art, Writing, Downloads, Tools, Shop, Design, Connect, Lab |
| label | string | E.g., "Branding", "Single", "Product", "Collection" |
| cta | string | Button text |
| order | number | Sort priority (lower = first, 100+ = end) |
| date | date | For chronological sorting |
| year | string | Display year on card |
| price | string | For Shop/Design items |
| description | text | Shown in modal |
| body | portable text | Rich text content |
| coverImage | image | Card thumbnail + modal display |
| gallery | array of images | Additional images for collections |
| embedUrl | url | Spotify/YouTube embed |
| externalUrl | url | External link (Tools) |
| lemonSqueezyUrl | url | Checkout overlay (Shop) |
| videoUrl | url | Legacy Cloudinary video URL (deprecated) |
| muxVideo | mux.video | MUX video asset (preferred) |
| figmaUrl | url | Figma file embed |
| prototypeUrl | url | Figma prototype link |
| fileAsset | file | Downloadable file (PDF, etc.) |
| collectionPieces | array | Poetry/art collections with image + text |
| collectionBanner | image | Banner for collection intro |
| merchGallery | array of images | Merch photos for collections |

### Content Types

| Type | Label Examples | CTA | Color | Modal Behavior |
|------|----------------|-----|-------|----------------|
| Design | Branding, Product | View | #60a5fa | Gallery display, Figma embed, no CTA |
| Music | Single, EP, Album | Listen | #ffffff | Spotify/YouTube embed |
| Art | Digital, Collection | View | #a3e635 | Gallery display, lightbox |
| Writing | Essay, Poetry, Collection | Read | #fbbf24 | Body text, CTA hidden |
| Tools | Generator, Utility | Use Tool | #f472b6 | External URL |
| Downloads | Wallpaper, Preset | Download | #a78bfa | File download |
| Shop | Print, Merch | Buy | #f87171 | Lemon Squeezy checkout |
| Connect | 30 min, Async, Donate | Schedule/Write | #34d399 | Cal.com/YouForm embed, wallets |
| Lab | Experiment | View | #06b6d4 | Cross-disciplinary work |

### Navigation Order

Everything → Design → Music → Art → Writing → Tools → Downloads → Shop → Connect

(Lab exists in schema but hidden from navigation)

## Key Features

### Modal System

**Art & Design types:**
- Full-width gallery display (no cropped hero)
- Cover image + gallery images shown in sequence
- Lightbox: click any image to zoom full-screen
- Arrow key navigation between images
- Image counter ("3 / 10") for collections
- CTA button hidden

**Figma embeds (Design type):**
- `figmaUrl` renders interactive file viewer (500px height)
- `prototypeUrl` shows "View Prototype" button below embed
- File must be set to "Anyone with the link can view"

**Collection modals (Writing):**
- Intro screen with description
- Carousel of pieces (image + poem text)
- Optional merch gallery grid at end
- Keyboard navigation (arrow keys)
- Uses `collectionPieces` and `merchGallery` fields

**Embed support:**
- Spotify: Auto-converts URLs to embed format (height: 152px)
- YouTube: Supports youtube.com/watch, youtu.be, youtube.com/shorts (height: 315px)

**Video support:**
- MUX integration via `muxVideo` field (preferred)
- Upload videos directly in Sanity Studio via MUX plugin
- MuxPlayer component with streaming, adaptive quality
- Legacy Cloudinary fallback via `videoUrl` for old content

**Special slugs:**
- `send-message`: YouForm contact embed
- `book-a-call`: Cal.com booking embed
- `samhayek-com`: Case study with rich text
- `support`: Crypto wallet addresses with QR codes
- `resume`: PDF download + formatted resume text

### Cards

- Full-bleed background images with blur effect
- Blur removes + brightness increases on hover
- Type-colored accent gradients on hover
- Sound effects (when enabled)
- Writing cards: Blurred text preview as background
- Connect cards: Custom icons with unique hover colors

### Connect Card Icons

| Slug | Icon | Hover Color |
|------|------|-------------|
| book-a-call | Calendar | #fbbf24 (yellow) |
| send-message | Chat | #60a5fa (blue) |
| support | Dollar | #34d399 (green) |
| resume | Document | #a78bfa (purple) |

### Responsive Design

- Breakpoint: `lg:` (1024px)
- Desktop: Nav row, keyboard navigation, sound toggle
- Mobile: 3x3 nav grid, touch-friendly sizing, tighter modal padding
- Modal: `p-4 lg:p-12` backdrop, `p-5 lg:p-8` content

## Current Content

### Design
- Fanfly (Product, 2024) — Figma embed + prototype
- samhayek.com (Case Study, 2025)
- Headphone Homies (Branding, 2022)
- Pro2tect (Branding, 2020)
- Growtheory (Branding, 2015)

### Art
- Surrender to the Dream World (2025)
- Andrea, Deception, Dream, Mortality, Sub-Atomic, Peace of Mind, Archangel Symbiosis, Spiral
- Elements (Collection, 5 pieces)
- Inter-spectra (2023)
- Evolution (2022)
- Oceanic (2021)
- Propaganda

### Writing
- Heartbreaks & Dreamstates (Collection, 8 poems + merch)

### Music
- Fine (like this) (2024)
- Passport (2024)

### Connect
- Book a Call (Cal.com)
- Send a Message (YouForm)
- Support (Crypto wallets)
- Resume (PDF download)

### Other
- Baseline (Tools)
- Circadian Journal (Downloads)

## Common Commands

```bash
# Development
npm run dev          # Start Next.js (localhost:3000)
npm run sanity       # Start Sanity Studio locally

# Deploy
git add . && git commit -m "message" && git push origin main

# Deploy Sanity Studio
npx sanity deploy

# Export Sanity content (backup)
npx sanity dataset export production ./backups/sanity-backup.tar.gz
```

## CLI Content Management

```bash
# Get token
TOKEN=$(grep SANITY_API_TOKEN .env.local | cut -d= -f2)

# Upload image
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/assets/images/production" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @image.jpg

# Create item
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/mutate/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mutations": [{"create": {...}}]}'

# Update item
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/mutate/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mutations": [{"patch": {"id": "DOC_ID", "set": {...}}}]}'

# Query items
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/query/production" \
  -G --data-urlencode "query=*[_type == 'archiveItem']{title, slug}" \
  -H "Authorization: Bearer $TOKEN"
```

## Environment Variables

```bash
# .env.local (gitignored)
NEXT_PUBLIC_SANITY_PROJECT_ID=jpxmevq8
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token>

# MUX Video
MUX_TOKEN_ID=<mux-token-id>
MUX_TOKEN_SECRET=<mux-token-secret>
SANITY_STUDIO_MUX_TOKEN_ID=<mux-token-id>
SANITY_STUDIO_MUX_TOKEN_SECRET=<mux-token-secret>
```

## Design Tokens

- **Background**: #0a0a0a
- **Surface**: #131313
- **Border**: #1a1a1a / #2a2a2a (hover)
- **Text**: #f0f0f0
- **Muted**: #777
- **Subtle**: #555
- **Fonts**: Plus Jakarta Sans (sans), IBM Plex Mono (mono)

## Type Colors

| Type | Dot | Background |
|------|-----|------------|
| Everything | #e5e5e5 | rgba(255,255,255,0.05) |
| Music | #ffffff | rgba(255,255,255,0.08) |
| Art | #a3e635 | rgba(163,230,53,0.08) |
| Writing | #fbbf24 | rgba(251,191,36,0.08) |
| Downloads | #a78bfa | rgba(167,139,250,0.08) |
| Tools | #f472b6 | rgba(244,114,182,0.08) |
| Shop | #f87171 | rgba(248,113,113,0.08) |
| Design | #60a5fa | rgba(96,165,250,0.08) |
| Connect | #34d399 | rgba(52,211,153,0.08) |
| Lab | #06b6d4 | rgba(6,182,212,0.08) |

## UI Features

- **Custom cursors**: White circle (default), smaller on interactive elements, hidden on touch
- **Grid background**: Square pattern at ~5% opacity
- **Card noise**: Subtle grain texture at ~4% opacity
- **Writing cards**: Blurred text preview of body/description as background
- **Connect cards**: Custom SVG icons with per-card hover colors

## Card Ordering

Cards sort by `order` ASC, then `date` DESC (newest first).

| Order Value | Behavior |
|-------------|----------|
| -10 | Pinned to top |
| 0 (default) | Sorts by date |
| 100+ | Pushed to bottom |

## External Services

- **Vercel**: Hosting + auto-deploy from main branch
- **Sanity**: Headless CMS (hosted studio at samhayek.sanity.studio)
- **MUX**: Video hosting + streaming (replaced Cloudinary)
- **Lemon Squeezy**: Checkout overlay for Shop items (pending approval)
- **Cal.com**: Booking embed
- **YouForm**: Contact form embed
- **Figma**: Design file embeds

## Wallet Addresses (Support card)

- **SOL**: HCvLdXCkmN4CFMwjPYAuvdLduNJYP53ziiQuCYiKdzkJ
- **ETH**: 0x35ccffF3e9bA23EA6FD6030aE24C4fc7032E23d1
- **BTC**: bc1qwsr58r24ckt2dc0p2aa2qc8gp6punt7t4tdsea
