import { describe, it, expect } from '@jest/globals';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('guardrails-check', () => {
  it('passes on a clean repo', () => {
    // Skip if not in a git repo (e.g. inside Docker without .git)
    const gitDir = resolve(process.cwd(), '.git');
    if (!existsSync(gitDir)) {
      console.log('Skipping guardrails test: not in a git repository');
      return;
    }

    // Run the guardrails script from the repo root.
    // It should exit 0 on the current clean state.
    const result = execSync('node scripts/guardrails-check.mjs', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('All guardrails checks passed');
  });
});
