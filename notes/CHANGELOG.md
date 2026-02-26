# Changelog

## 2026-02-26T08:17Z — Smoke Test: AI Review Workflow

- Added smoke test line to README.md to validate the full review loop
- Fixed Dockerfile: install git in Alpine so guardrails test can run

## 2026-02-26T08:05Z — Branch Protection + Touch List Enforcement

- Enabled branch protection on `main`: require PR, require `Guardrails Check` +
  `Build & Test` status checks, enforce for admins, require conversation resolution
- Added Touch List enforcement step in CI: PRs without `## Touch List` or
  `## Files changed` in the description will fail the guardrails job
- Fixed false positives in guardrails-check.mjs (shebangs, comments, regex defs)

## 2026-02-26T07:54Z — Guardrails Enforcement + AI Review Loop

- Added `scripts/guardrails-check.mjs` — enforces containment, no duplicates,
  no absolute paths, and CHANGELOG updates on PRs
- Added `guardrails` CI job that runs before build-and-test
- Added `.github/workflows/ai-review.yml` — Warp Agent Action reviews every PR
  against AGENT_RULES.md, requests changes on violations, approves if clean
- Added `.github/dependabot.yml` — weekly updates for npm + GitHub Actions deps
- Updated `AGENT_RULES.md` — added rule #6 "Touch List Required on Every PR"
- Added `tests/guardrails.test.mjs` — smoke test for the guardrails script
- Added `npm run guardrails` script

## 2026-02-26 — Initial Scaffold

- Created project structure: `src/`, `tests/`, `notes/`, `.github/workflows/`
- Added `AGENT_RULES.md` with hard constraints and pre-flight checklist
- Added `Dockerfile` (Node 20 Alpine) and `docker-compose.yml`
- Added GitHub Actions CI workflow (build → test → fail on error)
- Added smoke test (`tests/smoke.test.mjs`) for `healthCheck()`
- ES module configuration with Jest 29
