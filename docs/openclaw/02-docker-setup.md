# OpenClaw — Docker Setup

Reference runbook for Docker-based OpenClaw deployment.

---

## The docker-setup.sh Script

The official setup script handles everything:

```bash
./docker-setup.sh
```

This script:
1. Builds the OpenClaw Docker image
2. Runs onboarding inside the container
3. Starts the gateway via Docker Compose
4. Generates a token and writes it to `.env`

---

## Dashboard URL

After setup, access the dashboard at:

```
http://127.0.0.1:18789/
```

---

## Token Configuration

The token is used to authenticate with the gateway.

**Where to put it:**
- Dashboard: Settings → paste token
- Environment: `OPENCLAW_GATEWAY_TOKEN=<token>`
- Config file: `gateway.auth.token` setting

The token is generated automatically and stored in `.env` after running `docker-setup.sh`.

---

## Extra Mounts

To give OpenClaw access to additional directories, use `OPENCLAW_EXTRA_MOUNTS`:

```bash
OPENCLAW_EXTRA_MOUNTS="/path/to/project1,/path/to/project2" ./docker-setup.sh
```

This generates `docker-compose.extra.yml` with the bind mounts.

**Important:**
- Don't hand-edit `docker-compose.extra.yml`
- If mounts change, rerun `docker-setup.sh`

---

## Home Volume Option

For persistent home directory storage:

```bash
OPENCLAW_HOME_VOLUME=1 ./docker-setup.sh
```

This creates a Docker volume for the container's home directory.

---

## Device Approval Flow

If you see "unauthorized/1008 pairing required":

1. Start the dashboard without auto-opening:
   ```bash
   openclaw dashboard --no-open
   ```

2. List pending devices:
   ```bash
   openclaw devices list
   ```

3. Approve the device:
   ```bash
   openclaw devices approve <device-id>
   ```

---

## Summary

```bash
# Basic setup
./docker-setup.sh

# With extra mounts
OPENCLAW_EXTRA_MOUNTS="/my/project" ./docker-setup.sh

# With persistent home
OPENCLAW_HOME_VOLUME=1 ./docker-setup.sh

# Dashboard URL
http://127.0.0.1:18789/
```
