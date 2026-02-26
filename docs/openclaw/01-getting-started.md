# OpenClaw — Getting Started

Reference runbook for future agents setting up OpenClaw.

---

## Prerequisites

- **Node.js 22+** is required for OpenClaw itself
  - ops-lab can stay on Node 20; keep runtimes separate
- Docker (for containerized setup)
- A Warp account (for API keys)

---

## Fastest First Chat: Control UI (Dashboard)

The quickest way to start chatting with OpenClaw is through the Dashboard (Control UI).

After setup, open: `http://127.0.0.1:18789/`

---

## CLI Onboarding

For CLI-based setup:

```bash
openclaw onboard --install-daemon
```

This:
1. Creates default configuration
2. Installs the daemon for background operation
3. Generates authentication tokens

---

## Check Gateway Status

Verify the gateway is running:

```bash
openclaw gateway status
```

Or check the dashboard at `http://127.0.0.1:18789/` — if it loads, the gateway is up.

---

## Key Concepts

- **Gateway**: Background service that handles agent communication
- **Dashboard (Control UI)**: Web interface for chat, config, and exec approvals
- **Token**: Authentication credential for connecting to the gateway

---

## Next Steps

- [02-docker-setup.md](02-docker-setup.md) — Full Docker-based setup
- [03-dashboard-security.md](03-dashboard-security.md) — Securing the dashboard
