import assert from "node:assert/strict";
import { evaluateCampaign } from "./rules-engine.mjs";

const NOW = Date.parse("2026-02-20T12:00:00Z");

function baseCampaign() {
  return {
    id: "TEST-001",
    sectionStartDate: "2026-02-01",
    forecastDay: 20,
    bufferBurnPercent: 10,
    blockedOverdueBusinessDays: 0,
    externalDependencyBlocked: false,
    qualityRiskFlag: false,
    touchpoints: {
      planningCallDate: "2026-02-02",
      interviewDate: "2026-02-04",
      reviewRequestedAt: null,
      reviewApprovedAt: null
    },
    tokens: {
      internalProduction: true,
      review: true,
      clientTouchpoint: true
    },
    flags: {
      legalCompliance: false,
      churnThreat: false,
      reputational: false
    }
  };
}

// 1) Day-30 threshold breach flips campaign to Amber.
{
  const c = baseCampaign();
  c.forecastDay = 31;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "amber");
  assert.ok(r.reasons.includes("forecast past Day 30"));
}

// 2) 96h review wait flips to Red.
{
  const c = baseCampaign();
  c.touchpoints.reviewRequestedAt = "2026-02-16T11:00:00Z";
  c.touchpoints.reviewApprovedAt = null;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "red");
  assert.ok(r.reasons.includes("client review response over 96h"));
}

// 3) Critical flag overrides Amber/Red.
{
  const c = baseCampaign();
  c.forecastDay = 61;
  c.flags.legalCompliance = true;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "critical");
  assert.ok(r.reasons.includes("legal/compliance risk"));
}

// 4) Release blocked when token missing.
{
  const c = baseCampaign();
  c.tokens.review = false;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.canRelease, false);
}

// 5) Overdue with external dependency block becomes Red.
{
  const c = baseCampaign();
  c.blockedOverdueBusinessDays = 3;
  c.externalDependencyBlocked = true;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "red");
  assert.ok(r.reasons.includes("overdue more than 2 business days with external dependency block"));
}

// 6) Buffer burn >80% becomes Red.
{
  const c = baseCampaign();
  c.bufferBurnPercent = 81;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "red");
  assert.ok(r.reasons.includes("buffer burn over 80%"));
}

// 7) Planning call missing after 5 days becomes Amber.
{
  const c = baseCampaign();
  c.sectionStartDate = "2026-02-10";
  c.touchpoints.planningCallDate = null;
  const r = evaluateCampaign(c, NOW);
  assert.equal(r.status, "amber");
  assert.ok(r.reasons.includes("planning call not booked within 5 days"));
}

console.log("Rule tests passed (7/7).");
