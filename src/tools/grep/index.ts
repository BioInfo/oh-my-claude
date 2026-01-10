/**
 * Enhanced Grep Tools
 * Integrates ripgrep (rg) for fast searching with fallback to standard grep
 */

import { execFileNoThrow, commandExists } from '../../utils/execFileNoThrow.js';

export interface GrepOptions {
  pattern: string;
  path?: string;
  filePattern?: string;
  ignoreCase?: boolean;
  contextLines?: number;
  maxResults?: number;
  type?: string; // File type filter (e.g., 'ts', 'js', 'py')
}

export interface GrepResult {
  file: string;
  line: number;
  column?: number;
  match: string;
  context?: {
    before?: string[];
    after?: string[];
  };
}

/**
 * Search using ripgrep or grep
 */
export async function grep(options: GrepOptions): Promise<GrepResult[]> {
  const useRipgrep = await commandExists('rg');

  if (useRipgrep) {
    return ripgrepSearch(options);
  } else {
    return standardGrepSearch(options);
  }
}

/**
 * Search using ripgrep (fast, recommended)
 */
async function ripgrepSearch(options: GrepOptions): Promise<GrepResult[]> {
  const args: string[] = ['--json'];

  if (options.ignoreCase) {
    args.push('--ignore-case');
  }

  if (options.contextLines) {
    args.push('--context', options.contextLines.toString());
  }

  if (options.type) {
    args.push('--type', options.type);
  }

  if (options.filePattern) {
    args.push('--glob', options.filePattern);
  }

  if (options.maxResults) {
    args.push('--max-count', options.maxResults.toString());
  }

  args.push(options.pattern);

  if (options.path) {
    args.push(options.path);
  }

  const result = await execFileNoThrow('rg', args);

  if (result.exitCode !== 0 && !result.stdout) {
    return []; // No matches
  }

  // Parse ripgrep JSON output
  const results: GrepResult[] = [];
  const lines = result.stdout.split('\n').filter(Boolean);

  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.type === 'match') {
        results.push({
          file: data.data.path.text,
          line: data.data.line_number,
          column: data.data.submatches?.[0]?.start,
          match: data.data.lines.text.trim(),
        });
      }
    } catch (error) {
      // Skip invalid JSON lines
    }
  }

  return results;
}

/**
 * Search using standard grep (fallback)
 */
async function standardGrepSearch(options: GrepOptions): Promise<GrepResult[]> {
  const args: string[] = ['-n', '-H']; // Line numbers, filename

  if (options.ignoreCase) {
    args.push('-i');
  }

  if (options.contextLines) {
    args.push(`-C${options.contextLines}`);
  }

  args.push(options.pattern);

  // Build find command for file pattern
  let searchPath = options.path || '.';
  let findArgs: string[] = [];

  if (options.filePattern) {
    findArgs = [searchPath, '-name', options.filePattern, '-type', 'f'];
    searchPath = '.';
  }

  const result = await execFileNoThrow(
    'grep',
    args.concat(findArgs.length ? [] : ['-r', searchPath])
  );

  if (result.exitCode !== 0 && !result.stdout) {
    return [];
  }

  // Parse grep output
  const results: GrepResult[] = [];
  const lines = result.stdout.split('\n').filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^([^:]+):(\d+):(.+)$/);
    if (match) {
      results.push({
        file: match[1],
        line: parseInt(match[2], 10),
        match: match[3].trim(),
      });
    }
  }

  return results.slice(0, options.maxResults || 1000);
}

/**
 * Search for files matching a pattern (faster than grep)
 */
export async function findFiles(
  pattern: string,
  path: string = '.'
): Promise<string[]> {
  const useFd = await commandExists('fd');

  if (useFd) {
    const result = await execFileNoThrow('fd', [pattern, path]);
    return result.stdout.split('\n').filter(Boolean);
  } else {
    const result = await execFileNoThrow('find', [
      path,
      '-type',
      'f',
      '-name',
      pattern,
    ]);
    return result.stdout.split('\n').filter(Boolean);
  }
}

/**
 * Get file statistics (useful for checking tool availability)
 */
export async function getGrepStats(): Promise<{
  hasRipgrep: boolean;
  hasFd: boolean;
  recommended: string;
}> {
  const hasRipgrep = await commandExists('rg');
  const hasFd = await commandExists('fd');

  return {
    hasRipgrep,
    hasFd,
    recommended: hasRipgrep
      ? 'ripgrep (rg) - Fast and recommended'
      : 'standard grep - Consider installing ripgrep for better performance',
  };
}
