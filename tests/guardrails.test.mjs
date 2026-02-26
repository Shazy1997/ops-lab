import { describe, it, expect } from '@jest/globals';
import { execSync } from 'node:child_process';

describe('guardrails-check', () => {
  it('passes on a clean repo', () => {
    const result = execSync('node scripts/guardrails-check.mjs', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('All guardrails checks passed');
  });
});
