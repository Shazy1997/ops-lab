#!/usr/bin/env node

/**
 * guardrails-check.mjs
 *
 * Enforces AGENT_RULES.md by scanning the repo for violations.
 * Exits non-zero if any check fails.
 *
 * Checks:
 *   1. No files outside allowed top-level directories
 *   2. No duplicate-ish filenames (*_v2, *copy*, *final*, *backup*, etc.)
 *   3. No absolute paths in source/config files
 *   4. CHANGELOG updated on PRs (when GITHUB_EVENT_NAME=pull_request)
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure we run from the repo root regardless of where the script is invoked.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
process.chdir(REPO_ROOT);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ALLOWED_TOP_LEVEL = new Set([
  '.dockerignore',
  '.github',
  '.gitignore',
  'AGENT_RULES.md',
  'docs',
  'Dockerfile',
  'README.md',
  'docker-compose.yml',
  'jest.config.mjs',
  'notes',
  'package-lock.json',
  'package.json',
  'scripts',
  'security',
  'src',
  'tests',
]);

const DUPLICATE_PATTERNS = [
  /_v\d+\./,
  /[_-]copy[_.\-]/i,
  /[_-]final[_.\-]/i,
  /[_-]backup[_.\-]/i,
  /^new_/i,
  /^copy[_ ]of[_ ]/i,
];

const SCANNABLE_EXTENSIONS = new Set([
  '.mjs', '.js', '.ts', '.json', '.yml', '.yaml', '.md', '.sh',
]);

// Matches things like /Users/foo, /home/bar, /etc/..., /var/..., /tmp/...
// but ignores common false positives like /app (Dockerfile WORKDIR) and URLs.
const ABSOLUTE_PATH_RE = /(?<!https?:)(?<!http:)\/(?:Users|home|etc|var|tmp|opt|usr)\/\S+/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTrackedFiles() {
  return execSync('git ls-files', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
}

function topLevel(filePath) {
  return filePath.split('/')[0];
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

const violations = [];

function checkAllowedDirectories(files) {
  for (const f of files) {
    const top = topLevel(f);
    if (!ALLOWED_TOP_LEVEL.has(top)) {
      violations.push(`CONTAINMENT: "${f}" is outside allowed top-level entries.`);
    }
  }
}

function checkDuplicateNames(files) {
  for (const f of files) {
    const name = basename(f);
    for (const pattern of DUPLICATE_PATTERNS) {
      if (pattern.test(name)) {
        violations.push(`DUPLICATE: "${f}" matches banned pattern ${pattern}.`);
      }
    }
  }
}

// Files that document paths and shouldn't trigger ABS_PATH violations
const ABS_PATH_ALLOWLIST = new Set([
  'security/DENYLIST.md',
  'scripts/safe_exec.sh',
]);

function checkAbsolutePaths(files) {
  for (const f of files) {
    // Skip files that document paths
    if (ABS_PATH_ALLOWLIST.has(f)) continue;

    const ext = f.slice(f.lastIndexOf('.'));
    if (!SCANNABLE_EXTENSIONS.has(ext)) continue;

    let content;
    try {
      content = readFileSync(f, 'utf-8');
    } catch {
      continue; // binary or unreadable
    }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip shebangs, comments, and regex/pattern definitions
      if (i === 0 && line.startsWith('#!')) continue;
      if (/^\s*(\/\/|#|\*|\/)/.test(line)) continue;
      if (/RegExp|new RegExp|RE\s*=/.test(line)) continue;
      if (ABSOLUTE_PATH_RE.test(line)) {
        violations.push(
          `ABS_PATH: "${f}:${i + 1}" contains what looks like an absolute path.`
        );
      }
    }
  }
}

function checkChangelogUpdated() {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') return;

  try {
    const diff = execSync('git diff --name-only origin/main...HEAD', {
      encoding: 'utf-8',
    });
    if (!diff.includes('notes/CHANGELOG.md')) {
      violations.push(
        'CHANGELOG: notes/CHANGELOG.md was not updated in this PR.'
      );
    }
  } catch {
    // Not in a PR context or origin/main doesn't exist — skip.
  }
}

// ---------------------------------------------------------------------------
// Safety checks (Permission Gates enforcement)
// ---------------------------------------------------------------------------

// Files allowed to contain direct ssh/scp/rsync calls
const SSH_ALLOWLIST = new Set(['scripts/safe_ssh.sh']);

// Files allowed to contain 'sudo' (checkers/docs/tests only)
const SUDO_ALLOWLIST = new Set([
  'scripts/guardrails-check.mjs',
  'security/DENYLIST.md',
  'tests/safe_exec.test.mjs',  // tests blocking of sudo
]);

function checkForbiddenPatterns(files) {
  for (const f of files) {
    const ext = f.slice(f.lastIndexOf('.'));
    // Only scan shell scripts and JS/TS files
    if (!['.sh', '.mjs', '.js', '.ts'].includes(ext)) continue;

    let content;
    try {
      content = readFileSync(f, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip comments
      if (/^\s*(#|\/\/)/.test(line)) continue;

      // Check for direct ssh/scp/rsync (not via safe_ssh.sh)
      if (!SSH_ALLOWLIST.has(f)) {
        // Match standalone ssh/scp/rsync commands (word boundary)
        if (/\b(ssh|scp|rsync)\s+[^|]/.test(line)) {
          // Ignore if it's calling safe_ssh.sh
          if (!line.includes('safe_ssh.sh')) {
            violations.push(
              `SAFETY: "${f}:${lineNum}" contains direct ssh/scp/rsync. Use scripts/safe_ssh.sh instead.`
            );
          }
        }
      }

      // Check for sudo
      if (!SUDO_ALLOWLIST.has(f)) {
        if (/\bsudo\b/.test(line)) {
          violations.push(
            `SAFETY: "${f}:${lineNum}" contains 'sudo'. Sudo is forbidden in repo scripts.`
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const files = getTrackedFiles();

checkAllowedDirectories(files);
checkDuplicateNames(files);
checkAbsolutePaths(files);
checkChangelogUpdated();
checkForbiddenPatterns(files);

if (violations.length > 0) {
  console.error('\n🚨 Guardrails violations found:\n');
  for (const v of violations) {
    console.error(`  ✗ ${v}`);
  }
  console.error(`\n${violations.length} violation(s). Fix them before merging.\n`);
  process.exit(1);
} else {
  console.log('✓ All guardrails checks passed.');
  process.exit(0);
}
