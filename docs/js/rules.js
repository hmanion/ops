const HOURS = 60 * 60 * 1000;
const DAY = 24 * HOURS;

function hoursSince(ts, now) {
  if (!ts) return 0;
  return (now - new Date(ts).getTime()) / HOURS;
}

function daysSince(ts, now) {
  if (!ts) return 0;
  return (now - new Date(ts).getTime()) / DAY;
}

export function evaluateCampaign(campaign, now = Date.now()) {
  const amber = [];
  const red = [];
  const critical = [];

  if (!campaign.touchpoints?.planningCallDate && daysSince(campaign.sectionStartDate, now) > 5) {
    amber.push("planning call not booked within 5 days");
  }

  if (campaign.touchpoints?.reviewRequestedAt && !campaign.touchpoints?.reviewApprovedAt) {
    const wait = hoursSince(campaign.touchpoints.reviewRequestedAt, now);
    if (wait > 72) amber.push("client review response over 72h");
    if (wait > 96) red.push("client review response over 96h");
  }

  if ((campaign.forecastDay || 0) > 30) amber.push("forecast past Day 30");
  if ((campaign.forecastDay || 0) > 60) red.push("forecast past Day 60");

  if ((campaign.bufferBurnPercent || 0) > 50) amber.push("buffer burn over 50%");
  if ((campaign.bufferBurnPercent || 0) > 80) red.push("buffer burn over 80%");

  if (!campaign.touchpoints?.interviewDate && daysSince(campaign.sectionStartDate, now) > 21) {
    red.push("interview not completed by Day 21");
  }

  if ((campaign.blockedOverdueBusinessDays || 0) > 2 && campaign.externalDependencyBlocked) {
    red.push("overdue more than 2 business days with external dependency block");
  }

  if (campaign.qualityRiskFlag) red.push("production-editor quality risk flag");

  if (campaign.flags?.legalCompliance) critical.push("legal/compliance risk");
  if (campaign.flags?.churnThreat) critical.push("explicit churn threat");
  if (campaign.flags?.reputational) critical.push("reputational/editorial risk");

  let status = "green";
  let reasons = [];
  if (critical.length) {
    status = "critical";
    reasons = critical;
  } else if (red.length) {
    status = "red";
    reasons = red;
  } else if (amber.length) {
    status = "amber";
    reasons = amber;
  }

  const canRelease = Boolean(
    campaign.tokens?.internalProduction &&
      campaign.tokens?.review &&
      campaign.tokens?.clientTouchpoint
  );

  return { status, reasons, canRelease, amber, red, critical };
}

export function evaluateAll(campaigns, now = Date.now()) {
  return campaigns.map((campaign) => {
    const result = evaluateCampaign(campaign, now);
    return { ...campaign, derived: result };
  });
}
