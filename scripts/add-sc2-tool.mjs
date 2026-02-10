import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

const client = createClient({
  projectId: 'jpxmevq8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const imagePath = '/Users/samhayek/Desktop/Site/content/tools/SC2-Hooks/sc2-card.png'

async function createSC2Tool() {
  console.log('Uploading cover image...')
  const imageBuffer = readFileSync(imagePath)
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: 'sc2-card.png',
    contentType: 'image/png',
  })
  console.log(`Image uploaded: ${asset._id}`)

  const doc = {
    _type: 'archiveItem',
    title: 'Starcraft 2 Audio-Hooks',
    slug: { _type: 'slug', current: 'sc2-audio-hooks' },
    type: 'Tools',
    label: 'Utility',
    cta: 'View',
    order: 0,
    year: '2026',
    description: 'StarCraft 2 sound effects for Claude Code.',
    externalUrl: 'https://github.com/samhayek-code/sc2-claude-hooks',
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
  }

  console.log('Creating document...')
  const result = await client.create(doc)
  console.log(`\nCreated! ID: ${result._id}`)
  console.log(`Studio: https://samhayek.sanity.studio/structure/archiveItem;${result._id}`)
}

createSC2Tool().catch(console.error)
