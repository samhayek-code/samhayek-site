import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import path from 'path'
import os from 'os'

function resolveToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN
  try {
    const cfg = JSON.parse(readFileSync(path.join(os.homedir(), '.config/sanity/config.json'), 'utf8'))
    if (cfg.authToken) return cfg.authToken
  } catch {}
  return undefined
}

const client = createClient({
  projectId: 'jpxmevq8', dataset: 'production', apiVersion: '2024-01-01',
  token: resolveToken(), useCdn: false,
})

const doc = await client.fetch(`*[_type=="archiveItem" && slug.current=="tiberian-sun-audio-hooks"][0]{_id}`)
if (!doc?._id) { console.error('Tiberian Sun card not found'); process.exit(1) }
await client.patch(doc._id).set({
  description: 'Tiberian Sun EVA, CABAL, and unit voices for Claude Code.',
}).commit()
console.log('Patched description for', doc._id)
