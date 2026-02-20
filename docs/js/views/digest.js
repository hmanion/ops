export function renderDigest(campaigns) {
  const counts = campaigns.reduce(
    (acc, c) => {
      acc[c.derived.status] += 1;
      return acc;
    },
    { green: 0, amber: 0, red: 0, critical: 0 }
  );

  const hot = campaigns.filter((c) => c.derived.status === "red" || c.derived.status === "critical");

  return `
    <section class="panel">
      <h2>Portfolio Health Digest</h2>
      <p><span class="badge">Green ${counts.green}</span><span class="badge">Amber ${counts.amber}</span><span class="badge">Red ${counts.red}</span><span class="badge">Critical ${counts.critical}</span></p>
      <h3>Unresolved Red/Critical</h3>
      <ul>
        ${hot.map((c) => `<li>${c.id} (${c.client}) - ${c.derived.reasons.join(", ")}</li>`).join("") || "<li>None</li>"}
      </ul>
      <p class="muted">Generated live from current data files.</p>
    </section>
  `;
}
