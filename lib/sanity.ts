import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Fetch all items for the archive
export async function getArchiveItems() {
  return client.fetch(`
    *[_type == "archiveItem"] | order(coalesce(order, 0) asc, date desc) {
      _id,
      title,
      slug,
      type,
      label,
      price,
      year,
      description,
      body,
      cta,
      coverImage,
      gallery,
      embedUrl,
      externalUrl,
      lemonSqueezyUrl,
      videoUrl,
      collectionPieces,
      collectionBanner,
      merchGallery
    }
  `)
}

// Fetch single item by slug
export async function getItemBySlug(slug: string) {
  return client.fetch(`
    *[_type == "archiveItem" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      type,
      label,
      price,
      year,
      description,
      body,
      cta,
      coverImage,
      gallery,
      embedUrl,
      externalUrl,
      lemonSqueezyUrl,
      videoUrl,
      collectionPieces,
      collectionBanner,
      merchGallery
    }
  `, { slug })
}

// Fetch items by type
export async function getItemsByType(type: string) {
  return client.fetch(`
    *[_type == "archiveItem" && type == $type] | order(coalesce(order, 0) asc, date desc) {
      _id,
      title,
      slug,
      type,
      label,
      price,
      year,
      description,
      cta,
      coverImage
    }
  `, { type })
}
