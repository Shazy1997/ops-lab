# ops-lab

A sandboxed, guardrailed development environment for AI-assisted operations.

## Structure

```
ops-lab/
  AGENT_RULES.md          # Hard constraints for any agent operating here
  Dockerfile              # Node.js dev environment
  docker-compose.yml      # Single-command build + test
  .github/workflows/ci.yml
  src/                    # Application source
  tests/                  # Test suite
  notes/CHANGELOG.md      # Running changelog
```

## Quick Start

```bash
# Build and run tests
docker compose run --rm app npm test

# Run locally (Node 20+)
npm install
npm test
```

## Rules

See [AGENT_RULES.md](AGENT_RULES.md) for the full set of constraints that all
agents (human and AI) must follow when working in this repo.

## Future

This repo is designed to be mounted as the sole workspace for containerized AI
agents (e.g. OpenClaw). The agent container mounts only this directory and
nothing else.

---

AI review smoke test.
