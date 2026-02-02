# samhayek.com

Personal portfolio site — artist, musician, brand designer.

## Quick Reference

```bash
npm run dev          # localhost:3000
npm run build        # Production build
npx sanity deploy    # Deploy Sanity Studio
git push origin main # Deploy site (Vercel auto-deploys)
```

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Sanity v3 · MUX · anime.js · Remix Icons

## Architecture

```
app/
  globals.css        # CSS variables, theming, card micro-detail styles
  layout.tsx         # Root layout, theme flash prevention
  [[...category]]/   # Dynamic category routing

components/
  HomeClient.tsx     # Main state, filtering, keyboard nav
  Modal.tsx          # Detail view (embeds, galleries, checkout, rich text)
  Card.tsx           # Grid cards with hover animations + Remix Icons
  ArchiveGrid.tsx    # Card grid with per-type code generation
  NavBar.tsx         # Filter tabs + theme/sound toggles
  PageHeader.tsx     # Dynamic header per category
  CustomCursor.tsx   # Bullseye cursor (outer ring + center dot)

lib/
  sanity.ts          # Client + GROQ queries
  types.ts           # Types + constants (filterCategories, typeColors, typeInitials)

sanity/schemas/
  archiveItem.ts     # Main content schema
```

## Icons

Use **Remix Icons** (`@remixicon/react`) for all iconography. Import individual icons to keep bundle size small:

```tsx
import { RiCalendarScheduleFill } from "@remixicon/react";
<RiCalendarScheduleFill size={96} />
```

Browse available icons at https://remixicon.com. Prefer filled variants (`*Fill`) for card icons and line variants (`*Line`) for UI chrome.

Current card icon mappings:
| Slug | Icon | Color |
|------|------|-------|
| `book-a-call` | `RiCalendarScheduleFill` | `#fbbf24` |
| `send-message` | `RiChat1Fill` | `#60a5fa` |
| `support` | `RiHandCoinFill` | `#34d399` |
| `resume` | `RiFileTextFill` | `#a78bfa` |
| `brand-audit` | `RiShieldCheckFill` | `#f87171` |

## Content Types

All content lives in `archiveItem` documents in Sanity.

| Type | Card Code | Modal Behavior |
|------|-----------|----------------|
| Design | `D-###` | Gallery + lightbox, Figma embed |
| Art | `A-###` | Gallery + lightbox |
| Music | `M-###` | Spotify/YouTube/Audius embed |
| Writing | `W-###` | Portable Text body with inline images |
| Shop | `S-###` | Whop/Lemon Squeezy checkout |
| Tools | `T-###` | External URL |
| Downloads | `L-###` | File download |
| Connect | `C-###` | Cal.com / YouForm embed |
| Lab | `X-###` | Cross-disciplinary experiments |

## Theming

Dark/light via CSS variables on `:root` / `:root.light`. Cards always render with dark backgrounds for consistency across both themes.

Key variable groups: backgrounds, text, accents, UI chrome, card overlays, modal colors, arrow key flash states.

## Fonts

- **Body**: PP Neue Montreal (self-hosted WOFF2 in `public/fonts/`, weights 300/400/500)
- **Mono**: IBM Plex Mono (Google Fonts, weight 500)

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
- `50` = after main items (e.g. References)
- `100+` = pushed to bottom (testimonials)

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
| `references` | Figma embed, no cover image in modal |

To add custom modal behavior: check slug in Modal.tsx, add to `hideCtaButton` if needed.

## Key Files to Know

- **Modal.tsx:19-64** — PortableText components (image + link rendering)
- **Modal.tsx:225-245** — Custom modal slug checks (isOasis, isContactForm, isReferences, etc.)
- **sanity.ts:19-57** — Main GROQ query
- **types.ts** — `typeColors`, `typeInitials`, `filterCategories`, `headerContent`
- **globals.css** — All CSS variables, theme definitions, card micro-detail styles

## External Services

| Service | Purpose |
|---------|---------|
| Vercel | Hosting (auto-deploy on push) |
| Sanity | CMS (samhayek.sanity.studio) |
| MUX | Video hosting |
| Whop | Shop checkout |
| Cal.com | Booking |
| YouForm | Contact form |
