import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { evaluateCampaign } from "./rules-engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const schemaDir = path.join(root, "schemas");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateFile(schemaPath, jsonPath, label) {
  const schema = readJson(schemaPath);
  const data = readJson(jsonPath);
  const validate = ajv.compile(schema);
  const ok = validate(data);
  if (!ok) {
    console.error(`Schema validation failed for ${label}`);
    for (const err of validate.errors || []) {
      console.error(`- ${err.instancePath || "/"} ${err.message}`);
    }
    process.exit(1);
  }
  return data;
}

function validateEvents(eventsRaw, eventSchemaPath) {
  const schema = readJson(eventSchemaPath);
  const validate = ajv.compile(schema);
  const lines = eventsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    let event;
    try {
      event = JSON.parse(lines[i]);
    } catch {
      console.error(`Invalid JSON in events.ndjson at line ${i + 1}`);
      process.exit(1);
    }

    if (!validate(event)) {
      console.error(`Event schema validation failed at line ${i + 1}`);
      for (const err of validate.errors || []) {
        console.error(`- ${err.instancePath || "/"} ${err.message}`);
      }
      process.exit(1);
    }
  }
}

function validateRuleDeterminism(campaigns) {
  for (const campaign of campaigns) {
    const resultA = evaluateCampaign(campaign, Date.parse("2026-02-20T12:00:00Z"));
    const resultB = evaluateCampaign(campaign, Date.parse("2026-02-20T12:00:00Z"));
    if (JSON.stringify(resultA) !== JSON.stringify(resultB)) {
      console.error(`Nondeterministic rule result for ${campaign.id}`);
      process.exit(1);
    }
    if (resultA.status === "critical" && !resultA.critical.length) {
      console.error(`Critical status without critical reasons: ${campaign.id}`);
      process.exit(1);
    }
  }
}

const campaigns = validateFile(
  path.join(schemaDir, "campaign.schema.json"),
  path.join(dataDir, "campaigns.json"),
  "campaigns.json"
);

const decisions = validateFile(
  path.join(schemaDir, "decision.schema.json"),
  path.join(dataDir, "decisions.json"),
  "decisions.json"
);

const campaignIds = new Set(campaigns.map((c) => c.id));
for (const d of decisions) {
  if (!campaignIds.has(d.campaignId)) {
    console.error(`Decision ${d.id} references unknown campaign ${d.campaignId}`);
    process.exit(1);
  }
}

validateEvents(
  fs.readFileSync(path.join(dataDir, "events.ndjson"), "utf8"),
  path.join(schemaDir, "event.schema.json")
);
validateRuleDeterminism(campaigns);

console.log("Data and schema validation passed.");
