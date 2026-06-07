/**
 * Seed/refresh the Arcarae case study (type: Design) in Sanity.
 * Uploads the curated media in _drafts/arcarae and writes one published archiveItem.
 * Idempotent: matches by slug "arcarae" and patches in place; Sanity dedupes identical assets.
 *
 * Run:  node scripts/seed-arcarae.mjs
 * Token: uses SANITY_API_TOKEN if set, else falls back to the Sanity CLI authToken
 *        (~/.config/sanity/config.json) so it works the same as the other terminal scripts.
 */

import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import { createReadStream, existsSync, readFileSync } from "fs";
import path from "path";
import os from "os";

// ─── Token (env, or fall back to the Sanity CLI auth) ──────────────
function resolveToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN;
  try {
    const cfg = JSON.parse(readFileSync(path.join(os.homedir(), ".config/sanity/config.json"), "utf8"));
    if (cfg.authToken) return cfg.authToken;
  } catch {}
  return undefined;
}
const token = resolveToken();

const client = createClient({
  projectId: "jpxmevq8",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const BASE = path.join(os.homedir(), "Desktop/Site/_drafts/arcarae");
const key = () => randomUUID().slice(0, 12);

// ─── Portable Text helpers ─────────────────────────────────────────
function parseInlineMarks(text) {
  const spans = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m[2]) spans.push({ _type: "span", _key: key(), text: m[2], marks: ["strong"] });
    else if (m[3]) spans.push({ _type: "span", _key: key(), text: m[3], marks: ["em"] });
    else if (m[4]) spans.push({ _type: "span", _key: key(), text: m[4], marks: [] });
  }
  return spans;
}
function textToBlocks(text) {
  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => ({ _type: "block", _key: key(), style: "normal", markDefs: [], children: parseInlineMarks(p.trim()) }));
}
function linkBlock(label, href) {
  const markKey = key();
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [{ _type: "link", _key: markKey, href }],
    children: [{ _type: "span", _key: key(), text: label, marks: [markKey] }],
  };
}

// ─── Asset upload (retry + cache) ──────────────────────────────────
const cache = new Map();
async function upload(file) {
  const p = path.join(BASE, file);
  if (!existsSync(p)) throw new Error(`missing asset: ${file}`);
  if (cache.has(p)) return cache.get(p);
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      process.stdout.write(`  ↑ ${file}${attempt > 1 ? ` (retry ${attempt})` : ""}\n`);
      const asset = await client.assets.upload("image", createReadStream(p), { filename: file });
      cache.set(p, asset);
      return asset;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr;
}
async function imageRef({ file, alt, caption }) {
  const asset = await upload(file);
  return {
    _type: "image",
    _key: key(),
    asset: { _type: "reference", _ref: asset._id },
    ...(alt ? { alt } : {}),
    ...(caption ? { caption } : {}),
  };
}

const FULL_CASE_URL = "https://arcarae-case-study.vercel.app";

// ─── Meta ──────────────────────────────────────────────────────────
const caseStudyMeta = [
  { _key: key(), key: "Client", value: "Arcarae, Inc. (Nicole Hsing)" },
  { _key: key(), key: "Role", value: "Designer (contract)" },
  { _key: key(), key: "Year", value: "2026" },
  { _key: key(), key: "Deliverables", value: "App Store lockups · 4 Instagram carousels" },
  { _key: key(), key: "Tools", value: "Figma, Midjourney, Affinity, Photomosh, Rotato, Paper" },
];

