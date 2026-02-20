import { loadData, loadRepoSlug, saveRepoSlug, buildIssueUrl } from "./store.js";
import { evaluateAll } from "./rules.js";
import { renderControlTower } from "./views/controlTower.js";
import { renderCampaignDetail } from "./views/campaignDetail.js";
import { renderDecisionLog } from "./views/decisionLog.js";
import { renderDigest } from "./views/digest.js";

const app = document.getElementById("app");
const repoInput = document.getElementById("repoSlug");
let state = { view: "tower", selectedCampaignId: null, campaigns: [], decisions: [], events: [] };

repoInput.value = loadRepoSlug();
repoInput.addEventListener("change", () => saveRepoSlug(repoInput.value.trim()));

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.view = btn.dataset.view;
    draw();
  });
});

function issueUrlBuilder(payload) {
  return buildIssueUrl(repoInput.value.trim(), payload);
}

function draw() {
  const campaignsById = new Map(state.campaigns.map((c) => [c.id, c]));
  if (state.view === "tower") {
    app.innerHTML = renderControlTower(state.campaigns);
    app.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedCampaignId = btn.dataset.open;
        state.view = "detail";
        document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
        document.querySelector('[data-view="detail"]').classList.add("active");
        draw();
      });
    });
    return;
  }

  if (state.view === "detail") {
    app.innerHTML = renderCampaignDetail(campaignsById.get(state.selectedCampaignId), issueUrlBuilder);
    return;
  }

  if (state.view === "decisions") {
    app.innerHTML = renderDecisionLog(state.decisions, campaignsById, issueUrlBuilder, state.selectedCampaignId);
    return;
  }

  app.innerHTML = renderDigest(state.campaigns);
}

async function init() {
  const raw = await loadData();
  state = { ...state, ...raw, campaigns: evaluateAll(raw.campaigns) };
  draw();
}

init();
