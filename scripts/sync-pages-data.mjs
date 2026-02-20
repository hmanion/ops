import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "data");
const targetDir = path.join(root, "docs", "data");

fs.mkdirSync(targetDir, { recursive: true });

for (const fileName of ["campaigns.json", "decisions.json", "events.ndjson"]) {
  const src = path.join(sourceDir, fileName);
  const dst = path.join(targetDir, fileName);
  fs.copyFileSync(src, dst);
  console.log(`Copied ${src} -> ${dst}`);
}
