/**
 * Arête case study v2 — complete rewrite
 *
 * Changes:
 * - All slide images → full-width layout
 * - 10 individual sketch pages (not composites) in "Exploration" section
 * - Kéramos palette (from Umber) replaces Saffron
 * - Typography: Martina Plantijn / Source Serif Pro / Paper Mono (not Inter)
 * - Brand Voice content from Brand Foundation doc
 * - "The Identity" → "Brand in Action"
 * - Figma embed after Overview
 * - Smart brevity copywriting throughout
 * - MUX video at top (set via muxVideo field, added after this script gets the ID)
 *
 * Run: node scripts/update-arete-v2.mjs
 */

import { createClient } from "@sanity/client";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";
import path from "path";

const client = createClient({
  projectId: "jpxmevq8",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function key() {
  return randomUUID().slice(0, 12);
}

// ── Portable Text helpers ──────────────────────────────────────────

function parseInlineMarks(text) {
  const spans = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      spans.push({ _type: "span", _key: key(), text: match[2], marks: ["strong"] });
    } else if (match[3]) {
      spans.push({ _type: "span", _key: key(), text: match[3], marks: ["em"] });
    } else if (match[4]) {
      spans.push({ _type: "span", _key: key(), text: match[4], marks: [] });
    }
  }
  return spans;
}

function textToBlocks(text) {
  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((paragraph) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: parseInlineMarks(paragraph.trim()),
    }));
}

// ── Image upload ───────────────────────────────────────────────────

async function uploadImage(filePath, label) {
  const filename = path.basename(filePath);
  console.log(`  Uploading ${label || filename}...`);
  const asset = await client.assets.upload("image", createReadStream(filePath), { filename });
  console.log(`  ✓ ${asset._id}`);
  return asset;
}

function imageRef(asset, alt, caption) {
  const ref = { _type: "image", _key: key(), asset: { _type: "reference", _ref: asset._id } };
  if (alt) ref.alt = alt;
  if (caption) ref.caption = caption;
  return ref;
}

// ── Paths ──────────────────────────────────────────────────────────

const ARETE = "/Users/samhayek/Desktop/Projects/Arete";
const SLIDES = `${ARETE}/Branding Slides/Archipendulum`;
const IMAGES = "/Users/samhayek/Desktop/Projects/Arete/Images /";

// ── Content ────────────────────────────────────────────────────────

const caseStudyMeta = [
  { _key: key(), key: "Client", value: "Arête" },
  { _key: key(), key: "Industry", value: "Building Infrastructure Assessment" },
  { _key: key(), key: "Role", value: "Brand Strategist & Designer" },
  { _key: key(), key: "Timeline", value: "January – February 2026" },
  { _key: key(), key: "Scope", value: "Identity, Color System, Typography, Voice, Brand Kit" },
  { _key: key(), key: "Tools", value: "Figma, Procreate, Flora, Remotion, Claude" },
];

