/**
 * One-time script to create the Arête case study document in Sanity.
 * Run with: node scripts/seed-arete-case-study.mjs
 */

import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";

const client = createClient({
  projectId: "jpxmevq8",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Helper: generate a short key for Sanity array items
function key() {
  return randomUUID().slice(0, 12);
}

// Helper: convert plain text paragraphs into Portable Text blocks
// Supports **bold** and *italic* inline marks
function textToBlocks(text) {
  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((paragraph) => {
      const children = parseInlineMarks(paragraph.trim());
      return {
        _type: "block",
        _key: key(),
        style: "normal",
        markDefs: [],
        children,
      };
    });
}

// Parse **bold** and *italic* within a paragraph into spans
function parseInlineMarks(text) {
  const spans = [];
  // Regex matches **bold**, *italic*, or plain text segments
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // **bold**
      spans.push({
        _type: "span",
        _key: key(),
        text: match[2],
        marks: ["strong"],
      });
    } else if (match[3]) {
      // *italic*
      spans.push({
        _type: "span",
        _key: key(),
        text: match[3],
        marks: ["em"],
      });
    } else if (match[4]) {
      // plain text
      spans.push({
        _type: "span",
        _key: key(),
        text: match[4],
        marks: [],
      });
    }
  }
  return spans;
}

// ─── Case Study Meta ───────────────────────────────────────────────
const caseStudyMeta = [
  { _key: key(), key: "Client", value: "Arête" },
  { _key: key(), key: "Industry", value: "Building Infrastructure Assessment" },
  { _key: key(), key: "Role", value: "Brand Strategist & Designer" },
  { _key: key(), key: "Timeline", value: "January – February 2026" },
  {
    _key: key(),
    key: "Scope",
    value: "Identity, Color System, Typography, Voice, Brand Kits",
  },
  {
    _key: key(),
    key: "Tools",
    value: "Figma, Procreate, Flora, Remotion, Claude",
  },
];

