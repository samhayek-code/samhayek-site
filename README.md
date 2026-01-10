# Sam Hayek Website

Personal website with unified archive system, built with Next.js and Sanity CMS.

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **CMS:** Sanity
- **Hosting:** Vercel
- **Payments:** Lemon Squeezy

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Create a new project (or use existing)
3. Copy your **Project ID**
4. Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

5. Add your Sanity Project ID:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Deploy Sanity Schema

```bash
npm run sanity
```

This opens Sanity Studio locally at `http://localhost:3333`. The schema will auto-deploy.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding Content

### Via Sanity Studio

1. Run `npm run sanity` or go to your deployed studio URL
2. Click **Archive Item** → **Create**
3. Fill in the fields:
   - **Title:** Name of the item
   - **Slug:** URL-friendly version (auto-generates)
   - **Type:** Music, Art, Writing, Downloads, Tools, Shop, Design, Chat
   - **Label:** Subcategory (e.g., "Single", "Oil on Canvas", "Package")
   - **CTA:** Button text (e.g., "Listen", "View", "Buy")
   - **Description:** Short description for modal
   - **Cover Image:** Main image
   - **Gallery:** Additional images
   - **Price:** For Shop/Design items
   - **Lemon Squeezy URL:** Checkout link for purchasable items
   - **Embed URL:** For Music (Spotify/Apple Music embed)
   - **External URL:** For Tools (link to the tool)

### Content Types

| Type | Use For | Special Fields |
|------|---------|----------------|
| Music | Songs, albums, EPs | `embedUrl` (Spotify embed) |
| Art | Paintings, visual work | `gallery` (multiple images) |
| Writing | Poetry, essays | `body` (full text content) |
| Downloads | Wallpapers, presets | `externalUrl` (download link) |
| Tools | Utilities, calculators | `externalUrl` (tool link) |
| Shop | Products, merch | `price`, `lemonSqueezyUrl` |
| Design | Services, case studies | `price`, `lemonSqueezyUrl` |
| Chat | Contact options | Hardcoded in `HomeClient.tsx` |

## Lemon Squeezy Integration

1. Create products in [Lemon Squeezy](https://lemonsqueezy.com)
2. Copy the checkout URL for each product
3. Add to the item's **Lemon Squeezy URL** field in Sanity
4. The modal "Buy" button will redirect to checkout

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Sanity Studio

Deploy your Sanity Studio for easy content editing:

```bash
npm run sanity:deploy
```

This gives you a URL like `your-project.sanity.studio`.

## Project Structure

```
sam-hayek-site/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page (fetches from Sanity)
├── components/
│   ├── ArchiveGrid.tsx  # Card grid
│   ├── Card.tsx         # Individual card
│   ├── HomeClient.tsx   # Client-side filtering logic
│   ├── LiveClock.tsx    # Real-time clock
│   ├── Modal.tsx        # Item detail modal
│   ├── NavBar.tsx       # Navigation + filters
│   └── PageHeader.tsx   # Page headers
├── lib/
│   ├── sanity.ts        # Sanity client + queries
│   └── types.ts         # TypeScript types + constants
├── sanity/
│   └── schemas/
│       └── archiveItem.ts  # Content schema
└── sanity.config.ts     # Sanity configuration
```

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme.

### Fonts
Update the Google Fonts import in `app/globals.css`.

### Header Content
Edit `headerContent` in `lib/types.ts` to change page titles/subtitles.

### Chat Links
Update the URLs in `components/HomeClient.tsx` for:
- Calendly/Cal booking link
- Contact email
