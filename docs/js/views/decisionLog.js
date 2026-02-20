export function renderDecisionLog(decisions, campaignsById, issueUrlBuilder, selectedCampaignId) {
  const rows = decisions
    .map((d) => {
      const campaign = campaignsById.get(d.campaignId);
      return `
        <tr>
          <td>${d.createdAt}</td>
          <td>${d.campaignId}</td>
          <td>${campaign ? campaign.client : "unknown"}</td>
          <td>${d.severity}</td>
          <td>${d.owner}</td>
          <td>${d.dueDate}</td>
          <td>${d.decisionText}</td>
        </tr>
      `;
    })
    .join("");

  const payload = {
    type: "decision_add",
    id: `d-${Date.now()}`,
    campaignId: selectedCampaignId || "CMP-001",
    severity: "amber",
    owner: "Head of Client Services",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString().slice(0, 10),
    decisionText: "Decision text here"
  };

  const url = issueUrlBuilder(payload);

  return `
    <section class="panel">
      <h2>Decision Log</h2>
      <table>
        <thead><tr><th>Date</th><th>Campaign</th><th>Client</th><th>Severity</th><th>Owner</th><th>Due</th><th>Decision</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <section class="panel">
      <h3>Propose Decision Update</h3>
      <p class="muted">Create a prefilled GitHub issue with a structured JSON payload.</p>
      <textarea readonly>${JSON.stringify(payload, null, 2)}</textarea>
      <p>${url ? `<a class="primary" href="${url}" target="_blank" rel="noopener">Open GitHub Issue</a>` : "Set repo slug to enable issue link."}</p>
    </section>
  `;
}
