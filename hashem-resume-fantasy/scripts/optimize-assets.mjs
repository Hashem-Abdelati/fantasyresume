import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  meshopt,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import { readFile, writeFile, stat, mkdir, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const manifest = JSON.parse(
  await readFile("public/models/manifest.json", "utf8"),
);
for (const asset of manifest.assets) {
  const file = `public/models/${asset.file}`;
  if (asset.optimizedBytes === (await stat(file)).size) continue;
  const doc = await io.read(file);
  await doc.transform(
    dedup(),
    prune(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [512, 512],
      quality: 85,
    }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(file, doc);
  asset.optimizedBytes = (await stat(file)).size;
  await sharp(file.replace(".glb", ".png"))
    .webp({ quality: 88 })
    .toFile(file.replace(".glb", ".webp"));
}
// The same basalt maps skin the permanent room and the doorway.
for (const suffix of ["color", "normal", "roughness"]) {
  await sharp(`public/models/materials/basalt-${suffix}.png`)
    .webp({ quality: suffix === "normal" ? 95 : 85 })
    .toFile(`public/models/materials/basalt-${suffix}.webp`);
}
await writeFile(
  "public/models/manifest.json",
  JSON.stringify(manifest, null, 2),
);
await mkdir("public/inventory/web", { recursive: true });
for (const file of await readdir("public/inventory")) {
  if (!/\.(png|jpe?g|heic)$/i.test(file)) continue;
  let input = `public/inventory/${file}`;
  if (
    /\.heic$/i.test(file) ||
    ["meonmountin.png", "sunset.png", "yosemite.png", "yosemite2.png"].includes(
      file,
    )
  ) {
    const temp = `/private/tmp/codex-${file}.jpg`;
    execFileSync("sips", ["-s", "format", "jpeg", input, "--out", temp], {
      stdio: "ignore",
    });
    input = temp;
  }
  await sharp(input)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(`public/inventory/web/${file.replace(/\.[^.]+$/, ".webp")}`);
}
await sharp("public/Hashem2.jpeg")
  .rotate()
  .resize({ width: 800, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile("public/portrait.webp");
console.log(JSON.stringify(manifest, null, 2));
