/**
 * Safe Command Execution Tests
 */

import { describe, it, expect } from 'vitest';
import { execFileNoThrow, commandExists } from './execFileNoThrow.js';

describe('execFileNoThrow', () => {
  it('should execute successful commands', async () => {
    const result = await execFileNoThrow('echo', ['hello']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('hello');
    expect(result.stderr).toBe('');
  });

  it('should handle failing commands gracefully', async () => {
    const result = await execFileNoThrow('ls', ['/nonexistent-directory-xyz']);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toBeTruthy();
  });

  it('should handle command not found', async () => {
    const result = await execFileNoThrow('nonexistent-command-xyz', []);
    expect(result.exitCode).not.toBe(0);
  });

  it('should respect timeout', async () => {
    const result = await execFileNoThrow('sleep', ['5'], { timeout: 100 });
    expect(result.exitCode).not.toBe(0);
  });
});

describe('commandExists', () => {
  it('should detect existing commands', async () => {
    const exists = await commandExists('echo');
    expect(exists).toBe(true);
  });

  it('should detect non-existing commands', async () => {
    const exists = await commandExists('nonexistent-command-xyz');
    expect(exists).toBe(false);
  });
});