// ─── Sections (copy + media) ───────────────────────────────────────
const SECTIONS = [
  {
    title: "Overview",
    layout: "full-width",
    images: [{ file: "discovery-bento.webp", alt: "A selection of finished Arcarae work — app screens, launch carousels, and realm posters" }],
    body: `Arcarae is an AI-powered journaling platform that surfaces user behavior patterns. While the founder had a clear product vision and a mood board, the brand lacked a cohesive identity. I was brought in to design the launch.

The scope was the App Store lockups and four Instagram carousels. Producing those required establishing the brand identity underneath first.

The core challenge was demographic positioning: the visual style leans feminine, but roughly half the user base is male. The identity had to feel immediate and polished on the surface, yet universally accessible underneath.`,
  },
  {
    title: "Discovery",
    layout: "text-first",
    images: [],
    body: `I treated the client's reference board as data rather than passive inspiration. Analyzing recurring patterns across dozens of images surfaced four dominant signals: interior cosmology, soft bioluminescence, Y2K spiritual-pop, and second-person softness.

Those signals became the brief, and the brief became the work above: one system across the store, the feed, and every realm.`,
  },
  {
    title: "Concepts",
    layout: "images-first",
    images: [
      { file: "concept-aura-bloom.webp", alt: "Aura Bloom concept", caption: "Aura Bloom — the softest reading" },
      { file: "concept-starweave.webp", alt: "Starweave concept", caption: "Starweave — the balanced center" },
      { file: "concept-signal-receive.webp", alt: "Signal / Receive concept", caption: "Signal / Receive — clean, app-grade" },
      { file: "concept-liminal-chrome.webp", alt: "Liminal Chrome concept", caption: "Liminal Chrome — soft and technical" },
      { file: "concept-deep-signal.webp", alt: "Deep Signal concept", caption: "Deep Signal — the differentiated wildcard" },
      { file: "concept-cyber-seraph.webp", alt: "Cyber Seraph concept", caption: "Cyber Seraph — the sharpest reading" },
    ],
    body: `Rather than a menu of safe variations, I explored a single axis: how much of the parent brand's Y2K and chrome edge should carry into the app. Three safe options would not have tested the brief, so I built the full range, from soft to sharp — six concepts in total.`,
  },
  {
    title: "Directions",
    layout: "images-first",
    images: [
      { file: "dir-astral.webp", alt: "Astral direction", caption: "Astral" },
      { file: "dir-aura.webp", alt: "Aura direction", caption: "Aura" },
      { file: "dir-nebula.webp", alt: "Nebula direction", caption: "Nebula" },
      { file: "dir-synapse.webp", alt: "Synapse direction", caption: "Synapse" },
    ],
    body: `I narrowed the six concepts to four and built each out far enough to actually choose between: Astral, Aura, Nebula, and Synapse. Each carried its own 60/30/10 palette, copy voice, symbol set, and a body of art-directed, AI-generated imagery.`,
  },
  {
    title: "System",
    layout: "full-width",
    images: [
      { file: "system-palette.webp", alt: "Astral v2 color palette" },
      { file: "system-symbols.webp", alt: "Three realm marks — Void, Mirror, Bridge" },
      { file: "system-deck-1.webp", alt: "Astral v2 system specification" },
      { file: "system-deck-2.webp", alt: "Astral v2 system specification" },
    ],
    body: `The founder's feedback described a direction rather than naming one. I documented it as Astral v2: roughly 80% Astral, 15% of Aura's palette, and a grounded Nebula voice.

The system is fully specified — color, type, voice, and symbols — so it stays consistent across a five-screen flow, four carousels, and two device families. The palette runs a 60/30/10 distribution with an off-white base and a sparing warm gold that neutralizes the feminine read. Three realms get three marks: an aperture for the Void, a bloom for the Mirror, a ringed eye for the Bridge.`,
  },
  {
    title: "App Store",
    layout: "images-first",
    images: [
      { file: "appstore-hook.webp", alt: "App Store screen — Hook", caption: "Hook" },
      { file: "appstore-void.webp", alt: "App Store screen — Void", caption: "Void" },
      { file: "appstore-mirror.webp", alt: "App Store screen — Mirror", caption: "Mirror" },
      { file: "appstore-bridge.webp", alt: "App Store screen — Bridge", caption: "Bridge" },
      { file: "appstore-invite.webp", alt: "App Store screen — Invite", caption: "Invite" },
    ],
    body: `The sequence follows the product itself — Void, Mirror, Bridge — rather than disconnected feature vignettes. Each middle screen reads as either spiritual or clinical by design. Every screen pairs one emotional line with one functional line that states what the app does.`,
  },
  {
    title: "Social",
    layout: "images-first",
    images: [
      { file: "social-1.webp", alt: "Instagram launch carousel slide" },
      { file: "social-2.webp", alt: "Instagram launch carousel slide" },
      { file: "social-3.webp", alt: "Instagram launch carousel slide" },
      { file: "social-4.webp", alt: "Instagram launch carousel slide" },
    ],
    body: `A pinned-grid strategy across three posts: what Arcarae is, the three realms, and the proof. Each closes on the same call to enter the portal. One carousel animates; the rest are static. The store's system, turned outward.`,
  },
  {
    title: "Outcome",
    layout: "text-first",
    images: [{ file: "outcome.webp", alt: "Arcarae lockup on a phone, held in hand" }],
    body: `The lockups and carousels shipped on schedule. The work also pulled the engagement forward: the founder opened the parent-brand conversation, Arcarae Labs, off the back of a direction that began here as a parked exploration.`,
    link: { label: "View the full interactive case study →", href: FULL_CASE_URL },
  },
];

async function buildSections() {
  const out = [];
  for (const s of SECTIONS) {
    console.log(`\n§ ${s.title}`);
    const sectionGallery = [];
    for (const img of s.images) sectionGallery.push(await imageRef(img));
    const sectionBody = [...textToBlocks(s.body), ...(s.link ? [linkBlock(s.link.label, s.link.href)] : [])];
    out.push({ _type: "object", _key: key(), sectionTitle: s.title, layout: s.layout, sectionBody, sectionGallery });
  }
  return out;
}

async function main() {
  if (!token) {
    console.error("No Sanity token (set SANITY_API_TOKEN or `sanity login`).");
    process.exit(1);
  }
  console.log("Uploading cover…");
  const coverAsset = await upload("cover.webp");
  const caseStudySections = await buildSections();

  const fields = {
    _type: "archiveItem",
    title: "Arcarae",
    slug: { _type: "slug", current: "arcarae" },
    type: "Design",
    label: "Visual Design",
    cta: "View",
    order: -4,
    date: "2026-06-06",
    year: "2026",
    description:
      "Brand and launch design for an AI journaling app — App Store lockups and Instagram carousels, plus the identity underneath them.",
    coverImage: { _type: "image", asset: { _type: "reference", _ref: coverAsset._id } },
    externalUrl: FULL_CASE_URL,
    caseStudyMeta,
    caseStudySections,
  };

  const existing = await client.fetch(`*[_type == "archiveItem" && slug.current == "arcarae"][0]._id`);
  if (existing) {
    console.log(`\nPatching existing ${existing}…`);
    const res = await client.patch(existing).set(fields).commit();
    console.log(`✓ updated ${res._id}`);
  } else {
    const res = await client.create(fields);
    console.log(`✓ created ${res._id}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
