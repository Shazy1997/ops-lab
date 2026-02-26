# Permission Gates — Usage Guide

Reference for agents and operators using the Tier-3 permission-gated wrappers.

---

## When to Use Permission Gates

Any command that touches:
- **System state** (package installs, service restarts)
- **Networking** (SSH, remote connections)
- **Credentials** (tokens, keys, passwords)
- **Remote hosts** (any SSH/SCP/rsync operation)

Must go through `safe_exec.sh` or `safe_ssh.sh`.

---

## safe_exec.sh — Local Sensitive Commands

**Usage:**
```bash
scripts/safe_exec.sh --reason "<why>" -- <cmd> [args...]
```

### Examples

**Install dependencies:**
```bash
scripts/safe_exec.sh --reason "Install project deps" -- npm ci
```

**Git push (requires approval):**
```bash
scripts/safe_exec.sh --reason "Push feature branch" -- git push origin feature/xyz
```

**Docker operations:**
```bash
scripts/safe_exec.sh --reason "Rebuild container" -- docker compose build
```

**Run safe commands (no approval needed):**
```bash
scripts/safe_exec.sh --reason "List files" -- ls -la
# Runs directly — no prompt for non-sensitive commands
```

### What Triggers Approval

Commands matching these patterns require Y/N approval:
- `ssh`, `scp`, `rsync`
- `git push`
- `gh repo delete`, `gh auth logout`
- Any command with `token`, `key`, `password`, `secret` in args

### What Gets Blocked

These patterns are **hard-blocked** (require `ALLOW_DENYLIST_OVERRIDE=1`):
- `rm -rf /`, `rm -rf ~`, `rm -rf .`
- `sudo`, `mkfs`, `dd`, `shutdown`, `reboot`
- `chmod -R`, `chown -R`
- Paths like `/etc/`, `~/.ssh/`, `~/.aws/`

---

## safe_ssh.sh — Remote Operations

**Usage:**
```bash
scripts/safe_ssh.sh --reason "<why>" --host "<user@host>" -- "<remote_cmd>"
scripts/safe_ssh.sh --reason "<why>" --host "<user@host>" --interactive
```

### Examples

**Check logs on remote host:**
```bash
scripts/safe_ssh.sh --reason "Check HA logs" --host "pi@raspberrypi" -- "tail -n 200 /var/log/homeassistant.log"
```

**Restart a service:**
```bash
scripts/safe_ssh.sh --reason "Restart mosquitto" --host "pi@raspberrypi" -- "systemctl restart mosquitto"
```

**Interactive SSH session:**
```bash
scripts/safe_ssh.sh --reason "Debug network issue" --host "admin@server" --interactive
```

**With custom SSH options:**
```bash
scripts/safe_ssh.sh --reason "Connect to non-standard port" --host "user@host" --ssh-opts "-p 2222" -- "uptime"
```

---

## What Counts as "Sensitive"

| Category | Examples | Wrapper |
|----------|----------|---------|
| Remote access | SSH, SCP, rsync | `safe_ssh.sh` |
| VCS operations | git push, gh repo delete | `safe_exec.sh` |
| Package mgmt | npm ci, apt install | `safe_exec.sh` |
| Docker | docker build, compose up | `safe_exec.sh` |
| System config | editing configs, restarts | `safe_exec.sh` |
| Credential handling | anything with token/key | `safe_exec.sh` |

---

## Non-Interactive Environments (CI, OpenClaw)

In headless contexts (no TTY):
- Default behavior: **prompts still appear** but may hang waiting for input
- For automated approval: implement an `AUTO_APPROVE=1` environment variable (future work)
- Current recommendation: avoid running approval-gated commands in CI unless you can provide input

---

## Logging

All approval requests are logged to `notes/approvals.log`:

```
2026-02-26T09:10:00Z | user@host | /path/to/cwd | APPROVED | reason | command
2026-02-26T09:10:05Z | user@host | /path/to/cwd | DENIED | reason | command
```

**Important:** This log is gitignored to avoid committing hostnames and commands.

---

## Override Mechanism (Emergency Only)

To execute a hard-blocked command:

```bash
ALLOW_DENYLIST_OVERRIDE=1 scripts/safe_exec.sh --reason "Emergency" -- <blocked_cmd>
```

This still requires Y/N approval. Use sparingly.

---

## Quick Reference

```bash
# Safe local command (auto-runs if non-sensitive)
scripts/safe_exec.sh --reason "why" -- echo hello

# Sensitive local command (prompts for approval)
scripts/safe_exec.sh --reason "why" -- git push

# Remote command (always prompts)
scripts/safe_ssh.sh --reason "why" --host "user@host" -- "cmd"

# Interactive SSH (always prompts)
scripts/safe_ssh.sh --reason "why" --host "user@host" --interactive

# Override blocked command (still prompts)
ALLOW_DENYLIST_OVERRIDE=1 scripts/safe_exec.sh --reason "why" -- sudo cmd
```
