# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for **Sam Hayek** — artist, musician, and brand designer.
- **Live site**: https://samhayek-site.vercel.app
- **Domain**: samhayek.com (to be connected)
- **Sanity Studio**: https://samhayek.sanity.studio
- **Repo**: https://github.com/samhayek-code/samhayek-site

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **CMS**: Sanity v3 with GROQ queries
- **Rich Text**: `@portabletext/react`
- **Images**: `@sanity/image-url` for transforms
- **Video**: Cloudinary (native HTML5 player)
- **Deployment**: Vercel (auto-deploys on push to main)

## Sanity CMS

**Project ID**: `jpxmevq8`
**Dataset**: `production`

### Schema Fields (archiveItem)

| Field | Type | Description |
|-------|------|-------------|
| title | string | Required |
| slug | slug | Required, auto-generated from title |
| type | string | Music, Art, Writing, Downloads, Tools, Shop, Design, Connect |
| label | string | E.g., "Branding", "Single", "Digital", "Collection" |
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
| videoUrl | url | Cloudinary video URL |

### Content Types

| Type | Label Examples | CTA | Color | Modal Behavior |
|------|----------------|-----|-------|----------------|
| Design | Branding, Case Study | View | #60a5fa | Gallery display, no CTA button |
| Music | Single, EP, Album | Listen | #ffffff | Spotify/YouTube embed |
| Art | Digital, Collection | View | #a3e635 | Gallery display, no CTA button |
| Writing | Essay, Poetry | Read | #fbbf24 | YouTube embed supported |
| Tools | Generator, Utility | Use Tool | #f472b6 | External URL |
| Downloads | Wallpaper, Preset | Download | #a78bfa | |
| Shop | Print, Merch | Buy | #f87171 | Lemon Squeezy checkout |
| Connect | 30 min, Async | Schedule/Write | #34d399 | Cal.com/YouForm embed |

### Navigation Order

Everything → Design → Music → Art → Writing → Tools → Downloads → Shop → Connect

## Key Features

### Modal System

**Art & Design types:**
- Full-width gallery display (no cropped hero)
- Cover image + gallery images shown in sequence
- Lightbox: click any image to zoom full-screen
- Arrow key navigation between images
- Image counter ("3 / 10") for collections
- CTA button hidden

**Embed support:**
- Spotify: Auto-converts URLs to embed format (height: 152px)
- YouTube: Supports youtube.com/watch, youtu.be, youtube.com/shorts (height: 315px)

**Video support:**
- Cloudinary integration via `videoUrl` field
- Native HTML5 video player with controls
- Ready for Lab/experimental content

**Special slugs:**
- `send-message`: YouForm contact embed
- `book-a-call`: Cal.com booking embed
- `samhayek-com`: Case study with rich text

### Cards
- Full-bleed background images with blur effect
- Blur removes + brightness increases on hover
- Type-colored accent gradients on hover
- Sound effects (when enabled)

### Responsive Design
- Breakpoint: `lg:` (1024px)
- Desktop: Nav row, keyboard navigation, sound toggle
- Mobile: 3x3 nav grid, touch-friendly sizing

## Current Content

### Design
- samhayek.com (Case Study, 2025)
- Headphone Homies (Branding, 2022, 10 slides)
- Pro2tect (Branding, 2020, 10 slides)
- Growtheory (Branding, 2015, 10 slides)

### Art
- Surrender to the Dream World (2025)
- Elements (Collection, 5 pieces)
- Inter-spectra (2023)
- Evolution (2022)
- Oceanic (2021)
- Propaganda

### Music
- Fine (like this) (2024)
- Passport (2024)

### Other
- Baseline (Tools)
- Circadian Journal (Downloads)
- Book a Call, Send a Message (Connect)

## Future Plans

### Lab Section (Not yet built)
- New navigation item for experimental/cross-disciplinary work
- Audio/visual pieces, spoken poetry with video
- Will use Cloudinary video support
- Hybrid content that doesn't fit other categories

### Potential Enhancements
- Lazy loading images (when scaling to 100+ cards)
- Background shader (Three.js/Vanta.js)
- Search functionality

## Common Commands

```bash
# Development
npm run dev          # Start Next.js (localhost:3000)
npm run sanity       # Start Sanity Studio locally

# Deploy
git add . && git commit -m "message" && git push origin main

# Deploy Sanity Studio
npx sanity deploy
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
```

## Design Tokens

- **Background**: #0a0a0a
- **Surface**: #111111
- **Border**: #151515 / #222 (hover)
- **Text**: #e5e5e5
- **Muted**: #666
- **Fonts**: Plus Jakarta Sans (sans), IBM Plex Mono (mono)

## Card Ordering

Cards sort by `order` ASC, then `date` DESC (newest first).

| Order Value | Behavior |
|-------------|----------|
| -10 | Pinned to top |
| 0 (default) | Sorts by date |
| 100+ | Pushed to bottom |

## External Services

- **Cloudinary**: Video hosting (free tier: 25 credits/month)
- **Vercel**: Hosting + auto-deploy
- **Lemon Squeezy**: Checkout overlay for Shop items
- **Cal.com**: Booking embed
- **YouForm**: Contact form embed
