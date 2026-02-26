# Changelog

## 2026-02-26T09:01Z — Permission Gates Toolkit + OpenClaw Docs

### PART 1: Permission Gates (Tier 3 Safety)
- Added `security/DENYLIST.md` — hard-block and sensitive command patterns
- Added `scripts/approve.sh` — interactive approval prompt with logging
- Added `scripts/safe_exec.sh` — permission-gated command execution wrapper
- Added `scripts/safe_ssh.sh` — SSH wrapper always requiring approval
- Updated `AGENT_RULES.md` — added rule #7 "Permission Gates (Tier 3)"
- Extended `scripts/guardrails-check.mjs` — CI now blocks direct ssh/scp/rsync
  and sudo usage in scripts (except allowed files)
- Added `tests/approval.test.mjs` — tests for approve.sh y/n flow + logging
- Added `tests/safe_exec.test.mjs` — tests for denylist blocking + overrides
- Added `security/` and `docs/` to allowed top-level directories

### PART 2: OpenClaw + Warp Documentation
- Added `docs/openclaw/01-getting-started.md` — prerequisites, CLI onboarding
- Added `docs/openclaw/02-docker-setup.md` — docker-setup.sh flow, extra mounts
- Added `docs/openclaw/03-dashboard-security.md` — localhost, SSH tunnel, tokens
- Added `docs/warp/warp-agent-action-notes.md` — WARP_API_KEY, workflow patterns

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
