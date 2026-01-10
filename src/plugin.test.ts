/**
 * Plugin Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializePlugin, shutdownPlugin, handleMessage, executeTool } from './plugin.js';
import type { OhMyClaudePlugin } from './plugin.js';
import { rm, mkdir } from 'fs/promises';
import { join } from 'path';

const TEST_DIR = join(process.cwd(), '.test-plugin');

describe('Plugin Integration', () => {
  let plugin: OhMyClaudePlugin;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    plugin = await initializePlugin({
      projectRoot: TEST_DIR,
      userConfig: {
        lsp: { enabled: false }, // Disable LSP for faster tests
      },
    });
  });

  afterEach(async () => {
    await shutdownPlugin(plugin);
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should initialize plugin', () => {
    expect(plugin).toBeDefined();
    expect(plugin.projectRoot).toBe(TEST_DIR);
    expect(plugin.tools).toBeDefined();
    expect(plugin.hooks).toBeDefined();
    expect(plugin.boulder).toBeDefined();
  });

  it('should register tools', () => {
    const tools = plugin.tools.list();
    expect(tools.length).toBeGreaterThan(0);

    // Check for AST-grep tools
    const astTools = plugin.tools.listByCategory('ast');
    expect(astTools.length).toBe(2);
    expect(astTools.map(t => t.name)).toContain('ast_grep_search');
    expect(astTools.map(t => t.name)).toContain('ast_grep_replace');

    // Check for grep tools
    const grepTools = plugin.tools.listByCategory('grep');
    expect(grepTools.length).toBe(2);
  });

  it('should register hooks', () => {
    const hooks = plugin.hooks.list();
    expect(hooks.length).toBe(4);

    const names = hooks.map(h => h.name);
    expect(names).toContain('boulder-resume');
    expect(names).toContain('star-prompt');
    expect(names).toContain('keyword-detector');
    expect(names).toContain('completion-enforcer');
  });

  it('should detect ultrawork keyword', async () => {
    const result = await handleMessage(plugin, {
      role: 'user',
      content: 'ulw build a feature',
    });

    expect(result.inject).toBeDefined();
    expect(result.inject).toContain('Oh-My-Claude Council');
    expect(result.metadata?.orchestrationMode).toBe('ultrawork');
  });

  it('should detect plan keyword', async () => {
    const result = await handleMessage(plugin, {
      role: 'user',
      content: '@plan the architecture',
    });

    expect(result.inject).toBeDefined();
    expect(result.inject).toContain('Seer');
    expect(result.metadata?.orchestrationMode).toBe('planning');
  });

  it('should not detect regular messages', async () => {
    const result = await handleMessage(plugin, {
      role: 'user',
      content: 'regular message',
    });

    expect(result.inject).toBeUndefined();
  });

  it('should execute grep tool', async () => {
    const result = await executeTool(plugin, 'grep_search', {
      pattern: 'test',
      path: TEST_DIR,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it('should execute find_files tool', async () => {
    const result = await executeTool(plugin, 'find_files', {
      pattern: '*.ts',
      path: process.cwd(),
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
