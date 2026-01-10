# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for **Sam Hayek** — artist, musician, and brand designer.
- **Live site**: https://samhayek-site.vercel.app
- **Domain**: samhayek.com (to be connected)
- **Sanity Studio**: https://samhayek.sanity.studio

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **CMS**: Sanity v3 with GROQ queries
- **Rich Text**: `@portabletext/react`
- **Images**: `@sanity/image-url` for transforms
- **Deployment**: Vercel (auto-deploys on push to main)
- **Repo**: https://github.com/samhayek-code/samhayek-site

## Sanity CMS

**Project ID**: `jpxmevq8`
**Dataset**: `production`

### API Access (for creating/updating content)
```bash
# Query example
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/query/production?query=YOUR_QUERY" \
  -H "Authorization: Bearer SANITY_TOKEN"

# Mutation example (create/update)
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/mutate/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SANITY_TOKEN" \
  -d @mutation.json

# Image upload
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/assets/images/production" \
  -H "Authorization: Bearer SANITY_TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary @image.png
```

### Content Types
| Type | Label Examples | CTA | Color |
|------|----------------|-----|-------|
| Music | Single, EP, Album | Listen | #ffffff |
| Art | Oil on Canvas, Digital | View | #a3e635 |
| Writing | Essay, Poetry | Read | #fbbf24 |
| Downloads | Wallpaper, Preset | Download | #a78bfa |
| Tools | Generator, Utility | Use Tool | #f472b6 |
| Shop | Print, Merch | Buy | #f87171 |
| Design | Package, Service | Get Started | #60a5fa |
| Chat | 30 min, Async | Schedule/Write | #34d399 |

## Project Structure

```
Site/
├── app/                    # Next.js app router
│   ├── page.tsx           # Home page (server component)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── Card.tsx           # Archive card with hover effects
│   ├── Modal.tsx          # Item detail modal (Spotify, YouForm, gallery)
│   ├── NavBar.tsx         # Filter navigation
│   ├── PageHeader.tsx     # Hero section
│   ├── ArchiveGrid.tsx    # Card grid layout
│   └── HomeClient.tsx     # Client-side home logic
├── lib/
│   ├── sanity.ts          # Sanity client + queries
│   └── types.ts           # TypeScript types + colors
├── sanity/
│   └── schemas/
│       └── archiveItem.ts # CMS schema
├── content/               # Local asset staging (gitignored)
│   ├── music/
│   ├── art/
│   ├── tools/
│   └── ...
├── sanity.config.ts       # Sanity studio config
├── sanity.cli.ts          # Sanity CLI config
└── tailwind.config.ts     # Tailwind + typography plugin
```

## Key Features

### Cards
- Full-bleed background images with blur effect (default)
- Blur removes + brightness increases on hover
- Smooth 300ms transitions
- Type-colored accent gradients on hover

### Modal
- Spotify embeds (auto-converts URLs to embed format)
- YouForm embed for "Send a Message" (slug: `send-message`)
- Gallery images (only shown if uploaded)
- Portable text rendering for rich content

### Integrations
- **Spotify**: Paste track/album URL, auto-converts to embed
- **YouForm**: Form ID `muqaomml` embedded in contact modal
- **Lemon Squeezy**: `lemonSqueezyUrl` field for checkout links

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server (localhost:3000)
npm run sanity       # Start Sanity Studio locally

# Build
npm run build        # Production build

# Deploy
git add . && git commit -m "message" && git push origin main
# Vercel auto-deploys on push

# Sanity
npx sanity deploy    # Deploy Sanity Studio to samhayek.sanity.studio
```

## Content Workflow

1. **Add assets**: Drop images in `content/[type]/` folder
2. **Upload to Sanity**: Use API to upload images, get asset refs
3. **Create item**: POST mutation with image refs + content
4. **Auto-deploy**: Site updates automatically via Sanity CDN

## Environment Variables

```bash
# .env.local (gitignored)
NEXT_PUBLIC_SANITY_PROJECT_ID=jpxmevq8
NEXT_PUBLIC_SANITY_DATASET=production
```

## Design Tokens

### Colors
- Background: `#0a0a0a`
- Surface: `#111111`
- Border: `#151515` / `#222` (hover)
- Text: `#e5e5e5`
- Muted: `#666`

### Typography
- Sans: Plus Jakarta Sans
- Mono: IBM Plex Mono

### Card Effects
- Default: 40% opacity, 2px blur
- Hover: 85% opacity, no blur
- Transition: 300ms ease-out
