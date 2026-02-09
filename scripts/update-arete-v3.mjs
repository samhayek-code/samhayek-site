/**
 * Arête case study v3 — final tweaks
 *
 * 1. Upload 2 bento composite PNGs, replace Exploration section gallery
 * 2. Move dark mark (slide 8) from "The Mark" to a closing section at the end
 *
 * Run: node scripts/update-arete-v3.mjs
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

async function uploadImage(filePath, label) {
  const filename = path.basename(filePath);
  console.log(`  Uploading ${label || filename}...`);
  const asset = await client.assets.upload(
    "image",
    createReadStream(filePath),
    { filename }
  );
  console.log(`  Done: ${asset._id}`);
  return asset;
}

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

async function main() {
  const doc = await client.fetch(
    `*[_type == "archiveItem" && slug.current == "arete"][0]`
  );
  if (!doc) {
    console.error("Not found!");
    process.exit(1);
  }
  console.log(`Found: ${doc._id}`);

  // Upload bento composites
  console.log("\nUploading bento composites...");
  const bento1 = await uploadImage(
    "/Users/samhayek/Desktop/Projects/Arete/sketch-explorations-1.png",
    "Sketch explorations page 1"
  );
  const bento2 = await uploadImage(
    "/Users/samhayek/Desktop/Projects/Arete/sketch-explorations-2.png",
    "Sketch explorations page 2"
  );

  // Build updated sections from existing data
  const sections = doc.caseStudySections || [];
  const updatedSections = [];
  let darkMarkImage = null;

  for (const section of sections) {
    if (section.sectionTitle === "The Mark") {
      // Keep only the first image (logomark construction), save the dark mark (second image)
      const gallery = section.sectionGallery || [];
      if (gallery.length >= 2) {
        darkMarkImage = gallery[1]; // The dark mark on dark background
      }
      updatedSections.push({
        ...section,
        sectionGallery: gallery.length > 0 ? [gallery[0]] : [],
      });
    } else if (section.sectionTitle === "Exploration") {
      // Replace gallery with 2 bento composites
      updatedSections.push({
        ...section,
        sectionGallery: [
          imageRef(bento1, "Sketch explorations — early directions"),
          imageRef(bento2, "Sketch explorations — refinement and iteration"),
        ],
      });
    } else {
      updatedSections.push(section);
    }
  }

  // Add closing section with dark mark at the end
  if (darkMarkImage) {
    // Give it a fresh key
    darkMarkImage._key = key();
    updatedSections.push({
      _key: key(),
      sectionTitle: "The Mark",
      layout: "full-width",
      sectionGallery: [darkMarkImage],
    });
  }

  // Patch the document
  console.log("\nPatching document...");
  const result = await client
    .patch(doc._id)
    .set({ caseStudySections: updatedSections })
    .commit();

  console.log(`Updated: ${result._id}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