function buildSections(sectionImages) {
  return [
    // 1. Overview (text only — video is above via muxVideo field, Figma embed via figmaUrl)
    {
      _key: key(),
      sectionTitle: "Overview",
      layout: "text-first",
      sectionBody: textToBlocks(
        `Arête assesses building infrastructure — measuring what exists, reporting what's found. The brief: build an identity that reflects that discipline.

*Arête* (ah-reh-TAY) is Greek for excellence through practice. Not aspiration — fulfillment of function. The tagline, *Built on Truth*, describes both the method and its subject.`
      ),
    },

    // 2. The Mark
    {
      _key: key(),
      sectionTitle: "The Mark",
      layout: "full-width",
      sectionBody: textToBlocks(
        `The mark is an archipendulum — an A-frame level used since the time of the pyramids. A plumb line hangs from the apex. When it bisects the crossbar at center, the surface is level. When it runs parallel to the legs, the wall is plumb.

The "A" in Arête is the tool. The tool is the method.`
      ),
      sectionGallery: sectionImages["The Mark"] || [],
    },

    // 3. Exploration
    {
      _key: key(),
      sectionTitle: "Exploration",
      layout: "full-width",
      sectionBody: textToBlocks(
        `Dozens of directions were explored before the archipendulum emerged — mountains, cornerstones, cubes, arches, temples, feather pens, 3D letterforms. Each was sketched, iterated, and evaluated against the brand's core principle: structural truth.

The archipendulum won because it does what the company does. It verifies.`
      ),
      sectionGallery: sectionImages["Exploration"] || [],
    },

    // 4. Color System
    {
      _key: key(),
      sectionTitle: "Color System",
      layout: "full-width",
      sectionBody: textToBlocks(
        `Twelve palettes were built as complete working systems — not mood boards, but functional color distributions: 55% surface, 25% text, 10% support, 5% warm, 5% CTA.

**Kéramos** — named for fired clay, the material of Mediterranean construction. Sun-baked earth, aged wood, warm stone.

Alabaster (#FAF8F5) for surfaces. Graphite (#1F1A17) for text. Umber (#6B5344) for supporting elements. Sand (#D4B896) for warm accents. Terracotta (#CC7B42) for calls to action.`
      ),
      sectionGallery: sectionImages["Color System"] || [],
    },

    // 5. Typography
    {
      _key: key(),
      sectionTitle: "Typography",
      layout: "full-width",
      sectionBody: textToBlocks(
        `**Martina Plantijn** for the wordmark — a classical serif with authority and warmth. **Source Serif Pro** for body copy — legible, grounded, built for long-form reading. **Paper Mono** for accents and data — technical precision without coldness.

Each typeface carries its own weight. None compete.`
      ),
      sectionGallery: sectionImages["Typography"] || [],
    },

    // 6. Brand Voice
    {
      _key: key(),
      sectionTitle: "Brand Voice",
      layout: "full-width",
      sectionBody: textToBlocks(
        `Arête speaks with quiet authority — assured expertise without arrogance, practical wisdom without pretension. Direct, measured, grounded.

The voice principles mirror the tool: don't persuade, show what's true. Preferred language is specific — *field-verified*, *independent assessment*, *defensible findings*. Never *cutting-edge solutions* or *industry disruptors*.

**Truth over convenience** — report what you find, even when inconvenient. **Field over paper** — real assessment happens where the systems are. **Independence over incentive** — no stake in the repair. **Clarity over speed** — getting it right matters more than getting it fast.`
      ),
      sectionGallery: sectionImages["Brand Voice"] || [],
    },

    // 7. Brand in Action
    {
      _key: key(),
      sectionTitle: "Brand in Action",
      layout: "full-width",
      sectionBody: textToBlocks(
        `The identity applied to key touchpoints — a mobile website for first contact, and a construction assessment report where the work speaks for itself. Both carry the Kéramos palette, Martina Plantijn wordmark, and the archipendulum at the right scale.`
      ),
      sectionGallery: sectionImages["Brand in Action"] || [],
    },

    // 8. Deliverables
    {
      _key: key(),
      sectionTitle: "Deliverables",
      layout: "text-first",
      sectionBody: textToBlocks(
        `**Archipendulum mark** at multiple sizes with usage guidelines. **Kéramos color palette** with role-based distribution and production-ready values. **Typography system** — Martina Plantijn, Source Serif Pro, Paper Mono. **Brand voice guidelines** with copy specimens at four lengths. **12 palette explorations** as interactive HTML presentations. **Brand kit** as a working reference document. **Historical research** on the archipendulum and Greek construction. **Brand strategy** — positioning, naming rationale, and competitive context.`
      ),
    },
  ];
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const doc = await client.fetch(
    `*[_type == "archiveItem" && slug.current == "arete"][0]`
  );
  if (!doc) { console.error("Not found!"); process.exit(1); }
  console.log(`Found: ${doc._id}`);

  // Upload all images
  console.log("\\nUploading slide images...");
  const slide2 = await uploadImage(`${SLIDES}/2.png`, "Logomark construction");
  const slide8 = await uploadImage(`${SLIDES}/8.png`, "Mark on dark");
  const slide4 = await uploadImage(`${SLIDES}/4.png`, "Kéramos color system");
  const slide3 = await uploadImage(`${SLIDES}/3.png`, "Typography specimen");
  const slide6 = await uploadImage(`${SLIDES}/6.png`, "Messaging");
  const slide5 = await uploadImage(`${SLIDES}/5.png`, "Mobile mockup");
  const slide7 = await uploadImage(`${SLIDES}/7.png`, "Report cover");

  console.log("\\nUploading 10 sketch pages...");
  const sketch1 = await uploadImage(`${IMAGES}Are_1 1.png`, "Sketch 1");
  const sketch2 = await uploadImage(`${IMAGES}Arete_2 1.png`, "Sketch 2");
  const sketch3 = await uploadImage(`${IMAGES}Untitled_Artwork 1.png`, "Sketch 3");
  const sketch4 = await uploadImage(`${IMAGES}Untitled_Artwork 2.png`, "Sketch 4");
  const sketch5 = await uploadImage(`${IMAGES}Arete_5.png`, "Sketch 5");
  const sketch6 = await uploadImage(`${IMAGES}Untitled_Artwork 3.png`, "Sketch 6");
  const sketch7 = await uploadImage(`${IMAGES}Arete_7.png`, "Sketch 7");
  const sketch8 = await uploadImage(`${IMAGES}Arete_8.png`, "Sketch 8");
  const sketch9 = await uploadImage(`${IMAGES}Arete_9.png`, "Sketch 9");
  const sketch10 = await uploadImage(`${IMAGES}Arete_10.png`, "Sketch 10");

  // Map images to sections
  const sectionImages = {
    "The Mark": [
      imageRef(slide2, "Archipendulum logomark construction"),
      imageRef(slide8, "Archipendulum mark — white on dark"),
    ],
    "Exploration": [
      imageRef(sketch1, "Early A-frame and pyramid explorations"),
      imageRef(sketch2, "Logo development — proportion studies"),
      imageRef(sketch3, "Cornerstone and cube explorations"),
      imageRef(sketch4, "3D letterform studies"),
      imageRef(sketch5, "Concept map — cornerstone, plumb bob, pediment, arch"),
      imageRef(sketch6, "Organic and industrial mark directions"),
      imageRef(sketch7, "Archipendulum mark iterations"),
      imageRef(sketch8, "Temple mark iterations"),
      imageRef(sketch9, "Final archipendulum refinement"),
      imageRef(sketch10, "Mountain concept exploration and rejection"),
    ],
    "Color System": [
      imageRef(slide4, "Kéramos color system — distribution and palette"),
    ],
    "Typography": [
      imageRef(slide3, "Typography — Martina Plantijn, Source Serif Pro, Paper Mono"),
    ],
    "Brand Voice": [
      imageRef(slide6, "Brand messaging — Built on the Truth"),
    ],
    "Brand in Action": [
      imageRef(slide5, "Mobile website mockup"),
      imageRef(slide7, "Construction assessment report cover"),
    ],
  };

  const sections = buildSections(sectionImages);

  // Patch document
  console.log("\\nPatching document...");
  const result = await client
    .patch(doc._id)
    .set({
      caseStudyMeta,
      caseStudySections: sections,
      figmaUrl: "https://www.figma.com/design/yktXOwrbNxIbZtHIItMduq/Arete---Brand-Development?node-id=149-1822&t=Pb0MehsREz2b2zYx-1",
      description: "Brand identity for a building assessment company — rooted in a 4,000-year-old leveling tool, Greek construction principles, and the pursuit of structural truth.",
    })
    .commit();

  console.log(`✓ Updated: ${result._id}`);
  console.log("\\nDone. MUX video needs to be set separately once upload completes.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
