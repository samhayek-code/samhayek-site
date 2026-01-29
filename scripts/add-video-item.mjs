#!/usr/bin/env node

import { createClient } from "@sanity/client";
import Mux from "@mux/mux-node";
import { statSync, createReadStream, existsSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import { createInterface } from "readline";

// Load .env.local
config({ path: ".env.local" });

// Sanity client with write access
const sanityClient = createClient({
  projectId: "jpxmevq8",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// MUX client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = "") {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const validTypes = [
  "Design",
  "Music",
  "Art",
  "Writing",
  "Downloads",
  "Tools",
  "Shop",
  "Connect",
  "Lab",
];

async function uploadToMux(filePath) {
  console.log(`\n  Creating MUX upload...`);

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
    cors_origin: "*",
  });

  console.log(`  Uploading to MUX...`);

  const fullPath = resolve(process.cwd(), filePath);
  const stats = statSync(fullPath);

  const response = await fetch(upload.url, {
    method: "PUT",
    headers: {
      "Content-Type": "video/quicktime",
      "Content-Length": stats.size.toString(),
    },
    body: createReadStream(fullPath),
    duplex: "half",
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  console.log(`  Waiting for MUX to process...`);

  let asset = null;
  let attempts = 0;
  const maxAttempts = 60;

  while (!asset && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const uploadStatus = await mux.video.uploads.retrieve(upload.id);

    if (uploadStatus.asset_id) {
      asset = await mux.video.assets.retrieve(uploadStatus.asset_id);
      if (asset.status === "ready") {
        console.log(`  ✓ MUX asset ready: ${asset.id}`);
        break;
      } else if (asset.status === "errored") {
        throw new Error("MUX asset processing failed");
      }
      asset = null;
    }

    process.stdout.write(`  Processing (${attempts * 5}s)...\r`);
  }

  if (!asset) {
    throw new Error("Timeout waiting for MUX asset");
  }

  return asset;
}

async function createMuxVideoAssetInSanity(muxAsset) {
  const doc = {
    _type: "mux.videoAsset",
    assetId: muxAsset.id,
    playbackId: muxAsset.playback_ids[0].id,
    status: muxAsset.status,
    data: muxAsset,
  };

  const created = await sanityClient.create(doc);
  console.log(`  ✓ Created Sanity mux.videoAsset: ${created._id}`);
  return created;
}

async function createArchiveItem(data, muxVideoAssetId) {
  const doc = {
    _type: "archiveItem",
    title: data.title,
    slug: { _type: "slug", current: data.slug },
    type: data.type,
    label: data.label,
    cta: data.cta,
    year: data.year,
    date: `${data.year}-01-01`,
    order: data.order ? parseInt(data.order) : 0,
    description: data.description,
    muxVideo: {
      _type: "mux.video",
      asset: {
        _type: "reference",
        _ref: muxVideoAssetId,
      },
    },
  };

  const created = await sanityClient.create(doc);
  console.log(`  ✓ Created archiveItem: ${created._id}`);
  return created;
}

async function main() {
  console.log("\n📹 Add Video Item to Archive\n");
  console.log("This script uploads a video to MUX and creates a Sanity document.\n");

  // Gather inputs
  const filePath = await ask("Video file path");

  if (!filePath) {
    console.log("❌ Video file path is required.");
    rl.close();
    process.exit(1);
  }

  if (!existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    rl.close();
    process.exit(1);
  }

  const title = await ask("Title");
  if (!title) {
    console.log("❌ Title is required.");
    rl.close();
    process.exit(1);
  }

  const slug = await ask("Slug", slugify(title));

  console.log(`\nTypes: ${validTypes.join(", ")}`);
  const type = await ask("Type", "Design");
  if (!validTypes.includes(type)) {
    console.log(`❌ Invalid type. Must be one of: ${validTypes.join(", ")}`);
    rl.close();
    process.exit(1);
  }

  const label = await ask("Label", "Video");
  const description = await ask("Description");
  const cta = await ask("CTA button text", "View");
  const year = await ask("Year", new Date().getFullYear().toString());
  const order = await ask("Order (0=default, 100+=end)", "0");

  // Confirm
  console.log("\n--- Review ---");
  console.log(`  File: ${filePath}`);
  console.log(`  Title: ${title}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Type: ${type}`);
  console.log(`  Label: ${label}`);
  console.log(`  Description: ${description}`);
  console.log(`  CTA: ${cta}`);
  console.log(`  Year: ${year}`);
  console.log(`  Order: ${order}`);

  const confirm = await ask("\nProceed? (y/n)", "y");

  if (confirm.toLowerCase() !== "y") {
    console.log("Cancelled.");
    rl.close();
    process.exit(0);
  }

  rl.close();

  // Execute
  console.log("\n--- Creating ---");

  try {
    const muxAsset = await uploadToMux(filePath);
    const sanityVideoAsset = await createMuxVideoAssetInSanity(muxAsset);
    await createArchiveItem(
      { title, slug, type, label, description, cta, year, order },
      sanityVideoAsset._id
    );

    console.log("\n✅ Done! Your video item is now live.");
    console.log("   (Site updates within 60 seconds due to caching)\n");
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
