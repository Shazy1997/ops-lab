import { describe, it, expect } from '@jest/globals';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Check if we're in a git repo (not available in Docker)
const isGitRepo = existsSync(resolve(process.cwd(), '.git'));

describe('guardrails-check', () => {
  it('passes on a clean repo', () => {
    if (!isGitRepo) {
      console.log('Skipping: not in a git repository (Docker)');
      return;
    }

    const result = execSync('node scripts/guardrails-check.mjs', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('All guardrails checks passed');
  });
});
