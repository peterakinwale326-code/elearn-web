import fs from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(process.cwd(), "public", "media");
const coursePhotoIds = [
  "photo-1500382017468-9049fed747ef",
  "photo-1576086213369-97a306d36557",
  "photo-1532094349884-543bc11b234d",
  "photo-1635070041078-e363dbe005cb",
  "photo-1509228468518-180dd4864904",
  "photo-1556761175-b413da4baf72",
  "photo-1529107386315-e1a2ed48a620",
  "photo-1506880018603-83d5b814b5a6",
  "photo-1517836357463-d25dfeac3438",
  "photo-1581091226825-a6a2a5aee158",
  "photo-1498050108023-c5249f4df085",
  "photo-1461360228754-6e81c478b882",
  "photo-1518770660439-4636190af475",
  "photo-1561214115-f2f134cc4912",
  "photo-1546410531-bb4caa6b424d",
  "photo-1501785888041-af3ef285b470",
  "photo-1576091160399-112ba8d25d1d",
  "photo-1524368535928-5b5e00ddc76b",
  "photo-1503676260728-1c00da094a0b",
];

const destinations = [
  ["course-images", coursePhotoIds],
  ["lesson-images", coursePhotoIds],
];

await Promise.all(destinations.map(async ([folder, ids]) => {
  const destination = path.join(outputRoot, folder);
  await fs.mkdir(destination, { recursive: true });

  for (const photoId of ids) {
    const file = path.join(destination, `${photoId}.jpg`);
    try {
      await fs.access(file);
      continue;
    } catch {
      // Download missing local asset.
    }

    const source = `https://images.unsplash.com/${photoId}?fm=jpg&fit=crop&w=1200&q=82`;
    const response = await fetch(source, { headers: { "User-Agent": "Fieldnote curriculum media downloader" } });
    if (!response.ok) {
      throw new Error(`Image download failed (${response.status}): ${source}`);
    }

    await fs.writeFile(file, new Uint8Array(await response.arrayBuffer()));
  }
}));

const attribution = coursePhotoIds.map((photoId) => ({
  file: photoId,
  source: `https://images.unsplash.com/${photoId}`,
  license: "Unsplash License",
}));
await fs.writeFile(
  path.join(outputRoot, "sources.json"),
  `${JSON.stringify(attribution, null, 2)}\n`,
  "utf8",
);

const imageManifest = destinations.flatMap(([folder, ids]) =>
  ids.map((photoId) => `/media/${folder}/${photoId}.jpg`),
);
imageManifest.push("/media/lesson-images/phonetics.svg");
await fs.writeFile(
  path.join(outputRoot, "images-manifest.json"),
  `${JSON.stringify(imageManifest, null, 2)}\n`,
  "utf8",
);

console.log(`Downloaded/cached ${coursePhotoIds.length * destinations.length} local image assets.`);