/**
 * Oh My Claude Plugin
 * Multi-agent orchestration for Claude Code with LSP, AST-grep, and persistent state
 *
 * Inspired by oh-my-opencode by code-yeongyu
 * LSP implementation based on oh-my-claude-sisyphus by Yeachan-Heo (MIT license)
 */

import { BoulderManager } from './state/boulder.js';
import { loadConfig, type PluginConfig } from './config/index.js';

export interface PluginContext {
  projectRoot: string;
  config: PluginConfig;
  boulder: BoulderManager;
}

/**
 * Plugin initialization
 */
export async function activate(context: {
  projectRoot: string;
  userConfig?: unknown;
}): Promise<PluginContext> {
  const config = loadConfig(context.userConfig);

  const boulder = new BoulderManager(
    context.projectRoot,
    config.boulder.path
  );

  await boulder.init();

  // Check for incomplete work on startup
  if (config.boulder.enabled && (await boulder.hasActiveWork())) {
    const progress = await boulder.getProgress();
    if (progress) {
      console.log(
        `[Oh My Claude] Resuming from step ${progress.current}/${progress.total} (${progress.percentage}%)`
      );
    }
  }

  const pluginContext: PluginContext = {
    projectRoot: context.projectRoot,
    config,
    boulder,
  };

  console.log('[Oh My Claude] Plugin activated');

  return pluginContext;
}

/**
 * Plugin deactivation
 */
export async function deactivate(): Promise<void> {
  console.log('[Oh My Claude] Plugin deactivated');
}

// Export types and utilities
export { BoulderManager } from './state/boulder.js';
export type { BoulderState } from './state/boulder.js';
export { loadConfig } from './config/index.js';
export type { PluginConfig, CategoryConfig } from './config/index.js';
export { execFileNoThrow, commandExists } from './utils/execFileNoThrow.js';

// Export LSP tools
export { LSPClient, defaultServerConfigs } from './tools/lsp/index.js';
export type {
  Position,
  Range,
  Location,
  SymbolInformation,
  DocumentSymbol,
  Diagnostic,
  Hover,
  CodeAction,
  LSPServerConfig,
  LSPClientOptions,
} from './tools/lsp/types.js';

// Export AST-grep tools
export {
  astGrepSearch,
  astGrepReplace,
  getPatternExamples,
} from './tools/ast/index.js';

// Export hooks
export {
  keywordDetectorHook,
  completionEnforcerHook,
  boulderResumeHook,
  detectKeywords,
  checkCompletion,
  createInitialState,
  getResumeInstructions,
} from './hooks/index.js';
