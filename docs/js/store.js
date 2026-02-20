const DATA_BASES = ["./data", "../data"];

async function fetchJsonFromCandidates(fileName) {
  for (const base of DATA_BASES) {
    try {
      const res = await fetch(`${base}/${fileName}`);
      if (!res.ok) continue;
      return res.json();
    } catch {
      // Try the next candidate path.
    }
  }
  throw new Error(`Unable to load ${fileName} from candidate data paths.`);
}

async function fetchTextFromCandidates(fileName) {
  for (const base of DATA_BASES) {
    try {
      const res = await fetch(`${base}/${fileName}`);
      if (!res.ok) continue;
      return res.text();
    } catch {
      // Try the next candidate path.
    }
  }
  throw new Error(`Unable to load ${fileName} from candidate data paths.`);
}

export async function loadData() {
  const [campaigns, decisions, eventsRaw] = await Promise.all([
    fetchJsonFromCandidates("campaigns.json"),
    fetchJsonFromCandidates("decisions.json"),
    fetchTextFromCandidates("events.ndjson")
  ]);

  const events = eventsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  return { campaigns, decisions, events };
}

export function loadRepoSlug() {
  return localStorage.getItem("repoSlug") || "";
}

export function saveRepoSlug(slug) {
  localStorage.setItem("repoSlug", slug);
}

export function buildIssueUrl(repoSlug, payload) {
  if (!repoSlug || !repoSlug.includes("/")) return "";
  const title = encodeURIComponent(`[ops-update] ${payload.type} ${payload.campaignId || payload.id || ""}`);
  const body = encodeURIComponent(
    [
      "<!-- Paste/edit the JSON payload below. -->",
      "```json",
      JSON.stringify(payload, null, 2),
      "```"
    ].join("\n")
  );
  return `https://github.com/${repoSlug}/issues/new?labels=ops-update&title=${title}&body=${body}`;
}
