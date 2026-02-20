# Ops Manage - GitHub Pages Control Tower

Static control tower web app for campaign risk, gates, escalation, and decision tracking.

## Stack
- Frontend: HTML/CSS/JavaScript modules in `/docs`
- Data source of truth: `/data/*.json` and `/data/events.ndjson`
- Validation: JSON Schema + CLI script (`npm run validate:data`)
- Digest generation: `npm run build:digest`
- Deployment: GitHub Pages (`.github/workflows/pages.yml`)

## Local usage

```bash
npm ci
npm run validate:data
npm run test:rules
npm run build:digest
```

Run local dev server:

```bash
npm run dev
```

Then open `http://localhost:8080/docs/`.

## Update flow (Issue -> PR)
1. Open a GitHub issue using template **Ops Update** (label `ops-update`).
2. Put valid JSON payload in the issue body.
3. Workflow `process-ops-update.yml` extracts payload, applies it with `scripts/apply-ops-update.mjs`, validates data, and opens a PR.

Supported payload types:
- `campaign_update`
- `decision_add`
- `event_add`

## Weekly digest
- Workflow `weekly-digest.yml` runs Thursday and opens a PR with updated `/docs/digest.md`.

## Notes
- This v1 is optimized for internal usage and deterministic rule evaluation.
- Do not store sensitive client data if repository/pages visibility is public.
