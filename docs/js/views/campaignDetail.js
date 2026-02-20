export function renderCampaignDetail(campaign, issueUrlBuilder) {
  if (!campaign) {
    return `<section class="panel"><p>Select a campaign from the Control Tower table.</p></section>`;
  }

  const r = campaign.derived;

  const payload = {
    type: "campaign_update",
    campaignId: campaign.id,
    patch: {
      forecastDay: campaign.forecastDay,
      gates: { ...campaign.gates },
      tokens: { ...campaign.tokens },
      touchpoints: { ...campaign.touchpoints },
      flags: { ...campaign.flags }
    },
    event: {
      timestamp: new Date().toISOString(),
      campaignId: campaign.id,
      triggerCode: "MANUAL_UPDATE",
      oldStatus: campaign.derived.status,
      newStatus: campaign.derived.status,
      slaDeadline: campaign.slaDeadline || new Date().toISOString()
    }
  };

  const issueUrl = issueUrlBuilder ? issueUrlBuilder(payload) : "";

  return `
    <section class="panel">
      <h2>${campaign.id} - ${campaign.client}</h2>
      <p>Lane: <code>${campaign.lane}</code> | Owner: <code>${campaign.owner}</code> | Review Class: <code>${campaign.reviewClass}</code></p>
      <p>Status: <span class="status ${r.status}">${r.status}</span></p>
      <p>Release eligibility: <strong>${r.canRelease ? "allowed" : "blocked (missing tokens)"}</strong></p>
    </section>

    <section class="panel grid">
      <div>
        <h3>Gates</h3>
        <ul>
          <li>Gate A: ${campaign.gates.gateA}</li>
          <li>Gate B: ${campaign.gates.gateB}</li>
          <li>Gate C: ${campaign.gates.gateC}</li>
          <li>Gate D: ${campaign.gates.gateD}</li>
        </ul>
      </div>
      <div>
        <h3>Touchpoints</h3>
        <ul>
          <li>Planning call: ${campaign.touchpoints.planningCallDate || "pending"}</li>
          <li>Interview: ${campaign.touchpoints.interviewDate || "pending"}</li>
          <li>Review requested: ${campaign.touchpoints.reviewRequestedAt || "pending"}</li>
          <li>Review approved: ${campaign.touchpoints.reviewApprovedAt || "pending"}</li>
        </ul>
      </div>
      <div>
        <h3>Risk Reasons</h3>
        <ul>${(r.reasons.length ? r.reasons : ["none"]).map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="panel">
      <h3>Propose Campaign Update</h3>
      <p class="muted">Use this payload to update campaign fields through the Issue -> PR workflow.</p>
      <textarea readonly>${JSON.stringify(payload, null, 2)}</textarea>
      <p>${issueUrl ? `<a class="primary" href="${issueUrl}" target="_blank" rel="noopener">Open GitHub Issue</a>` : "Set repo slug to enable issue link."}</p>
    </section>
  `;
}
