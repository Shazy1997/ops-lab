# Command Denylist — Permission Gates

This document defines commands that are either **hard-blocked** or require
**explicit approval** before execution. All patterns are enforced by
`scripts/safe_exec.sh`.

---

## A. HARD-BLOCKED Commands

These commands are **never allowed** unless `ALLOW_DENYLIST_OVERRIDE=1` is set
AND the operator still approves via `scripts/approve.sh`.

### Destructive System Commands
- `rm -rf /` — wipe root
- `rm -rf ~` — wipe home
- `rm -rf .` — wipe cwd (often repo root)
- `mkfs` — format filesystem
- `dd` — raw disk write (can destroy data)
- `shutdown`, `reboot` — system control
- `launchctl` — macOS service control
- `csrutil` — macOS SIP control
- `diskutil erase*` — disk erasure

### Recursive Permission Changes
- `chmod -R` — recursive permission change
- `chown -R` — recursive ownership change

### Privilege Escalation
- `sudo` — blocked by default (no sudo in repo scripts)

### Sensitive System Paths
Editing or touching these paths is blocked:
- `/etc/*`
- `/System/*`
- `/Library/LaunchDaemons/*`
- `~/.ssh/*` (unless explicitly allowlisted)
- `~/.aws/*`
- `~/.config/*`

### Destructive Docker Commands
- `docker system prune -a`
- `docker volume rm`
- `docker rm -f`

---

## B. SENSITIVE Commands (Always Require Approval)

These commands are allowed but **must always prompt for approval** via
`scripts/approve.sh`:

### Remote Access
- `ssh` — remote shell
- `scp` — secure copy
- `rsync` — remote sync

### Git/GitHub Operations
- `git push` — pushing commits
- `gh repo delete` — deleting repos
- `gh auth logout` — logging out

### Token/Secret Detection
Any command containing these substrings in arguments triggers approval:
- `token`
- `key`
- `password`
- `secret`
- `credential`
- `api_key`
- `apikey`

---

## C. Pattern Matching (for safe_exec.sh)

```bash
# Hard-block patterns (regex)
HARD_BLOCK_PATTERNS=(
  'rm\s+-rf\s+/'
  'rm\s+-rf\s+~'
  'rm\s+-rf\s+\.'
  '\bmkfs\b'
  '\bdd\b'
  '\bshutdown\b'
  '\breboot\b'
  '\blaunchctl\b'
  '\bcsrutil\b'
  'diskutil\s+erase'
  'chmod\s+-R'
  'chown\s+-R'
  '\bsudo\b'
  '/etc/'
  '/System/'
  '/Library/LaunchDaemons/'
  '~/.ssh/'
  '~/.aws/'
  '~/.config/'
  'docker\s+system\s+prune\s+-a'
  'docker\s+volume\s+rm'
  'docker\s+rm\s+-f'
)

# Sensitive patterns (require approval)
SENSITIVE_PATTERNS=(
  '\bssh\b'
  '\bscp\b'
  '\brsync\b'
  'git\s+push'
  'gh\s+repo\s+delete'
  'gh\s+auth\s+logout'
  'token'
  'key='
  'password'
  'secret'
  'credential'
  'api_key'
  'apikey'
)
```

---

## D. Override Mechanism

To execute a hard-blocked command:
1. Set `ALLOW_DENYLIST_OVERRIDE=1`
2. Command still goes through `approve.sh` for explicit Y/N

Example:
```bash
ALLOW_DENYLIST_OVERRIDE=1 scripts/safe_exec.sh --reason "Emergency cleanup" -- rm -rf ./temp
```

This is intentionally cumbersome. If you need to do this often, reconsider your
workflow.
