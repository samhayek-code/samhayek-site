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
│   ├── layout.tsx         # Root layout + OG meta tags
│   ├── globals.css        # Global styles
│   ├── icon.png           # Favicon (32x32)
│   ├── apple-icon.png     # Apple touch icon
│   ├── sitemap.ts         # Dynamic sitemap generation
│   └── robots.ts          # Robots.txt configuration
├── components/
│   ├── Card.tsx           # Archive card with hover effects + sound
│   ├── Modal.tsx          # Item detail modal (Spotify, YouForm, Cal.com, gallery)
│   ├── NavBar.tsx         # Filter navigation (responsive: row on desktop, 3x3 grid on mobile)
│   ├── PageHeader.tsx     # Hero section
│   ├── ArchiveGrid.tsx    # Card grid layout
│   ├── LiveClock.tsx      # Real-time clock component
│   └── HomeClient.tsx     # Client-side home logic (keyboard nav, sound, state)
├── lib/
│   ├── sanity.ts          # Sanity client + queries
│   └── types.ts           # TypeScript types + colors + filter categories
├── sanity/
│   └── schemas/
│       └── archiveItem.ts # CMS schema
├── content/               # Local asset staging (gitignored)
│   ├── music/
│   ├── art/
│   ├── tools/
│   └── ...
├── public/
│   └── og-image.png       # Social preview image (1200x630)
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
- Hover sound effect (when enabled)

### Modal
- Spotify embeds (auto-converts URLs to embed format)
- YouForm embed for "Send a Message" (slug: `send-message`, form ID: `muqaomml`)
- Cal.com embed for "Book a Call" (slug: `book-a-call`, link: `samhayek/30min`, week view)
- Gallery images (only shown if uploaded)
- Portable text rendering for rich content
- Hero image hidden for embed modals

### Keyboard Navigation (Desktop Only)
- Left/Right arrow keys cycle through filter categories
- Arrow key indicators in footer flash white when pressed
- Sound plays on navigation (when enabled)

### Sound Effects (Desktop Only)
- Soft click sound on hover (cards, nav items)
- Sound on keyboard navigation
- Toggle button in nav bar (persists to localStorage)
- Generated via Web Audio API (no audio files)

### Social Links
- Footer contains X, Instagram, YouTube icons
- All link to @samhayek_

### Responsive Design
**Desktop (>= 640px)**:
- Nav: Logo left, filter row center, clock + sound toggle right
- Footer: Navigate arrows left, social icons center, copyright right

**Mobile (< 640px)**:
- Nav: "Sam Hayek" centered on own line, filter buttons in 3x3 grid
- Footer: Clock left, social icons center, copyright right
- No sound toggle or keyboard nav indicators
- Touch-friendly button sizing (py-3)

### Integrations
- **Spotify**: Paste track/album URL, auto-converts to embed
- **YouForm**: Form ID `muqaomml` embedded in contact modal
- **Cal.com**: Inline embed with week view layout
- **Lemon Squeezy**: `lemonSqueezyUrl` field triggers overlay checkout (JS SDK)

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

### Adding Music via CLI

```bash
# 1. Download album art (from Spotify or other source)
curl -o content/music/song-name.jpg "IMAGE_URL"

# 2. Upload image to Sanity
TOKEN=$(grep SANITY_API_TOKEN .env.local | cut -d= -f2)
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/assets/images/production" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @content/music/song-name.jpg

# Returns: {"_id": "image-xxx-640x640-jpg", ...}

# 3. Create archive item
curl -s "https://jpxmevq8.api.sanity.io/v2024-01-01/data/mutate/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "mutations": [{
      "create": {
        "_type": "archiveItem",
        "title": "Song Name",
        "slug": { "_type": "slug", "current": "song-name" },
        "type": "Music",
        "label": "Single",
        "year": "2024",
        "description": "A single by Sam Hayek.",
        "cta": "Listen",
        "embedUrl": "https://open.spotify.com/track/TRACK_ID",
        "coverImage": {
          "_type": "image",
          "asset": { "_type": "reference", "_ref": "image-xxx-640x640-jpg" }
        }
      }
    }]
  }'
```

## Environment Variables

```bash
# .env.local (gitignored)
NEXT_PUBLIC_SANITY_PROJECT_ID=jpxmevq8
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token>  # For CLI mutations (create/update content)
```

**Note**: The `SANITY_API_TOKEN` is stored in `.env.local` and can be read with:
```bash
grep SANITY_API_TOKEN .env.local | cut -d= -f2
```

## Design Tokens

### Colors
- Background: `#0a0a0a`
- Surface: `#111111`
- Border: `#151515` / `#222` (hover)
- Text: `#e5e5e5`
- Muted: `#666`
- Subtle: `#444`

### Typography
- Sans: Plus Jakarta Sans
- Mono: IBM Plex Mono

### Card Effects
- Default: 40% opacity, 2px blur
- Hover: 85% opacity, no blur
- Transition: 300ms ease-out

### Nav Button States
- Default: transparent bg, `#555` text
- Hover: `rgba(255,255,255,0.04)` bg, `#888` text, colored dot at 40% opacity
- Active: `rgba(255,255,255,0.1)` bg, `#e5e5e5` text, colored dot at 100%

### Breakpoints
- Mobile: < 640px (`sm:` prefix for desktop styles)

## Card Ordering

Cards sort by `order` ASC, then `date` DESC (newest first).

| Order Value | Behavior |
|-------------|----------|
| -10 | Pinned to top |
| 0 (default) | Sorts by date among peers |
| 100+ | Pushed to bottom |

Set `order` in Sanity Studio to override chronological sorting. Chat items default to `order: 100`.

## Current Content Inventory

| Title | Type | Order | Date | Slug |
|-------|------|-------|------|------|
| Baseline | Tools | 0 | 2026-01-01 | baseline |
| samhayek.com | Design | 0 | 2025-01-10 | samhayek-com |
| Circadian Journal | Downloads | 0 | 2025-01-01 | circadian-journal |
| Fine (like this) | Music | 0 | 2024-12-01 | fine-like-this |
| Passport | Music | 0 | 2024-06-01 | passport |
| Book a Call | Chat | 100 | — | book-a-call |
| Send a Message | Chat | 100 | — | send-message |

## Version Control

- **Git**: All code versioned, push to `main` triggers deploy
- **Vercel**: Keeps deployment history, instant rollback via dashboard
- **Sanity**: Document revision history, content separate from code

### Recovery Commands
```bash
git checkout .                    # Discard uncommitted changes
git log --oneline                 # View commit history
git revert <commit>               # Undo a specific commit
```
