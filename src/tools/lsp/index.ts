/**
 * LSP Tools Export
 * Provides 11 LSP-based tools for code intelligence
 */

export { LSPClient } from './client.js';
export * from './types.js';

// Default server configurations
import type { LSPServerConfig } from './types.js';

export const defaultServerConfigs: LSPServerConfig[] = [
  {
    name: 'typescript',
    command: 'typescript-language-server',
    args: ['--stdio'],
    filetypes: ['ts', 'tsx', 'js', 'jsx'],
  },
  {
    name: 'python',
    command: 'pylsp',
    args: [],
    filetypes: ['py'],
  },
  {
    name: 'rust',
    command: 'rust-analyzer',
    args: [],
    filetypes: ['rs'],
  },
  {
    name: 'go',
    command: 'gopls',
    args: [],
    filetypes: ['go'],
  },
];
