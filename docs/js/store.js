const DATA_BASE = "../data";

export async function loadData() {
  const [campaigns, decisions, eventsRaw] = await Promise.all([
    fetch(`${DATA_BASE}/campaigns.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/decisions.json`).then((r) => r.json()),
    fetch(`${DATA_BASE}/events.ndjson`).then((r) => r.text())
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
