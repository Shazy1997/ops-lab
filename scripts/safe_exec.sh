#!/usr/bin/env bash
#
# safe_exec.sh — Permission-gated command execution
#
# Usage: safe_exec.sh --reason "<reason>" -- <cmd> [args...]
#
# Enforces security/DENYLIST.md patterns:
# - Hard-blocked commands fail unless ALLOW_DENYLIST_OVERRIDE=1
# - Sensitive commands require approval via approve.sh
# - Non-sensitive commands run directly

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
# Hard-block patterns (exit immediately unless override)
# ---------------------------------------------------------------------------
HARD_BLOCK_PATTERNS=(
  'rm[[:space:]]+-rf[[:space:]]+/'
  'rm[[:space:]]+-rf[[:space:]]+~'
  'rm[[:space:]]+-rf[[:space:]]+\.'
  '\bmkfs\b'
  '\bdd\b'
  '\bshutdown\b'
  '\breboot\b'
  '\blaunchctl\b'
  '\bcsrutil\b'
  'diskutil[[:space:]]+erase'
  'chmod[[:space:]]+-R'
  'chown[[:space:]]+-R'
  '\bsudo\b'
  '/etc/'
  '/System/'
  '/Library/LaunchDaemons/'
  '~/\.ssh/'
  '~/\.aws/'
  '~/\.config/'
  'docker[[:space:]]+system[[:space:]]+prune[[:space:]]+-a'
  'docker[[:space:]]+volume[[:space:]]+rm'
  'docker[[:space:]]+rm[[:space:]]+-f'
)

# ---------------------------------------------------------------------------
# Sensitive patterns (require approval)
# ---------------------------------------------------------------------------
SENSITIVE_PATTERNS=(
  '\bssh\b'
  '\bscp\b'
  '\brsync\b'
  'git[[:space:]]+push'
  'gh[[:space:]]+repo[[:space:]]+delete'
  'gh[[:space:]]+auth[[:space:]]+logout'
  'token'
  'key='
  'password'
  'secret'
  'credential'
  'api_key'
  'apikey'
)

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
REASON=""
COMMAND_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reason)
      REASON="$2"
      shift 2
      ;;
    --)
      shift
      COMMAND_ARGS=("$@")
      break
      ;;
    *)
      echo "Error: Unknown option '$1'" >&2
      echo "Usage: safe_exec.sh --reason \"<reason>\" -- <cmd> [args...]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$REASON" ]]; then
  echo "Error: --reason is required" >&2
  exit 1
fi

if [[ ${#COMMAND_ARGS[@]} -eq 0 ]]; then
  echo "Error: No command specified after --" >&2
  exit 1
fi

# Build full command string for pattern matching
FULL_COMMAND="${COMMAND_ARGS[*]}"

# ---------------------------------------------------------------------------
# Check hard-block patterns
# ---------------------------------------------------------------------------
is_hard_blocked() {
  for pattern in "${HARD_BLOCK_PATTERNS[@]}"; do
    if echo "$FULL_COMMAND" | grep -qE "$pattern"; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Check sensitive patterns
# ---------------------------------------------------------------------------
is_sensitive() {
  for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if echo "$FULL_COMMAND" | grep -qE "$pattern"; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Main logic
# ---------------------------------------------------------------------------

if is_hard_blocked; then
  if [[ "${ALLOW_DENYLIST_OVERRIDE:-}" != "1" ]]; then
    echo ""
    echo "🚫 BLOCKED: Command matches denylist pattern."
    echo "   Command: $FULL_COMMAND"
    echo ""
    echo "This command is hard-blocked for safety. If you absolutely need to run it,"
    echo "set ALLOW_DENYLIST_OVERRIDE=1 and re-run. You will still need to approve."
    echo ""
    exit 1
  fi
  
  # Override is set — still require approval
  echo ""
  echo "⚠️  DENYLIST OVERRIDE: Command would normally be blocked."
  echo "   Proceeding to approval gate..."
  echo ""
  exec "$SCRIPT_DIR/approve.sh" "$REASON" "$FULL_COMMAND"
fi

if is_sensitive; then
  # Require approval for sensitive commands
  exec "$SCRIPT_DIR/approve.sh" "$REASON" "$FULL_COMMAND"
fi

# Non-sensitive, non-blocked — run directly
exec "${COMMAND_ARGS[@]}"
