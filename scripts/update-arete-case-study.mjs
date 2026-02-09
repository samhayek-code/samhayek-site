/**
 * Updates the Arête case study:
 * 1. Fixes palette name from "Saffron" to "Kéramos"
 * 2. Uploads images and assigns them to section galleries + cover
 *
 * Run: node scripts/update-arete-case-study.mjs
 */

import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
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

// Upload a file to Sanity and return the asset document
async function uploadImage(filePath, label) {
  const filename = path.basename(filePath);
  console.log(`  Uploading ${label || filename}...`);
  const asset = await client.assets.upload(
    "image",
    createReadStream(filePath),
    { filename }
  );
  console.log(`  ✓ ${asset._id}`);
  return asset;
}

// Build a Sanity image reference from an uploaded asset
function imageRef(asset, alt, caption) {
  const ref = {
    _type: "image",
    _key: key(),
    asset: { _type: "reference", _ref: asset._id },
  };
  if (alt) ref.alt = alt;
  if (caption) ref.caption = caption;
  return ref;
}

// ── Paths ──────────────────────────────────────────────────────────
const ARETE = "/Users/samhayek/Desktop/Projects/Arete";
const SLIDES = `${ARETE}/Branding Slides/Archipendulum`;

// Image plan:
// Cover image: Slide 1 (clean logo on light)
// Section "The Mark": Slide 2 (logomark construction) + Slide 8 (mark on dark)
// Section "Exploration: Temple": (none - sketches cover it)
// Section "Color System": Slide 4 (Kéramos color system)
// Section "Typography": Slide 3 (typography specimen)
// Section "Brand Voice": Slide 6 (messaging)
// Section "The Identity": Slide 5 (mobile mockup) + Slide 7 (report cover)
// Section "Deliverables": (none)
// Sketch composites go into a dedicated section or "The Mark"

const IMAGE_PLAN = {
  cover: { path: `${SLIDES}/1.png`, alt: "Arête archipendulum mark" },
  slides: [
    {
      path: `${SLIDES}/2.png`,
      alt: "Archipendulum logomark construction",
      section: "The Mark",
    },
    {
      path: `${SLIDES}/8.png`,
      alt: "Archipendulum mark, white on dark",
      section: "The Mark",
    },
    {
      path: `${SLIDES}/4.png`,
      alt: "Kéramos color system — distribution and palette",
      section: "Color System",
    },
    {
      path: `${SLIDES}/3.png`,
      alt: "Typography specimen — Martina Plantijn, Source Serif, Paper Mono",
      section: "Typography",
    },
    {
      path: `${SLIDES}/6.png`,
      alt: "Brand messaging — Built on the Truth",
      section: "Brand Voice",
    },
    {
      path: `${SLIDES}/5.png`,
      alt: "Mobile website mockup",
      section: "The Identity",
    },
    {
      path: `${SLIDES}/7.png`,
      alt: "Report cover mockup",
      section: "The Identity",
    },
  ],
  sketches: [
    {
      path: `${ARETE}/sketch-explorations-1.png`,
      alt: "Early mark explorations — pyramids, cubes, A-frames, 3D studies",
      section: "The Mark",
      caption: "Early explorations",
    },
    {
      path: `${ARETE}/sketch-explorations-2.png`,
      alt: "Archipendulum refinement iterations and temple mark exploration",
      section: "Exploration: Temple",
      caption: "Refinement and temple exploration",
    },
  ],
};

async function main() {
  // 1. Get the existing document
  const doc = await client.fetch(
    `*[_type == "archiveItem" && slug.current == "arete"][0]`
  );
  if (!doc) {
    console.error("Arête document not found!");
    process.exit(1);
  }
  console.log(`Found document: ${doc._id}`);

  // 2. Upload all images
  console.log("\nUploading images...");
  const coverAsset = await uploadImage(
    IMAGE_PLAN.cover.path,
    "Cover"
  );

  // Upload slides and sketches, tracking which section they belong to
  const sectionImages = {}; // sectionTitle -> [imageRef, ...]
  for (const item of [...IMAGE_PLAN.slides, ...IMAGE_PLAN.sketches]) {
    const asset = await uploadImage(item.path, item.alt);
    if (!sectionImages[item.section]) sectionImages[item.section] = [];
    sectionImages[item.section].push(
      imageRef(asset, item.alt, item.caption)
    );
  }

  // 3. Update sections with gallery images
  const updatedSections = doc.caseStudySections.map((section) => {
    const images = sectionImages[section.sectionTitle];
    if (images) {
      return { ...section, sectionGallery: images };
    }
    return section;
  });

  // 4. Fix palette name: Saffron → Kéramos in all section bodies
  function replaceInBlocks(blocks) {
    if (!blocks) return blocks;
    return blocks.map((block) => {
      if (block._type === "block" && block.children) {
        return {
          ...block,
          children: block.children.map((child) => {
            if (child._type === "span" && child.text) {
              return {
                ...child,
                text: child.text
                  .replace(/Saffron/g, "Kéramos")
                  .replace(/saffron/g, "kéramos"),
              };
            }
            return child;
          }),
        };
      }
      return block;
    });
  }

  const finalSections = updatedSections.map((section) => ({
    ...section,
    sectionBody: replaceInBlocks(section.sectionBody),
  }));

  // Also fix meta if needed
  const finalMeta = doc.caseStudyMeta;

  // 5. Patch the document
  console.log("\nPatching document...");
  const result = await client
    .patch(doc._id)
    .set({
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: coverAsset._id },
      },
      caseStudySections: finalSections,
      caseStudyMeta: finalMeta,
    })
    .commit();

  console.log(`✓ Updated: ${result._id}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
