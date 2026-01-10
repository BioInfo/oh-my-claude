/**
 * Safe command execution utility
 * ALWAYS use execFile (NEVER exec) to prevent shell injection attacks
 */

import { execFile as nodeExecFile } from 'child_process';
import { promisify } from 'util';

const execFilePromise = promisify(nodeExecFile);

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute a command safely without throwing errors
 * @param command Command to execute (no shell)
 * @param args Arguments array
 * @param options Execution options
 * @returns Execution result with stdout, stderr, and exit code
 */
export async function execFileNoThrow(
  command: string,
  args: string[] = [],
  options: { cwd?: string; timeout?: number } = {}
): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execFilePromise(command, args, {
      ...options,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: options.timeout || 30000, // 30s default timeout
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString().trim() || '',
      stderr: error.stderr?.toString().trim() || error.message,
      exitCode: error.code || 1,
    };
  }
}

/**
 * Check if a command is available in PATH
 */
export async function commandExists(command: string): Promise<boolean> {
  const result = await execFileNoThrow('which', [command]);
  return result.exitCode === 0;
}
