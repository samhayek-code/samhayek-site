#!/usr/bin/env node
/**
 * Update the Resume item's description (the bio line shown atop the resume modal)
 * to match the new resume PDF.
 * Run: npx sanity exec scripts/set-resume-bio.mjs --with-user-token
 */
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;

const client = getCliClient({ apiVersion: "2024-01-01" });
const NEW_BIO =
  "Design engineer and creative generalist with 10+ years of experience building identities, shipping products, and growing communities for startups.";

async function main() {
  const doc = await client.fetch(
    `*[_type == "archiveItem" && slug.current == "resume"][0]{ _id, description }`
  );
  if (!doc) throw new Error("Resume item not found");
  await client.patch(doc._id).set({ description: NEW_BIO }).commit();
  console.log(`Updated ${doc._id} description -> new bio.`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}\n`);
  process.exit(1);
});
