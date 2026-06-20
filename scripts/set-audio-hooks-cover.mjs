#!/usr/bin/env node
/**
 * Set the combined Audio-Hooks card cover to content/tools/audio-hooks-art.png,
 * replacing the SC2 placeholder reused during the merge.
 * Run: npx sanity exec scripts/set-audio-hooks-cover.mjs --with-user-token
 */
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;
import { readFileSync } from "fs";
import { resolve, basename } from "path";

const client = getCliClient({ apiVersion: "2024-01-01" });
const DOC_ID = "c7D10UIoL2h5Xn5KWH2MV4"; // Audio-Hooks (slug: audio-hooks)
const IMAGE_PATH = resolve("content/tools/audio-hooks-art.png");

async function main() {
  console.log("Uploading cover image...");
  const buffer = readFileSync(IMAGE_PATH);
  const asset = await client.assets.upload("image", buffer, {
    filename: basename(IMAGE_PATH),
    contentType: "image/png",
  });
  console.log(`  Image asset: ${asset._id}`);

  await client
    .patch(DOC_ID)
    .set({
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();
  console.log(`Done. ${DOC_ID} coverImage updated to audio-hooks-art.`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
