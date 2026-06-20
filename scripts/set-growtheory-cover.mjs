#!/usr/bin/env node
/**
 * Set the Grow Theory case study (grow-theory-case-study) cover image to the
 * new logo mark at content/design/growtheory/Card image.png.
 * Run: npx sanity exec scripts/set-growtheory-cover.mjs --with-user-token
 */
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;
import { readFileSync } from "fs";
import { resolve, basename } from "path";

const client = getCliClient({ apiVersion: "2024-01-01" });
const DOC_ID = "grow-theory-case-study";
const IMAGE_PATH = resolve("content/design/growtheory/Card image.png");

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
  console.log(`Done. ${DOC_ID} coverImage updated.`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
