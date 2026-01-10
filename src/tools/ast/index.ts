/**
 * AST-Grep Integration
 * Structural code search and replacement using Abstract Syntax Trees
 */

import { js, type SgNode } from '@ast-grep/napi';
import { readFile, writeFile } from 'fs/promises';

export interface ASTSearchOptions {
  pattern: string;
  language?: 'javascript' | 'typescript' | 'tsx' | 'jsx';
  filePath?: string;
  code?: string;
}

export interface ASTReplaceOptions extends ASTSearchOptions {
  replacement: string;
}

export interface ASTMatch {
  text: string;
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  filePath?: string;
}

/**
 * Search code using AST patterns
 * Example: astGrepSearch({ pattern: 'function $NAME($$$ARGS) { $$$ }', code: sourceCode })
 */
export async function astGrepSearch(
  options: ASTSearchOptions
): Promise<ASTMatch[]> {
  const code = options.code || (options.filePath ? await readFile(options.filePath, 'utf-8') : '');

  if (!code) {
    throw new Error('Either code or filePath must be provided');
  }

  // Parse the code
  const root = js.parse(code);

  // Find all matches
  const matches = root.root().findAll(options.pattern);

  return matches.map((node: SgNode) => {
    const range = node.range();
    return {
      text: node.text(),
      range: {
        start: { line: range.start.line, column: range.start.column },
        end: { line: range.end.line, column: range.end.column },
      },
      filePath: options.filePath,
    };
  });
}

/**
 * Replace code using AST patterns
 * Example: astGrepReplace({
 *   pattern: 'console.log($$$)',
 *   replacement: '// removed log',
 *   filePath: 'file.js'
 * })
 */
export async function astGrepReplace(
  options: ASTReplaceOptions
): Promise<{ modified: boolean; newCode: string }> {
  const code = options.code || (options.filePath ? await readFile(options.filePath, 'utf-8') : '');

  if (!code) {
    throw new Error('Either code or filePath must be provided');
  }

  // Parse the code
  const root = js.parse(code);

  // Find all matches
  const matches = root.root().findAll(options.pattern);

  if (matches.length === 0) {
    return { modified: false, newCode: code };
  }

  // Replace from end to start to maintain positions
  let newCode = code;
  const sortedMatches = [...matches].sort((a, b) => {
    const aStart = a.range().start.index;
    const bStart = b.range().start.index;
    return bStart - aStart;
  });

  for (const node of sortedMatches) {
    const range = node.range();
    newCode =
      newCode.slice(0, range.start.index) +
      options.replacement +
      newCode.slice(range.end.index);
  }

  // Write back if filePath provided
  if (options.filePath) {
    await writeFile(options.filePath, newCode);
  }

  return { modified: true, newCode };
}

/**
 * Get available AST pattern examples
 */
export function getPatternExamples(): Record<string, string> {
  return {
    'function-declaration': 'function $NAME($$$ARGS) { $$$ }',
    'arrow-function': '($$$ARGS) => $BODY',
    'class-declaration': 'class $NAME { $$$ }',
    'import-statement': 'import $WHAT from $WHERE',
    'console-log': 'console.log($$$)',
    'variable-declaration': 'const $NAME = $VALUE',
    'function-call': '$FUNC($$$ARGS)',
    'if-statement': 'if ($COND) { $$$ }',
    'try-catch': 'try { $$$ } catch ($ERR) { $$$ }',
  };
}
