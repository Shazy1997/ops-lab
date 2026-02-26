#!/usr/bin/env bash
#
# safe_ssh.sh — Permission-gated SSH wrapper
#
# Usage:
#   safe_ssh.sh --reason "<reason>" --host "<user@host>" -- "<remote_cmd>"
#   safe_ssh.sh --reason "<reason>" --host "<user@host>" --interactive
#
# Options:
#   --reason      Required. Why this SSH session is needed.
#   --host        Required. SSH target (user@host or alias).
#   --interactive Start interactive shell instead of running a command.
#   --ssh-opts    Optional. Additional SSH options (e.g. "-p 2222 -i key").
#
# All SSH operations go through approve.sh for explicit Y/N approval.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
REASON=""
HOST=""
INTERACTIVE=false
SSH_OPTS=""
REMOTE_CMD=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reason)
      REASON="$2"
      shift 2
      ;;
    --host)
      HOST="$2"
      shift 2
      ;;
    --interactive)
      INTERACTIVE=true
      shift
      ;;
    --ssh-opts)
      SSH_OPTS="$2"
      shift 2
      ;;
    --)
      shift
      REMOTE_CMD="$*"
      break
      ;;
    *)
      echo "Error: Unknown option '$1'" >&2
      echo "Usage: safe_ssh.sh --reason \"<reason>\" --host \"<user@host>\" [--interactive | -- \"<remote_cmd>\"]" >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Validate arguments
# ---------------------------------------------------------------------------
if [[ -z "$REASON" ]]; then
  echo "Error: --reason is required" >&2
  exit 1
fi

if [[ -z "$HOST" ]]; then
  echo "Error: --host is required" >&2
  exit 1
fi

if [[ "$INTERACTIVE" == "false" && -z "$REMOTE_CMD" ]]; then
  echo "Error: Must specify either --interactive or a remote command after --" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Build SSH command
# ---------------------------------------------------------------------------
if [[ "$INTERACTIVE" == "true" ]]; then
  if [[ -n "$SSH_OPTS" ]]; then
    FULL_COMMAND="ssh $SSH_OPTS $HOST"
  else
    FULL_COMMAND="ssh $HOST"
  fi
  DISPLAY_CMD="$HOST (interactive)"
else
  if [[ -n "$SSH_OPTS" ]]; then
    FULL_COMMAND="ssh $SSH_OPTS $HOST '$REMOTE_CMD'"
  else
    FULL_COMMAND="ssh $HOST '$REMOTE_CMD'"
  fi
  DISPLAY_CMD="$HOST: $REMOTE_CMD"
fi

# ---------------------------------------------------------------------------
# Always require approval for SSH
# ---------------------------------------------------------------------------
echo ""
echo "🔐 SSH operation requires approval"
echo "   Target: $DISPLAY_CMD"
echo ""

exec "$SCRIPT_DIR/approve.sh" "$REASON" "$FULL_COMMAND"
