# samhayek.com

Personal portfolio site — artist, musician, brand designer.

## Current Project: Aesthetic Overhaul

**Branch:** `aesthetic-overhaul` (created from `main`)

**Goal:** Major visual redesign of the entire site. Functionality stays identical — only the aesthetic changes.

**Approach:**
- All work happens on the `aesthetic-overhaul` branch. `main` is untouched and safe.
- Sam is building reference designs and a design system in **Pencil.dev** (desktop app with MCP integration)
- Once Pencil designs are ready, translate them into code component-by-component
- When the redesign is complete and tested, merge back into `main` and push

**Status:** Branch created, waiting for Pencil.dev designs to be finalized.

**Important:** Do NOT push to `main` or merge until Sam explicitly says the redesign is ready.

---

## Quick Reference

```bash
npm run dev          # localhost:3000
npm run build        # Production build
npx sanity deploy    # Deploy Sanity Studio
git push origin main # Deploy site (Vercel auto-deploys)
```

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Sanity v3 · MUX · anime.js

## Architecture

```
app/
  globals.css        # CSS variables, theming
  layout.tsx         # Root layout, theme flash prevention
  page.tsx           # Home (fetches from Sanity)

components/
  HomeClient.tsx     # Main state, filtering
  Modal.tsx          # Detail view (embeds, galleries, checkout, rich text)
  Card.tsx           # Grid cards with hover animations
  NavBar.tsx         # Filter tabs + theme toggle
  CustomCursor.tsx   # Bullseye cursor (outer ring + center dot)

lib/
  sanity.ts          # Client + GROQ queries
  types.ts           # Types + constants (filterCategories, typeColors)

sanity/schemas/
  archiveItem.ts     # Main content schema
```

## Content Types

All content lives in `archiveItem` documents in Sanity.

| Type | Modal Behavior |
|------|----------------|
| Design | Gallery + lightbox, Figma embed |
| Art | Gallery + lightbox |
| Music | Spotify/YouTube embed |
| Writing | Portable Text body with inline images |
| Shop | Whop/Lemon Squeezy checkout |
| Tools | External URL |
| Downloads | File download |
| Connect | Cal.com / YouForm embed |

## Theming

Dark/light via CSS variables on `:root` / `:root.light`

Key variables: `--background`, `--foreground`, `--surface`, `--border`, `--muted`

## GROQ Patterns

Images in Portable Text body need asset expansion:
```groq
body[] {
  ...,
  _type == "image" => { ..., asset-> }
}
```

## Card Ordering

`order` ASC, then `date` DESC
- `-10` = pinned top
- `0` = default (by date)
- `100+` = pushed to bottom

## Custom Modal Handling

Some items have custom modal layouts based on their slug. Pattern:
```tsx
const isOasis = item.slug?.current === 'oasis'
```

| Slug | Custom Behavior |
|------|-----------------|
| `oasis` | Click-to-copy install command, custom copy, GitHub CTA |
| `send-message` | YouForm embed |
| `book-a-call` | Cal.com embed |
| `samhayek-com` | Case study (hides CTA) |
| `support` | Crypto wallet buttons with QR codes |

To add custom modal behavior: check slug in Modal.tsx, add to `hideCtaButton` if needed.

## Key Files to Know

- **Modal.tsx:19-64** — PortableText components (image + link rendering)
- **Modal.tsx:225-237** — Custom modal slug checks (isOasis, isContactForm, etc.)
- **sanity.ts:19-52** — Main GROQ query
- **types.ts** — `typeColors`, `filterCategories`, `headerContent`
- **globals.css** — All CSS variables and theme definitions

## External Services

| Service | Purpose |
|---------|---------|
| Vercel | Hosting (auto-deploy on push) |
| Sanity | CMS (samhayek.sanity.studio) |
| MUX | Video hosting |
| Whop | Shop checkout |
| Cal.com | Booking |
| YouForm | Contact form |
