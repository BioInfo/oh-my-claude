/**
 * Tool Registration System
 * Provides a registry for all plugin tools with metadata and validation
 */

import type { LSPClient } from '../tools/lsp/client.js';
import type { Position, Range } from '../tools/lsp/types.js';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: 'lsp' | 'ast' | 'grep' | 'state';
  parameters: ToolParameter[];
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a tool
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * List all tools
   */
  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools by category
   */
  listByCategory(category: string): ToolDefinition[] {
    return this.list().filter((t) => t.category === category);
  }

  /**
   * Execute a tool
   */
  async execute(name: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // Validate parameters
    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }
    }

    return tool.handler(params);
  }
}

function createFilePathParam(): ToolParameter {
  return {
    name: 'filePath',
    type: 'string',
    description: 'Path to the file',
    required: true,
  };
}

function createPositionParam(): ToolParameter {
  return {
    name: 'position',
    type: 'object',
    description: 'Position in the file',
    required: true,
  };
}

function registerLSPTools(registry: ToolRegistry, lspClient: LSPClient): void {
  registry.register({
    name: 'lsp_hover',
    description: 'Get hover information at a specific position',
    category: 'lsp',
    parameters: [createFilePathParam(), createPositionParam()],
    handler: async (params) => {
      return lspClient.hover(
        params.filePath as string,
        params.position as Position
      );
    },
  });

  registry.register({
    name: 'lsp_goto_definition',
    description: 'Go to symbol definition',
    category: 'lsp',
    parameters: [createFilePathParam(), createPositionParam()],
    handler: async (params) => {
      return lspClient.gotoDefinition(
        params.filePath as string,
        params.position as Position
      );
    },
  });

  registry.register({
    name: 'lsp_find_references',
    description: 'Find all references to a symbol',
    category: 'lsp',
    parameters: [
      createFilePathParam(),
      createPositionParam(),
      {
        name: 'includeDeclaration',
        type: 'boolean',
        description: 'Include declaration in results',
        required: false,
        default: false,
      },
    ],
    handler: async (params) => {
      return lspClient.findReferences(
        params.filePath as string,
        params.position as Position,
        params.includeDeclaration as boolean
      );
    },
  });

  registry.register({
    name: 'lsp_document_symbols',
    description: 'Get all symbols in a document',
    category: 'lsp',
    parameters: [createFilePathParam()],
    handler: async (params) => {
      return lspClient.documentSymbols(params.filePath as string);
    },
  });

  registry.register({
    name: 'lsp_workspace_symbols',
    description: 'Search for symbols across workspace',
    category: 'lsp',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Symbol search query',
        required: true,
      },
    ],
    handler: async (params) => {
      return lspClient.workspaceSymbols(params.query as string);
    },
  });

  registry.register({
    name: 'lsp_diagnostics',
    description: 'Get diagnostics (errors/warnings)',
    category: 'lsp',
    parameters: [createFilePathParam()],
    handler: async (params) => {
      return lspClient.diagnostics(params.filePath as string);
    },
  });

  registry.register({
    name: 'lsp_rename',
    description: 'Rename a symbol',
    category: 'lsp',
    parameters: [
      createFilePathParam(),
      createPositionParam(),
      {
        name: 'newName',
        type: 'string',
        description: 'New symbol name',
        required: true,
      },
    ],
    handler: async (params) => {
      return lspClient.rename(
        params.filePath as string,
        params.position as Position,
        params.newName as string
      );
    },
  });

  registry.register({
    name: 'lsp_code_actions',
    description: 'Get available code actions',
    category: 'lsp',
    parameters: [
      createFilePathParam(),
      {
        name: 'range',
        type: 'object',
        description: 'Range in the file',
        required: true,
      },
    ],
    handler: async (params) => {
      return lspClient.codeActions(
        params.filePath as string,
        params.range as Range
      );
    },
  });
}

export function createToolRegistry(lspClient?: LSPClient): ToolRegistry {
  const registry = new ToolRegistry();

  if (lspClient) {
    registerLSPTools(registry, lspClient);
  }

  registry.register({
    name: 'ast_grep_search',
    description: 'Search code using AST patterns',
    category: 'ast',
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'AST pattern to search for',
        required: true,
      },
      {
        name: 'filePath',
        type: 'string',
        description: 'Path to search in',
        required: false,
      },
      {
        name: 'code',
        type: 'string',
        description: 'Code to search (alternative to filePath)',
        required: false,
      },
    ],
    handler: async (params) => {
      const { astGrepSearch } = await import('../tools/ast/index.js');
      return astGrepSearch(params);
    },
  });

  registry.register({
    name: 'ast_grep_replace',
    description: 'Replace code using AST patterns',
    category: 'ast',
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'AST pattern to search for',
        required: true,
      },
      {
        name: 'replacement',
        type: 'string',
        description: 'Replacement code',
        required: true,
      },
      {
        name: 'filePath',
        type: 'string',
        description: 'Path to modify',
        required: false,
      },
    ],
    handler: async (params) => {
      const { astGrepReplace } = await import('../tools/ast/index.js');
      return astGrepReplace(params);
    },
  });

  registry.register({
    name: 'grep_search',
    description: 'Search code using grep/ripgrep',
    category: 'grep',
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'Search pattern (regex)',
        required: true,
      },
      {
        name: 'path',
        type: 'string',
        description: 'Path to search in',
        required: false,
      },
      {
        name: 'ignoreCase',
        type: 'boolean',
        description: 'Case insensitive search',
        required: false,
        default: false,
      },
      {
        name: 'type',
        type: 'string',
        description: 'File type filter (ts, js, py, etc)',
        required: false,
      },
    ],
    handler: async (params) => {
      const { grep } = await import('../tools/grep/index.js');
      return grep(params);
    },
  });

  registry.register({
    name: 'find_files',
    description: 'Find files by pattern',
    category: 'grep',
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'File pattern to search for',
        required: true,
      },
      {
        name: 'path',
        type: 'string',
        description: 'Path to search in',
        required: false,
        default: '.',
      },
    ],
    handler: async (params) => {
      const { findFiles } = await import('../tools/grep/index.js');
      const searchPath = (params.path as string | undefined) || '.';
      return findFiles(params.pattern as string, searchPath);
    },
  });

  return registry;
}
