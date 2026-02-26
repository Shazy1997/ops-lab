import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const APPROVE_SCRIPT = resolve(REPO_ROOT, 'scripts/approve.sh');
const LOG_FILE = resolve(REPO_ROOT, 'notes/approvals.log');

// Check if bash is available (not available in node:alpine)
function isBashAvailable() {
  try {
    execSync('bash --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const hasBash = isBashAvailable();

// Use describe.skip when bash is not available
const describeOrSkip = hasBash ? describe : describe.skip;

describeOrSkip('approve.sh', () => {
  let originalLogContent = '';

  beforeEach(() => {
    // Preserve original log if it exists
    if (existsSync(LOG_FILE)) {
      originalLogContent = readFileSync(LOG_FILE, 'utf-8');
    }
  });

  afterEach(() => {
    // Restore original log
    if (originalLogContent) {
      writeFileSync(LOG_FILE, originalLogContent);
    } else if (existsSync(LOG_FILE)) {
      // Remove test entries by keeping only original content
      const content = readFileSync(LOG_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => !line.includes('TEST_COMMAND'));
      writeFileSync(LOG_FILE, lines.join('\n'));
    }
  });

  it('exits with code 1 when denied (input: n)', async () => {
    const result = await runWithInput('n', 'Test denial', 'echo TEST_COMMAND_DENIED');
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Denied');
  });

  it('exits with code 0 when approved (input: y)', async () => {
    const result = await runWithInput('y', 'Test approval', 'echo TEST_COMMAND_APPROVED');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Approved');
    expect(result.stdout).toContain('TEST_COMMAND_APPROVED');
  });

  it('logs denied commands to approvals.log', async () => {
    await runWithInput('n', 'Test log denial', 'echo TEST_COMMAND_LOG_DENIED');
    
    const logContent = readFileSync(LOG_FILE, 'utf-8');
    expect(logContent).toContain('DENIED');
    expect(logContent).toContain('Test log denial');
    expect(logContent).toContain('TEST_COMMAND_LOG_DENIED');
  });

  it('logs approved commands to approvals.log', async () => {
    await runWithInput('y', 'Test log approval', 'echo TEST_COMMAND_LOG_APPROVED');
    
    const logContent = readFileSync(LOG_FILE, 'utf-8');
    expect(logContent).toContain('APPROVED');
    expect(logContent).toContain('Test log approval');
    expect(logContent).toContain('TEST_COMMAND_LOG_APPROVED');
  });
});

/**
 * Run approve.sh with simulated stdin input
 */
function runWithInput(input, reason, command) {
  return new Promise((resolve) => {
    const proc = spawn('bash', [APPROVE_SCRIPT, reason, command], {
      cwd: REPO_ROOT,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send input immediately since we're in non-TTY mode
    proc.stdin.write(input + '\n');
    proc.stdin.end();

    proc.on('close', (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}
