import { describe, it, expect } from '@jest/globals';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Check if we're in a git repo (not available in Docker)
const isGitRepo = existsSync(resolve(process.cwd(), '.git'));

// Use describe.skip to skip the entire suite when not in git repo
const describeOrSkip = isGitRepo ? describe : describe.skip;

describeOrSkip('guardrails-check', () => {
  it('passes on a clean repo', () => {
    const result = execSync('node scripts/guardrails-check.mjs', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('All guardrails checks passed');
  });
});
