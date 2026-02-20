function slaText(campaign) {
  const due = campaign.slaDeadline ? new Date(campaign.slaDeadline) : null;
  if (!due) return "-";
  const diffHours = Math.round((due.getTime() - Date.now()) / (1000 * 60 * 60));
  return `${diffHours}h`;
}

export function renderControlTower(campaigns) {
  const rows = campaigns
    .map((c) => {
      const reasons = c.derived.reasons.map((reason) => `<span class="badge">${reason}</span>`).join(" ");
      return `
        <tr data-campaign-id="${c.id}">
          <td><button class="primary" data-open="${c.id}">${c.id}</button></td>
          <td>${c.client}</td>
          <td>${c.owner}</td>
          <td><span class="status ${c.derived.status}">${c.derived.status}</span></td>
          <td>${c.gates.gateA}/${c.gates.gateB}/${c.gates.gateC}/${c.gates.gateD}</td>
          <td>${c.forecastDay || "-"}</td>
          <td>${slaText(c)}</td>
          <td>${reasons || "<span class=\"muted\">none</span>"}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <section class="panel">
      <h2>Portfolio Risk Board</h2>
      <p class="muted">Priority order enforced: critical > red > amber > green.</p>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Client</th><th>Owner</th><th>Status</th><th>Gates A/B/C/D</th><th>Forecast Day</th><th>SLA</th><th>Reasons</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}
