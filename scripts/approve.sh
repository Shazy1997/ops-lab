#!/usr/bin/env bash
#
# approve.sh — Interactive approval gate with logging
#
# Usage: approve.sh "<reason>" "<command_string>"
#
# Prompts user for Y/N approval. Logs all decisions to notes/approvals.log.
# Exit 0 on approve (runs command), exit 1 on deny.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_ROOT/notes/approvals.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Arguments
if [[ $# -lt 2 ]]; then
  echo "Usage: approve.sh \"<reason>\" \"<command_string>\"" >&2
  exit 1
fi

REASON="$1"
COMMAND="$2"

# Context
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
USER_HOST="${USER:-unknown}@${HOSTNAME:-unknown}"
CWD="$(pwd)"

# Display approval request
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  APPROVAL REQUIRED"
echo "═══════════════════════════════════════════════════════════════════"
echo "  Time:    $TIMESTAMP"
echo "  User:    $USER_HOST"
echo "  CWD:     $CWD"
echo "  Reason:  $REASON"
echo "  Command: $COMMAND"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Prompt for approval
# Use /dev/tty if available (interactive), otherwise stdin (for testing)
if [[ -t 0 ]]; then
  read -r -p "Approve? (y/N): " RESPONSE
else
  echo -n "Approve? (y/N): "
  read -r RESPONSE
fi

# Normalize response (portable lowercase)
RESPONSE=$(echo "$RESPONSE" | tr '[:upper:]' '[:lower:]')

if [[ "$RESPONSE" == "y" || "$RESPONSE" == "yes" ]]; then
  # Log approval
  echo "$TIMESTAMP | $USER_HOST | $CWD | APPROVED | $REASON | $COMMAND" >> "$LOG_FILE"
  echo ""
  echo "✓ Approved. Executing command..."
  echo ""
  
  # Execute the command
  eval "$COMMAND"
  EXIT_CODE=$?
  exit $EXIT_CODE
else
  # Log denial
  echo "$TIMESTAMP | $USER_HOST | $CWD | DENIED | $REASON | $COMMAND" >> "$LOG_FILE"
  echo ""
  echo "✗ Denied. Command not executed."
  echo ""
  exit 1
fi
