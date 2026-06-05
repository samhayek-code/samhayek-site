import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'jpxmevq8', dataset: 'production', apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, useCdn: false,
})

const SC2_ID = 'I2VQKuc8MaTtGkdTlyJNpv'
const HALO_ID = 'JBNRF2XTmOvYqdsuY9NF9h'

let k = 0
const key = () => `b${k++}`
// span helpers
const s = (text, marks = []) => ({ _type: 'span', _key: key(), text, marks })
const block = (style, children, markDefs = []) => ({ _type: 'block', _key: key(), style, markDefs, children })
const p = (...children) => block('normal', children)
const h2 = (text) => block('h2', [s(text)])
const code = (text) => block('normal', [s(text, ['code'])])
const li = (children, listItem = 'bullet') => ({ _type: 'block', _key: key(), style: 'normal', listItem, level: 1, markDefs: [], children })

const SC2_LINK = { _key: key(), _type: 'link', href: '/tools/sc2-audio-hooks' }

const body = [
  h2('Overview'),
  p(s('Halo voice lines for Claude Code — three packs (Cortana, 343 Guilty Spark, and Sgt. Johnson) wired into the same event-hook system as the StarCraft 2 set. A random line fires when a session starts, a task finishes, Claude asks permission, or a command errors out.')),

  h2('How it works'),
  p(s('Claude Code runs a shell command on each lifecycle event. A hook maps the event to a folder, and '), s('play-random.sh', ['code']), s(' plays a random clip from the active pack:')),
  code('Stop → play-random.sh ~/.claude/sounds/active/task-complete'),
  code('PostToolUseFailure → play-error.sh'),
  p(s('Packs are just folders, so the active voice is one symlink swap:')),
  code('set-faction.sh guilty-spark'),
  p(s('The script auto-discovers any pack you drop in, so the Halo and StarCraft sets coexist and switch freely.')),

  h2('Cleaning the audio'),
  p(s('The interesting part. Raw soundboard rips carried two artifacts before every line — an in-game radio "ping" and a spoken "101soundboards" watermark. A small Python pipeline (numpy + ffmpeg) strips them without clipping speech:')),
  li([s('Cross-correlate each clip’s opening against the rest to cluster the ~5–6 recurring ping variants. Identical sound effects correlate ~1.0; real speech doesn’t — so first words are never cut.')]),
  li([s('Trim each clip to the voice onset, then apply a 10 ms fast-attack fade-in to kill the startup click.')]),
  li([s('Template-match and strip the fixed ~2 s watermark where present, and de-duplicate lines that landed in two event buckets.')]),
  p(s('~175 clips cleaned across the three packs, verified by ear.')),

  h2('Related'),
  p(s('Part of a pair — see the '), s('StarCraft 2 set', [SC2_LINK._key]), s('.'), ),
]
// attach the link markDef to the block that uses it
body.find(b => b.children?.some(c => c.marks?.includes(SC2_LINK._key))).markDefs = [SC2_LINK]

async function run() {
  // SC2: remove parens from title + give it the newer date so it sorts first
  await client.patch(SC2_ID).set({ title: 'Starcraft 2 Audio-Hooks', date: '2026-02-10' }).commit()
  console.log('SC2 patched: title + date')
  // Halo: older date (sorts right after SC2) + rich body
  await client.patch(HALO_ID).set({ date: '2026-02-09', body }).commit()
  console.log('Halo patched: date + body (' + body.length + ' blocks)')
}
run().catch(e => { console.error(e); process.exit(1) })
