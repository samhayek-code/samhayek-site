# Sam Hayek

Personal website for **Sam Hayek** — artist, musician, and brand designer.

**Live**: [samhayek-site.vercel.app](https://samhayek-site.vercel.app)
**Studio**: [samhayek.sanity.studio](https://samhayek.sanity.studio)

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS custom properties
- **CMS**: Sanity v3
- **Animation**: anime.js
- **Video**: MUX
- **Payments**: Whop, Lemon Squeezy
- **Deployment**: Vercel (auto-deploy on push)

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Add your Sanity Project ID: jpxmevq8

# Run dev server
npm run dev

# Run Sanity Studio locally
npm run sanity
```

## Features

- **Card-based archive** with category filtering (Design, Music, Art, Writing, Tools, Downloads, Shop, Connect)
- **Industrial micro-details** — depth frames, corner brackets, spec lines, and per-type card codes (e.g. `D-001`, `M-002`) that reveal on hover
- **Custom cursor** — bullseye cursor (outer ring + center dot)
- **Dark/light theming** via CSS variables on `:root` / `:root.light`
- **Responsive layout** — mobile 3x3 nav grid, desktop horizontal filter bar
- **Keyboard navigation** — arrow keys cycle filters with visual flash feedback
- **Sound effects** — soft click on hover (toggleable)
- **URL-based routing** — `/design`, `/music`, `/writing`, etc.
- **Embeds**: Spotify, YouTube, Audius, YouForm, Cal.com, Figma
- **Rich modals** — type-specific CTA colors, galleries with lightbox, Portable Text rendering, checkout flows
- **Animated border glow** on card hover (anime.js, category-colored)

## Content Types

| Type | Card Code | Modal Behavior |
|------|-----------|----------------|
| Design | `D-###` | Gallery + lightbox, Figma embed, prototype link |
| Music | `M-###` | Spotify/YouTube/Audius embed |
| Art | `A-###` | Gallery + lightbox |
| Writing | `W-###` | Portable Text body with inline images, blur preview |
| Tools | `T-###` | External URL |
| Downloads | `L-###` | File download |
| Shop | `S-###` | Whop/Lemon Squeezy checkout, crypto payments |
| Connect | `C-###` | Cal.com booking, YouForm contact |
| Lab | `X-###` | Cross-disciplinary experiments |

## Card System

Cards use a full-bleed overlay layout — the cover image fills the entire card with text floating on top. On hover:

- **Border glow** — category-colored stroke with drop shadow (anime.js)
- **Corner brackets** — L-shaped marks in 4 corners fade in at 40% opacity
- **Spec line** — `D-001 ◆ TYPE:DESIGN` in 7px mono, bottom-left
- **CTA button** — transitions from translucent to category-colored fill
- **Image** — sharpens from blurred to clear

Writing cards show a blurred text preview instead of a cover image. Connect and Shop cards display filled SVG icons.

Cards sit inside a **depth frame** — a dark rectangle (`var(--depth)`) with 5px padding that gives a recessed, layered appearance.

## Project Structure

```
├── app/
│   ├── globals.css         # CSS variables, theming, card micro-detail styles
│   ├── layout.tsx          # Root layout, theme flash prevention
│   └── [[...category]]/    # Dynamic category routing
├── components/
│   ├── Card.tsx            # Archive card with hover animations
│   ├── Modal.tsx           # Detail modal (embeds, galleries, checkout)
│   ├── NavBar.tsx          # Filter navigation + theme/sound toggles
│   ├── ArchiveGrid.tsx     # Card grid with code generation
│   ├── HomeClient.tsx      # Main state, filtering, keyboard nav
│   ├── CustomCursor.tsx    # Bullseye cursor
│   └── PageHeader.tsx      # Dynamic header per category
├── lib/
│   ├── sanity.ts           # Client + GROQ queries
│   └── types.ts            # Types, typeColors, typeInitials, filterCategories
├── public/                 # Static assets
├── sanity/schemas/         # CMS schemas
└── content/                # Asset staging (gitignored)
```

## Theming

Dark/light mode via CSS custom properties. Cards always render with dark backgrounds for visual consistency across both themes. The nav, header, and page background respect the active theme.

Key variable groups: backgrounds, text, accents, UI chrome, card overlays, modal colors, arrow key flash states.

## Deployment

```bash
# Deploy site (auto via Vercel on push)
git push origin main

# Deploy Sanity Studio
npx sanity deploy
```

## Social

- X: [@samhayek_](https://x.com/samhayek_)
- Instagram: [@samhayek_](https://instagram.com/samhayek_)
- YouTube: [@samhayek_](https://youtube.com/@samhayek_)

## License

All rights reserved.