// ─── Case Study Sections ───────────────────────────────────────────
const caseStudySections = [
  {
    _key: key(),
    sectionTitle: "Overview",
    layout: "text-first",
    sectionBody: textToBlocks(
      `Arête is a building infrastructure assessment company — they measure what exists and report what they find. The brief was to build a brand identity that matches that discipline: honest, precise, and grounded.

The name itself set the trajectory. *Arête* is a Greek word meaning excellence through practice — not aspiration, but the relentless fulfillment of function. A building demonstrates arête by standing true. A person demonstrates it by reporting what they find, whether convenient or not.

The tagline — *Built on Truth* — emerged from the same principle. It describes both the company's method and the structures they assess: things that endure because they were verified.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Discovery & Etymology",
    layout: "text-first",
    sectionBody: textToBlocks(
      `The research began with the Greek linguistic root and kept returning to a single word: *orthos* (ὀρθός). In Greek, *orthos* means both "physically straight or perpendicular" and "morally correct or honest." Same word, same standard. A wall standing plumb and a person dealing honestly shared a vocabulary because, to the Greeks, they were the same discipline.

This duality shaped everything that followed. The brand wasn't going to be built on metaphor — it was going to be built on the literal tools and language of structural verification.

From *orthos* came *orthodox* (correct belief), *orthopedic* (straightening the body), and the entire lineage of words that bind physical alignment to moral integrity. This wasn't decoration — it was the conceptual foundation.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "The Mark",
    layout: "images-first",
    sectionBody: textToBlocks(
      `The Arête mark is an archipendulum — an ancient A-frame level with a plumb line hanging from the apex.

When the weighted line bisects the crossbar at center, the surface is level. When it runs parallel to the frame's legs, the wall is plumb. No calibration, no interpretation — gravity is the only input.

This tool was used to build the pyramids. Greek masons carried it up the Acropolis to construct the Parthenon — cutting marble blocks so precisely that the joints remain tight after twenty-four centuries, without mortar. The design hasn't changed because it doesn't need to. Gravity is constant. The reading is either true or it isn't.

The "A" in Arête IS the tool. The tool IS the method. There's nothing behind it but the principle itself.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Exploration: Temple",
    layout: "images-first",
    sectionBody: textToBlocks(
      `A Greek temple mark was also explored — four columns beneath a pediment, the form of what endures. The Parthenon still stands after twenty-four centuries, not by chance but by verification. The temple represented the outcome of the work: structures that remain because they were measured and found true.

Four columns because that is what the temple has. A pediment because that is how load reaches ground. As a concept it was strong — but the archipendulum was stronger.

The archipendulum contains the plumb bob within a more complete structure, finding truth in all directions. It naturally forms the "A" in Arête. And it speaks to method rather than outcome — which is closer to what the company actually does. They don't build temples. They verify that what's built is true.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Color System",
    layout: "side-by-side",
    sectionBody: textToBlocks(
      `Twelve palettes were explored before one was selected. Each was built as a full working system — not mood boards, but functional color distributions with specific role assignments: 55% surface, 25% text, 10% support, 5% warm accent, 5% CTA.

**Kéramos** — warm, golden, luminous. The palette draws from aged parchment, honey, and wheat — materials that have existed alongside the archipendulum for millennia. Espresso for text, Cream for surfaces, Honey for secondary elements, Wheat for accents, and Kéramos for calls to action.

The other eleven explorations — Olive, Obsidian, Umber, Lapis, Tyrian, Slate, Verdant, Indigo, Carbon, Midnight, and Acropolis — were each fully developed as HTML presentations for stakeholder review. Acropolis (a dark palette of Aegean night and Pentelic marble) came closest, but Kéramos won because its warmth matched the archipendulum's human scale. The tool is held in the hand. The palette should feel that close.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Typography",
    layout: "text-first",
    sectionBody: textToBlocks(
      `**Source Serif 4** for display. A variable serif with optical sizing — it carries the weight of historical reference without feeling antique. The serifs ground it; the variable axes keep it contemporary.

**Inter** for body. Clean, highly legible at every size, and engineered for screens. It doesn't compete with Source Serif — it steps back and lets the content breathe.

The pairing follows the same principle as the rest of the brand: one element carries the historical weight, the other carries the functional clarity. Neither is decorative. Both are working.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Brand Voice",
    layout: "text-first",
    sectionBody: textToBlocks(
      `The writing principles were derived directly from the archipendulum metaphor: the tool doesn't persuade — it shows what is true. The writing should do the same.

**Honest** — state what is true, plainly.

**Precise** — no flourish for flourish's sake.

**Grounded** — let the content carry the weight.

**Confident but not showy** — trust the reader.

The tone sits between technical accuracy and historical richness. It's inspirational but never over-sold. The Greek context colors the language without dominating it — this is a building assessment company, not a classics department.

Copy was written across multiple lengths: single sentences, two-sentence versions, short paragraphs, and extended narratives. Each format maintains the same voice, just at different resolutions.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "The Identity",
    layout: "full-width",
    sectionBody: textToBlocks(
      `The final identity is the archipendulum mark on a Kéramos palette, set in Source Serif 4 and Inter, speaking in a voice that shows what is true without trying to persuade.

Every element traces back to the same principle. The mark is the tool. The palette is the material. The typography carries weight without decoration. The voice states what it finds. Nothing in the system exists for its own sake — each piece fulfills a function, which is exactly what *arête* demands.

The brand doesn't sell. It verifies. And the identity looks like that discipline feels: precise, warm, grounded, and honest.`
    ),
  },
  {
    _key: key(),
    sectionTitle: "Deliverables",
    layout: "text-first",
    sectionBody: textToBlocks(
      `The final delivery included:

**Archipendulum mark** — The primary brand mark at multiple sizes, with usage guidelines.

**Kéramos color palette** — Fully specified with role-based distribution (55/25/10/5/5), production-ready hex values.

**Typography system** — Source Serif 4 + Inter, with usage guidelines.

**Brand voice guidelines** — Writing principles, tone framework, and copy specimens at four lengths.

**12 palette explorations** — Each built as a complete HTML presentation for stakeholder review.

**Brand kit presentation** — Full interactive HTML document for the Kéramos identity.

**Historical research document** — Deep-dive on the archipendulum, Greek construction methods, and the orthos/arête linguistic connection.

**Brand strategy document** — Positioning, naming rationale, mark explanation, and competitive context.

Everything was built to be usable, not just presentable. The HTML brand kit is a working reference document. The copy specimens are ready to deploy. The color values are production-ready.`
    ),
  },
];

// ─── Document ──────────────────────────────────────────────────────
const doc = {
  _type: "archiveItem",
  title: "Arête",
  slug: { _type: "slug", current: "arete" },
  type: "Design",
  label: "Brand Identity",
  cta: "View",
  order: 0,
  year: "2026",
  description:
    "Complete brand identity for a building infrastructure assessment company — rooted in a 4,000-year-old leveling tool, Greek construction principles, and the pursuit of structural truth.",
  caseStudyMeta,
  caseStudySections,
};

// ─── Create ────────────────────────────────────────────────────────
async function main() {
  console.log("Creating Arête case study document...");

  // Check if a document with this slug already exists
  const existing = await client.fetch(
    `*[_type == "archiveItem" && slug.current == "arete"][0]._id`
  );

  if (existing) {
    console.log(`Found existing document: ${existing}`);
    console.log("Updating in place...");
    const result = await client
      .patch(existing)
      .set({
        ...doc,
        _id: existing, // keep the same ID
      })
      .commit();
    console.log(`Updated: ${result._id}`);
  } else {
    const result = await client.create(doc);
    console.log(`Created: ${result._id}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
