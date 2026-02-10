import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getArchiveItems } from '@/lib/sanity'
import { filterCategories, headerContent } from '@/lib/types'
import HomeClient from '@/components/HomeClient'

// Valid categories (lowercase for URL matching)
const validCategories = filterCategories
  .filter(c => c !== 'Everything')
  .map(c => c.toLowerCase())

// Revalidate every 60 seconds (or on-demand with webhook)
export const revalidate = 60

interface PageProps {
  params: Promise<{ category?: string[] }>
}

// Generate metadata based on category
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const categorySlug = category?.[0]?.toLowerCase()

  // Find matching category (case-insensitive)
  const matchedCategory = filterCategories.find(
    c => c.toLowerCase() === categorySlug
  )

  if (!categorySlug || !matchedCategory) {
    // Root path - default metadata
    return {
      title: 'Sam Hayek | Artist + Designer',
      description: 'Building with sound, light, language, and code.',
    }
  }

  const content = headerContent[matchedCategory]

  return {
    title: `Sam Hayek | ${matchedCategory}`,
    description: content?.subtitle || 'Building with sound, light, language, and code.',
    openGraph: {
      title: `Sam Hayek | ${matchedCategory}`,
      description: content?.subtitle || 'Building with sound, light, language, and code.',
    },
  }
}

// Generate static params for all categories
export async function generateStaticParams() {
  return [
    { category: [] }, // Root path
    ...validCategories.map(c => ({ category: [c] })),
  ]
}

export default async function Page({ params }: PageProps) {
  const { category } = await params
  const categorySlug = category?.[0]

  // Handle paths with more than 2 segments
  if (category && category.length > 2) {
    redirect('/')
  }

  // Extract slug if present (e.g. /tools/oasis → slug = "oasis")
  const itemSlug = category?.[1] || null

  // Determine initial filter
  let initialFilter = 'Everything'

  if (categorySlug) {
    // Find matching category (case-insensitive)
    const matchedCategory = filterCategories.find(
      c => c.toLowerCase() === categorySlug.toLowerCase()
    )

    if (!matchedCategory) {
      // Not a valid category — might be a slug on root (e.g. /oasis)
      // Treat as "Everything" with a slug
      const items = await getArchiveItems()
      return <HomeClient items={items} initialFilter="Everything" initialSlug={categorySlug} />
    }

    // Redirect if case doesn't match (enforce lowercase URLs)
    if (categorySlug !== categorySlug.toLowerCase()) {
      const redirectPath = itemSlug
        ? `/${categorySlug.toLowerCase()}/${itemSlug}`
        : `/${categorySlug.toLowerCase()}`
      redirect(redirectPath)
    }

    initialFilter = matchedCategory
  }

  const items = await getArchiveItems()

  return <HomeClient items={items} initialFilter={initialFilter} initialSlug={itemSlug} />
}
