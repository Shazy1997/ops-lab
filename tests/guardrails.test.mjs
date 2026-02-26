import { describe, it, expect } from '@jest/globals';
import { execSync } from 'node:child_process';

// Check if git binary is available (not available in node:alpine Docker image)
function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const hasGit = isGitAvailable();

// Use describe.skip when git binary is not available
const describeOrSkip = hasGit ? describe : describe.skip;

describeOrSkip('guardrails-check', () => {
  it('passes on a clean repo', () => {
    const result = execSync('node scripts/guardrails-check.mjs', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('All guardrails checks passed');
  });
});
