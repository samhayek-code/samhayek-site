# Sam Hayek

Personal website for **Sam Hayek** — artist, musician, and brand designer.

**Live**: [samhayek-site.vercel.app](https://samhayek-site.vercel.app)
**Studio**: [samhayek.sanity.studio](https://samhayek.sanity.studio)

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Sanity v3
- **Deployment**: Vercel
- **Payments**: Lemon Squeezy

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

- **Card-based archive** with type filtering
- **Responsive design** (mobile 3x3 nav grid, desktop horizontal)
- **Keyboard navigation** (arrow keys cycle filters)
- **Sound effects** (soft click on hover, toggleable)
- **Embeds**: Spotify, YouForm contact, Cal.com booking
- **Real-time clock** in nav (desktop) / footer (mobile)

## Content Types

| Type | Examples | Special Fields |
|------|----------|----------------|
| Music | Singles, Albums | `embedUrl` (Spotify) |
| Art | Paintings, Digital | `gallery` |
| Writing | Essays, Poetry | `body` (rich text) |
| Downloads | Wallpapers, Presets | `externalUrl` |
| Tools | Generators, Utilities | `externalUrl` |
| Shop | Prints, Merch | `price`, `lemonSqueezyUrl` |
| Design | Packages, Services | `price`, `lemonSqueezyUrl` |
| Chat | Booking, Contact | Special modal embeds |

## Project Structure

```
├── app/                # Next.js pages + layout
├── components/         # React components
│   ├── Card.tsx       # Archive card
│   ├── Modal.tsx      # Detail modal (embeds)
│   ├── NavBar.tsx     # Filter navigation
│   └── HomeClient.tsx # State + keyboard nav
├── lib/               # Sanity client + types
├── public/            # Static assets
├── sanity/            # CMS schemas
└── content/           # Asset staging (gitignored)
```

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
