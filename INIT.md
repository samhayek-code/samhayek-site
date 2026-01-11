# INIT.md

Project context file for continuing development in new sessions.

## Project Overview

Personal portfolio website for **Sam Hayek** — artist, musician, and brand designer.

- **Live site**: https://samhayek-site.vercel.app
- **Sanity Studio**: https://samhayek.sanity.studio
- **Repo**: https://github.com/samhayek-code/samhayek-site
- **Domain**: samhayek.com (to be connected)

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Sanity v3
- **Deployment**: Vercel (auto-deploys on push to main)
- **Video hosting**: Cloudinary (ready, not yet populated)

## Content Types

| Type | Label Examples | CTA | Color | Notes |
|------|----------------|-----|-------|-------|
| Design | Branding, Case Study | View | #60a5fa | Gallery display, no CTA button |
| Music | Single, EP, Album | Listen | #ffffff | Spotify/YouTube embeds |
| Art | Digital, Collection | View | #a3e635 | Gallery display, no CTA button |
| Writing | Essay, Poetry | Read | #fbbf24 | YouTube embeds supported |
| Tools | Generator, Utility | Use Tool | #f472b6 | External URL |
| Downloads | Wallpaper, Preset | Download | #a78bfa | |
| Shop | Print, Merch | Buy | #f87171 | Lemon Squeezy integration |
| Connect | 30 min, Async | Schedule/Write | #34d399 | Cal.com, YouForm embeds |

## Navigation Order

Everything → Design → Music → Art → Writing → Tools → Downloads → Shop → Connect

## Sanity Schema Fields

```
archiveItem:
  - title (string, required)
  - slug (slug, required)
  - type (string, required) — one of the content types above
  - label (string, required) — e.g., "Branding", "Single", "Digital"
  - cta (string, required) — button text
  - order (number) — sort priority (lower = first, 100+ = pushed to end)
  - date (date) — for chronological sorting
  - year (string) — display year on card
  - price (string) — for Shop/Design items
  - description (text, required) — shown in modal
  - body (portable text) — rich text content
  - coverImage (image) — card thumbnail + modal display
  - gallery (array of images) — additional images
  - embedUrl (url) — Spotify/YouTube embed
  - externalUrl (url) — external link
  - lemonSqueezyUrl (url) — checkout overlay
  - videoUrl (url) — Cloudinary video
```

## Modal Behavior

- **Art & Design types**: Full-width gallery display, no hero crop, no CTA button
- **Music**: Spotify/YouTube embed with player
- **Writing**: Can have YouTube embed for spoken word
- **Connect**: Cal.com or YouForm embed based on slug
- **Lightbox**: Click any image to zoom, arrow keys to navigate collections

## Key Implementations

### Gallery Display (Art & Design)
- Cover image + gallery images shown full-width in modal
- Click any image to open lightbox
- Arrow key navigation in lightbox
- Image counter ("3 / 10") for collections

### Embed Support
- **Spotify**: Auto-converts URLs to embed format
- **YouTube**: Supports youtube.com/watch, youtu.be, youtube.com/shorts
- Player height: YouTube 315px, Spotify 152px

### Video Support (Ready)
- Cloudinary integration ready via `videoUrl` field
- Native HTML5 video player in modal
- Not yet populated with content

## Current Content

### Design
- samhayek.com (Case Study)
- Growtheory (Branding, 2015, 10 slides)
- Pro2tect (Branding, 2020, 10 slides)
- Headphone Homies (Branding, 2022, 10 slides)

### Art
- Surrender to the Dream World (2025)
- Elements (Collection, 5 pieces)
- Inter-spectra (2023)
- Evolution (2022)
- Oceanic (2021)
- Propaganda

### Music
- Fine (like this)
- Passport

### Tools
- Baseline

### Downloads
- Circadian Journal

### Connect
- Book a Call (Cal.com embed)
- Send a Message (YouForm embed)

## Future Plans

### Lab Section (Not yet built)
- New navigation item for experimental/cross-disciplinary work
- Audio/visual pieces, poetry with video
- Will use Cloudinary video support
- Hybrid content that doesn't fit other categories

### Potential Enhancements
- Lazy loading images (for scaling to 100+ cards)
- Background shader (Three.js/Vanta.js) — on backburner
- Search functionality (when content grows)

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

## Adding Content via CLI

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
  -d '{"mutations": [{"patch": {"id": "...", "set": {...}}}]}'
```

## Environment

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=jpxmevq8
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<token>
```

## Design Tokens

- Background: #0a0a0a
- Surface: #111111
- Border: #151515 / #222 (hover)
- Text: #e5e5e5
- Fonts: Plus Jakarta Sans (sans), IBM Plex Mono (mono)
- Breakpoint: 1024px (lg:)

## Notes

- Cards sort by `order` ASC, then `date` DESC
- Content lives in Sanity, code deploys via Vercel
- Local `/content` folder is gitignored — used for staging assets before upload
- Cloudinary account created, free tier (25 credits/month)
