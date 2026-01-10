/**
 * Plugin Main Entry Point
 * Orchestrates tool and hook registration
 */

import { BoulderManager } from './state/boulder.js';
import { loadConfig, type PluginConfig } from './config/index.js';
import { createToolRegistry, type ToolRegistry } from './registry/tools.js';
import { createHookRegistry, type HookRegistry } from './registry/hooks.js';
import { LSPClient, defaultServerConfigs } from './tools/lsp/index.js';

export interface OhMyClaudePlugin {
  projectRoot: string;
  config: PluginConfig;
  boulder: BoulderManager;
  tools: ToolRegistry;
  hooks: HookRegistry;
  lspClient?: LSPClient;
}

/**
 * Initialize the Oh My Claude plugin
 */
export async function initializePlugin(options: {
  projectRoot: string;
  userConfig?: unknown;
}): Promise<OhMyClaudePlugin> {
  const config = loadConfig(options.userConfig);

  // Initialize boulder state manager
  const boulder = new BoulderManager(
    options.projectRoot,
    config.boulder.path
  );
  await boulder.init();

  // Initialize LSP client if enabled
  let lspClient: LSPClient | undefined;
  if (config.lsp.enabled) {
    lspClient = new LSPClient({
      serverConfigs: defaultServerConfigs,
      timeout: config.lsp.serverTimeout,
    });
  }

  // Create tool registry
  const tools = createToolRegistry(lspClient);

  // Create hook registry
  const hooks = createHookRegistry({
    projectRoot: options.projectRoot,
  });

  // Check for incomplete work on startup
  if (config.boulder.enabled && (await boulder.hasActiveWork())) {
    const progress = await boulder.getProgress();
    if (progress) {
      await hooks.trigger('session-start', {}, { projectRoot: options.projectRoot });

      console.log(
        `[Oh My Claude] The Oh-My-Claude Council resumes watch: ${progress.current}/${progress.total} steps (${progress.percentage}%)`
      );
    }
  }

  const plugin: OhMyClaudePlugin = {
    projectRoot: options.projectRoot,
    config,
    boulder,
    tools,
    hooks,
    lspClient,
  };

  console.log('[Oh My Claude] The Oh-My-Claude Council stands ready.');
  console.log(`[Oh My Claude] ${tools.list().length} tools registered`);
  console.log(`[Oh My Claude] ${hooks.list().length} hooks active`);

  return plugin;
}

/**
 * Shutdown the plugin
 */
export async function shutdownPlugin(plugin: OhMyClaudePlugin): Promise<void> {
  // Shutdown LSP servers
  if (plugin.lspClient) {
    await plugin.lspClient.shutdown();
  }

  await plugin.hooks.trigger('session-end', {}, {
    projectRoot: plugin.projectRoot
  });

  console.log('[Oh My Claude] The Oh-My-Claude Council rests.');
}

/**
 * Handle incoming messages
 */
export async function handleMessage(
  plugin: OhMyClaudePlugin,
  message: { role: string; content: string }
): Promise<{ inject?: string; metadata?: Record<string, unknown> }> {
  const results = await plugin.hooks.trigger('message', message, {
    projectRoot: plugin.projectRoot,
  });

  // Return the first non-empty result
  for (const result of results) {
    if (result && typeof result === 'object') {
      return result as any;
    }
  }

  return {};
}

/**
 * Execute a tool
 */
export async function executeTool(
  plugin: OhMyClaudePlugin,
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await plugin.hooks.trigger('tool-call', { toolName, params }, {
    projectRoot: plugin.projectRoot,
  });

  return plugin.tools.execute(toolName, params);
}
