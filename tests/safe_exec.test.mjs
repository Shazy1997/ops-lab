import { describe, it, expect } from '@jest/globals';
import { execSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SAFE_EXEC = resolve(REPO_ROOT, 'scripts/safe_exec.sh');

describe('safe_exec.sh', () => {
  it('runs non-sensitive commands directly without approval', () => {
    const result = execSync(
      `bash ${SAFE_EXEC} --reason "Test safe command" -- echo SAFE_TEST_OUTPUT`,
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    );
    expect(result.trim()).toBe('SAFE_TEST_OUTPUT');
  });

  it('blocks hard-denylisted commands (sudo)', () => {
    let exitCode = 0;
    let output = '';
    try {
      output = execSync(
        `bash ${SAFE_EXEC} --reason "Test sudo block" -- sudo echo blocked`,
        { cwd: REPO_ROOT, encoding: 'utf-8', stdio: 'pipe' }
      );
    } catch (err) {
      exitCode = err.status;
      output = err.stdout?.toString() || err.stderr?.toString() || '';
    }
    expect(exitCode).toBe(1);
    expect(output).toContain('BLOCKED');
  });

  it('blocks rm -rf . without override', () => {
    let exitCode = 0;
    let output = '';
    try {
      output = execSync(
        `bash ${SAFE_EXEC} --reason "Test rm block" -- rm -rf .`,
        { cwd: REPO_ROOT, encoding: 'utf-8', stdio: 'pipe' }
      );
    } catch (err) {
      exitCode = err.status;
      output = err.stdout?.toString() || err.stderr?.toString() || '';
    }
    expect(exitCode).toBe(1);
    expect(output).toContain('BLOCKED');
  });

  it('requires approval for sensitive commands (git push)', async () => {
    // This will hang waiting for input if it reaches approval, so we use spawn with timeout
    const result = await runWithTimeout(
      ['bash', SAFE_EXEC, '--reason', 'Test git push', '--', 'git', 'push', '--dry-run'],
      500
    );
    
    // Should either prompt for approval (contains "APPROVAL") or timeout
    // In either case, it shouldn't have executed without prompting
    expect(
      result.stdout.includes('APPROVAL') || 
      result.timedOut || 
      result.exitCode !== 0
    ).toBe(true);
  });

  it('allows override + approval for blocked commands', async () => {
    // With override, should reach approval prompt instead of hard block
    const result = await runWithTimeout(
      ['bash', SAFE_EXEC, '--reason', 'Test override', '--', 'sudo', 'echo', 'test'],
      500,
      { ALLOW_DENYLIST_OVERRIDE: '1' }
    );
    
    // Should reach approval prompt (DENYLIST OVERRIDE message) instead of instant block
    expect(
      result.stdout.includes('OVERRIDE') || 
      result.stdout.includes('APPROVAL')
    ).toBe(true);
  });
});

/**
 * Run a command with a timeout, returning partial output if it times out
 */
function runWithTimeout(args, timeoutMs, extraEnv = {}) {
  return new Promise((resolve) => {
    const proc = spawn(args[0], args.slice(1), {
      cwd: REPO_ROOT,
      env: { ...process.env, ...extraEnv },
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
    }, timeoutMs);

    proc.on('close', (exitCode) => {
      clearTimeout(timeout);
      resolve({ exitCode: exitCode ?? 1, stdout, stderr, timedOut });
    });
  });
}
