// Renames archiveItem.type 'Tools' -> 'Code' in Sanity.
// Dry-run by default; pass --commit to actually write.
//   Preview:  node --env-file=.env.local scripts/migrate-tools-to-code.mjs
//   Apply:    node --env-file=.env.local scripts/migrate-tools-to-code.mjs --commit
import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync } from 'node:fs'

const COMMIT = process.argv.includes('--commit')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jpxmevq8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  if (COMMIT && !process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN. Run with: node --env-file=.env.local scripts/migrate-tools-to-code.mjs --commit')
    process.exit(1)
  }

  // Matches published AND drafts so a stale draft can't revert the change on next publish.
  const tools = await client.fetch(`*[_type == "archiveItem" && type == "Tools"]{ _id, title, "slug": slug.current }`)
  const lab = await client.fetch(`count(*[_type == "archiveItem" && type == "Lab"])`)

  console.log(`\nFound ${tools.length} item(s) with type "Tools":`)
  tools.forEach((t) => console.log(`  - ${t.title}  (${t.slug || 'no-slug'})  [${t._id}]`))
  console.log(`\nFYI: ${lab} item(s) with type "Lab" (card prefix moves X->E in code, no data change).`)

  if (!COMMIT) {
    console.log('\nDRY RUN - nothing written. Re-run with --commit to apply.\n')
    return
  }

  if (tools.length === 0) {
    console.log('\nNothing to migrate.\n')
    return
  }

  // Full-document backup before any write.
  const fullDocs = await client.fetch(`*[_type == "archiveItem" && type == "Tools"]`)
  mkdirSync('backups', { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = `backups/tools-to-code-${stamp}.json`
  writeFileSync(backupPath, JSON.stringify(fullDocs, null, 2))
  console.log(`\nBacked up ${fullDocs.length} doc(s) -> ${backupPath}`)

  // Atomic: every doc flips in a single transaction.
  let tx = client.transaction()
  for (const t of tools) tx = tx.patch(t._id, (p) => p.set({ type: 'Code' }))
  const res = await tx.commit()

  console.log(`\nDone. Patched ${tools.length} doc(s): type "Tools" -> "Code". (tx ${res.transactionId})`)
  console.log('Undo: re-import the backup, or reverse-patch Code -> Tools.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
