import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateCampaign } from "./rules-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const campaignsPath = path.join(root, "data", "campaigns.json");
const outPath = path.join(root, "docs", "digest.md");

const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
const derived = campaigns.map((c) => ({ ...c, derived: evaluateCampaign(c) }));

const counts = derived.reduce(
  (acc, c) => {
    acc[c.derived.status] += 1;
    return acc;
  },
  { green: 0, amber: 0, red: 0, critical: 0 }
);

const hot = derived.filter((c) => c.derived.status === "red" || c.derived.status === "critical");

const lines = [];
lines.push("# Portfolio Health Digest");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Status Count");
lines.push("");
lines.push(`- Green: ${counts.green}`);
lines.push(`- Amber: ${counts.amber}`);
lines.push(`- Red: ${counts.red}`);
lines.push(`- Critical: ${counts.critical}`);
lines.push("");
lines.push("## Unresolved Red/Critical");
lines.push("");
if (hot.length === 0) {
  lines.push("- None");
} else {
  for (const c of hot) {
    lines.push(`- ${c.id} (${c.client}): ${c.derived.reasons.join(", ")}`);
  }
}
lines.push("");
lines.push("## Notes");
lines.push("");
lines.push("- Source of truth: /data/*.json + /data/events.ndjson");
lines.push("- Rule priority: critical > red > amber > green");

fs.writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`Digest written to ${outPath}`);
