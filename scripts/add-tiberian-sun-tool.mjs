import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import path from 'path'
import os from 'os'

// Token: uses SANITY_API_TOKEN if set, else falls back to the Sanity CLI authToken
// (~/.config/sanity/config.json) — same resolver as the other terminal scripts.
function resolveToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN
  try {
    const cfg = JSON.parse(readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8'))
    if (cfg.authToken) return cfg.authToken
  } catch {}
  return undefined
}

const client = createClient({
  projectId: 'jpxmevq8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: resolveToken(),
  useCdn: false,
})

const imagePath = '/Users/samhayek/Desktop/site/content/tools/Tiberian-Sun-Hooks/tiberian-sun-card.png'
const SLUG = 'tiberian-sun-audio-hooks'

async function run() {
  // Idempotency guard — don't create a duplicate if it already exists
  const existing = await client.fetch(`*[_type=="archiveItem" && slug.current==$s][0]{_id}`, { s: SLUG })
  if (existing?._id) {
    console.log(`Already exists (${existing._id}) — skipping create. Patch in Studio if needed.`)
    return
  }

  console.log('Uploading cover image...')
  const asset = await client.assets.upload('image', readFileSync(imagePath), {
    filename: 'tiberian-sun-card.png',
    contentType: 'image/png',
  })
  console.log(`Image uploaded: ${asset._id}`)

  const doc = {
    _type: 'archiveItem',
    title: 'Tiberian Sun Audio-Hooks',
    slug: { _type: 'slug', current: SLUG },
    type: 'Code',
    label: 'Utility',
    cta: 'View',
    order: 0,
    date: '2026-02-11', // sorts just above the Halo (02-09) + SC2 (02-10) pair
    year: '2026',
    description: 'Tiberian Sun EVA + CABAL voices for Claude Code.',
    externalUrl: 'https://github.com/samhayek-code/tiberian-sun-audio-hooks',
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

run().catch((e) => { console.error(e); process.exit(1) })
