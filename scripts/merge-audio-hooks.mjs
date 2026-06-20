#!/usr/bin/env node
/**
 * Merge the three audio-hook cards (StarCraft 2, Halo, Tiberian Sun) into one
 * "Audio-Hooks" card, then delete the originals. Full JSON backup written first.
 *
 *   Dry run:  npx sanity exec scripts/merge-audio-hooks.mjs --with-user-token
 *   Apply:    npx sanity exec scripts/merge-audio-hooks.mjs --with-user-token -- --commit
 */
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;
import { writeFileSync, mkdirSync } from "fs";

const COMMIT = process.argv.includes("--commit");
const client = getCliClient({ apiVersion: "2024-01-01" });

const OLD_IDS = [
  "I2VQKuc8MaTtGkdTlyJNpv", // Starcraft 2 Audio-Hooks
  "JBNRF2XTmOvYqdsuY9NF9h", // Halo Audio-Hooks
  "b0GYH6ucmFNksv7ChkiuzS", // Tiberian Sun Audio-Hooks
];
const SC2_ID = "I2VQKuc8MaTtGkdTlyJNpv"; // cover reused as placeholder
const REPO_URL = "https://github.com/samhayek-code/claude-audio-hooks";

// ── PortableText helpers ──
let k = 0;
const key = () => `b${k++}`;
const s = (text, marks = []) => ({ _type: "span", _key: key(), text, marks });
const block = (style, children, markDefs = []) => ({ _type: "block", _key: key(), style, markDefs, children });
const p = (...children) => block("normal", children);
const h2 = (text) => block("h2", [s(text)]);
const code = (text) => block("normal", [s(text, ["code"])]);
const li = (children) => ({ _type: "block", _key: key(), style: "normal", listItem: "bullet", level: 1, markDefs: [], children });

const REPO_LINK = { _key: key(), _type: "link", href: REPO_URL };

const body = [
  h2("Overview"),
  p(s("One card, every pack. Game voice lines and sound effects wired into Claude Code's lifecycle events — StarCraft 2, Halo, and Tiberian Sun. A random clip fires when a session starts, a task finishes, Claude asks permission, or a command errors out, and the active voice is one symlink swap.")),

  h2("The packs"),
  li([s("StarCraft 2", ["strong"]), s(" — Terran, Protoss, and Zerg announcer and unit lines.")]),
  li([s("Halo", ["strong"]), s(" — Cortana, 343 Guilty Spark, and Sgt. Johnson.")]),
  li([s("Tiberian Sun", ["strong"]), s(" — EVA, CABAL, and GDI/Nod unit voices.")]),

  h2("How it works"),
  p(s("Claude Code runs a shell command on each lifecycle event. A hook maps the event to a folder, and "), s("play-random.sh", ["code"]), s(" plays a random clip from the active pack:")),
  code("Stop → play-random.sh ~/.claude/sounds/active/task-complete"),
  code("PostToolUseFailure → play-error.sh"),
  p(s("Packs are just folders, so switching voice is one symlink swap:")),
  code("set-faction.sh guilty-spark"),
  p(s("The script auto-discovers any pack you drop in, so all three sets coexist and switch freely.")),

  h2("Cleaning the audio"),
  p(s("The interesting part. Raw soundboard rips carried two artifacts before every line — an in-game radio “ping” and a spoken “101soundboards” watermark. A small Python pipeline (numpy + ffmpeg) strips them without clipping speech:")),
  li([s("Cross-correlate each clip's opening against the rest to cluster the recurring ping variants. Identical sound effects correlate ~1.0; real speech doesn't — so first words are never cut.")]),
  li([s("Trim each clip to the voice onset, then apply a 10 ms fast-attack fade-in to kill the startup click.")]),
  li([s("Template-match and strip the fixed watermark where present, and de-duplicate lines that landed in two event buckets.")]),
  p(s("~175 clips cleaned across the packs, verified by ear.")),

  h2("Get it"),
  p(s("Packs, install steps, and the cleaning pipeline live in the repo: "), s("samhayek-code/claude-audio-hooks", [REPO_LINK._key]), s(".")),
];
// attach the link markDef to the block that uses it
body.find((b) => b.children?.some((c) => c.marks?.includes(REPO_LINK._key))).markDefs = [REPO_LINK];

async function main() {
  const docs = await client.fetch(`*[_id in $ids || _id in $draftIds]`, {
    ids: OLD_IDS,
    draftIds: OLD_IDS.map((id) => `drafts.${id}`),
  });
  console.log(`Found ${docs.length} doc(s) to back up:`);
  docs.forEach((d) => console.log(`  - ${d.title} [${d._id}]`));

  const sc2 = docs.find((d) => d._id === SC2_ID);
  const placeholderCover = sc2?.coverImage;
  if (!placeholderCover) throw new Error("Could not read SC2 coverImage for placeholder");

  const newDoc = {
    _type: "archiveItem",
    title: "Audio-Hooks",
    slug: { _type: "slug", current: "audio-hooks" },
    type: "Code",
    label: "Utility",
    cta: "View",
    order: 0,
    year: "2026",
    date: "2026-02-11",
    description:
      "Game voice packs for Claude Code — StarCraft 2, Halo, and Tiberian Sun, wired into session events and switchable on a symlink.",
    externalUrl: REPO_URL,
    coverImage: placeholderCover,
    body,
  };

  if (!COMMIT) {
    console.log("\nDRY RUN — nothing written. New doc preview:");
    console.log(`  title: ${newDoc.title} | slug: ${newDoc.slug.current} | link: ${newDoc.externalUrl}`);
    console.log(`  body blocks: ${body.length} | cover: reused from SC2`);
    console.log(`  would delete: ${docs.map((d) => d._id).join(", ")}`);
    console.log("\nRe-run with `-- --commit` to apply.\n");
    return;
  }

  mkdirSync("backups", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `backups/audio-hooks-merge-${stamp}.json`;
  writeFileSync(backupPath, JSON.stringify(docs, null, 2));
  console.log(`\nBacked up ${docs.length} doc(s) -> ${backupPath}`);

  const created = await client.create(newDoc);
  console.log(`Created combined card: ${created._id} (/${newDoc.slug.current})`);

  let tx = client.transaction();
  for (const d of docs) tx = tx.delete(d._id);
  const res = await tx.commit();
  console.log(`Deleted ${docs.length} old doc(s). (tx ${res.transactionId})`);
  console.log("\nDone. Drop new cover art and I'll wire it onto /audio-hooks.\n");
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
