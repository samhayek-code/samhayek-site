/**
 * Upload archipendulum video to MUX and print the asset/playback IDs.
 * Run: node scripts/upload-mux-video.mjs
 */

import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

async function main() {
  console.log("Creating MUX upload...");

  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      encoding_tier: "baseline",
    },
    cors_origin: "*",
  });

  console.log(`Upload URL: ${upload.url}`);
  console.log("Uploading video file...");

  // Use fetch to PUT the file to the upload URL
  const fs = await import("fs");
  const videoPath =
    "/Users/samhayek/Desktop/Projects/Arete/Remotion/out/archipendulum_share.mp4";
  const fileBuffer = fs.readFileSync(videoPath);

  const response = await fetch(upload.url, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4" },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  console.log("Upload complete. Waiting for asset to be ready...");

  // Poll for the asset to be ready
  let asset = null;
  for (let i = 0; i < 60; i++) {
    const uploadStatus = await mux.video.uploads.retrieve(upload.id);
    if (uploadStatus.asset_id) {
      asset = await mux.video.assets.retrieve(uploadStatus.asset_id);
      if (asset.status === "ready") break;
    }
    console.log(
      `  Status: ${asset?.status || "processing"}... (${i + 1}/60)`
    );
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!asset || asset.status !== "ready") {
    console.log("Asset not ready yet. Check MUX dashboard.");
    console.log("Asset ID:", asset?._id || "unknown");
    return;
  }

  const playbackId = asset.playback_ids?.[0]?.id;
  console.log("\n=== MUX Video Ready ===");
  console.log(`Asset ID: ${asset.id}`);
  console.log(`Playback ID: ${playbackId}`);
  console.log(`Status: ${asset.status}`);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
