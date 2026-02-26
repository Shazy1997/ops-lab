# Changelog

## 2026-02-26 — Initial Scaffold

- Created project structure: `src/`, `tests/`, `notes/`, `.github/workflows/`
- Added `AGENT_RULES.md` with hard constraints and pre-flight checklist
- Added `Dockerfile` (Node 20 Alpine) and `docker-compose.yml`
- Added GitHub Actions CI workflow (build → test → fail on error)
- Added smoke test (`tests/smoke.test.mjs`) for `healthCheck()`
- ES module configuration with Jest 29
