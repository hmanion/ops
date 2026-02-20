import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

if (process.argv.length < 3) {
  console.error("Usage: node scripts/apply-ops-update.mjs <payload.json>");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const payload = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const campaignsPath = path.join(root, "data", "campaigns.json");
const decisionsPath = path.join(root, "data", "decisions.json");
const eventsPath = path.join(root, "data", "events.ndjson");

const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
const decisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));

switch (payload.type) {
  case "campaign_update": {
    const idx = campaigns.findIndex((c) => c.id === payload.campaignId);
    if (idx < 0) {
      console.error(`Unknown campaignId: ${payload.campaignId}`);
      process.exit(1);
    }
    campaigns[idx] = {
      ...campaigns[idx],
      ...payload.patch,
      touchpoints: { ...campaigns[idx].touchpoints, ...(payload.patch?.touchpoints || {}) },
      gates: { ...campaigns[idx].gates, ...(payload.patch?.gates || {}) },
      tokens: { ...campaigns[idx].tokens, ...(payload.patch?.tokens || {}) },
      flags: { ...campaigns[idx].flags, ...(payload.patch?.flags || {}) }
    };
    fs.writeFileSync(campaignsPath, JSON.stringify(campaigns, null, 2) + "\n");
    if (payload.event) {
      fs.appendFileSync(eventsPath, `${JSON.stringify(payload.event)}\n`);
    }
    break;
  }
  case "decision_add": {
    decisions.push({
      id: payload.id,
      campaignId: payload.campaignId,
      severity: payload.severity,
      decisionText: payload.decisionText,
      owner: payload.owner,
      dueDate: payload.dueDate,
      createdAt: payload.createdAt
    });
    fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2) + "\n");
    break;
  }
  case "event_add": {
    fs.appendFileSync(eventsPath, `${JSON.stringify(payload.event)}\n`);
    break;
  }
  default:
    console.error(`Unsupported payload type: ${payload.type}`);
    process.exit(1);
}

console.log(`Applied payload type: ${payload.type}`);
