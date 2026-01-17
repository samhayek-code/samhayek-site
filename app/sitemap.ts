import { MetadataRoute } from 'next'
import { filterCategories } from '@/lib/types'

const baseUrl = 'https://samhayek.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // Root page
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Category pages (excluding "Everything" which is the root)
  const categoryRoutes = filterCategories
    .filter(c => c !== 'Everything')
    .map(category => ({
      url: `${baseUrl}/${category.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...routes, ...categoryRoutes]
}
