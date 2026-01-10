import { getArchiveItems } from '@/lib/sanity'
import HomeClient from '@/components/HomeClient'

// Revalidate every 60 seconds (or on-demand with webhook)
export const revalidate = 60

export default async function Home() {
  const items = await getArchiveItems()
  
  return <HomeClient items={items} />
}
