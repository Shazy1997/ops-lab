# OpenClaw — Dashboard Security

Reference runbook for securing the OpenClaw Dashboard (Control UI).

---

## What the Dashboard Is

The Dashboard (Control UI) is the admin surface for OpenClaw:
- Chat interface
- Configuration management
- Execution approval prompts

**Do not expose it publicly.**

---

## Access Methods (Recommended)

### Option 1: Localhost Only (Default)

The safest approach — keep the dashboard bound to localhost:

```
http://127.0.0.1:18789/
```

Only accessible from the local machine.

---

### Option 2: SSH Tunnel (Remote Access)

For remote access without exposing the port:

```bash
ssh -N -L 18789:127.0.0.1:18789 user@remote-host
```

Then open locally:
```
http://127.0.0.1:18789/
```

The tunnel forwards your local port to the remote machine's localhost.

---

### Option 3: Tailscale Serve

If using Tailscale, you can use Tailscale Serve to expose the dashboard
securely to your Tailnet:

```bash
tailscale serve --bg 18789
```

Access via your Tailscale hostname. Only devices on your Tailnet can connect.

---

## Token Authentication

- Token is required at WebSocket handshake
- Token is stored in browser localStorage after successful connection
- Never share the token publicly
- Rotate the token if compromised (rerun `docker-setup.sh`)

---

## What NOT to Do

- ❌ Don't expose port 18789 directly to the internet
- ❌ Don't disable token authentication
- ❌ Don't share the token in public repos or chat
- ❌ Don't use HTTP over untrusted networks (use SSH tunnel instead)

---

## Quick Reference

```bash
# Local access (safest)
http://127.0.0.1:18789/

# SSH tunnel for remote
ssh -N -L 18789:127.0.0.1:18789 user@host
# then open http://127.0.0.1:18789/ locally

# Tailscale Serve
tailscale serve --bg 18789
```
