/**
 * LSP Client Implementation
 * Based on oh-my-claude-sisyphus by Yeachan-Heo (MIT license)
 *
 * This implementation provides a bridge between Claude Code and Language Server Protocol servers
 */

import { spawn, ChildProcess } from 'child_process';
import {
  type LSPServerConfig,
  type LSPClientOptions,
  type Position,
  type Location,
  type Hover,
  type Diagnostic,
  type SymbolInformation,
  type CodeAction,
} from './types.js';

export class LSPClient {
  private servers: Map<string, ChildProcess> = new Map();
  private serverConfigs: LSPServerConfig[];
  private timeout: number;
  private nextId = 1;

  constructor(options: LSPClientOptions) {
    this.serverConfigs = options.serverConfigs;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Start an LSP server for a given file
   */
  async startServer(filePath: string): Promise<void> {
    const ext = filePath.split('.').pop() || '';
    const config = this.serverConfigs.find((c) =>
      c.filetypes.includes(ext)
    );

    if (!config) {
      throw new Error(`No LSP server configured for filetype: ${ext}`);
    }

    if (this.servers.has(config.name)) {
      return; // Already running
    }

    const server = spawn(config.command, config.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.servers.set(config.name, server);

    // Initialize server
    await this.sendRequest(config.name, 'initialize', {
      processId: process.pid,
      capabilities: {},
      rootUri: `file://${process.cwd()}`,
    });

    await this.sendNotification(config.name, 'initialized', {});
  }

  /**
   * Send a request to an LSP server
   */
  private async sendRequest(
    serverName: string,
    method: string,
    params: any
  ): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server || !server.stdin) {
      throw new Error(`Server ${serverName} not running`);
    }

    const id = this.nextId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const content = JSON.stringify(request);
    const message = `Content-Length: ${content.length}\r\n\r\n${content}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('LSP request timeout'));
      }, this.timeout);

      const handleData = (data: Buffer) => {
        try {
          const response = this.parseResponse(data.toString());
          if (response.id === id) {
            clearTimeout(timeout);
            server.stdout?.off('data', handleData);

            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Partial response, keep listening
        }
      };

      server.stdout?.on('data', handleData);
      server.stdin?.write(message);
    });
  }

  /**
   * Send a notification to an LSP server (no response expected)
   */
  private async sendNotification(
    serverName: string,
    method: string,
    params: any
  ): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server || !server.stdin) {
      throw new Error(`Server ${serverName} not running`);
    }

    const notification = {
      jsonrpc: '2.0',
      method,
      params,
    };

    const content = JSON.stringify(notification);
    const message = `Content-Length: ${content.length}\r\n\r\n${content}`;
    server.stdin.write(message);
  }

  /**
   * Parse LSP response
   */
  private parseResponse(data: string): any {
    const contentMatch = data.match(/Content-Length: (\d+)\r\n\r\n([\s\S]*)/);
    if (!contentMatch) {
      throw new Error('Invalid LSP response format');
    }

    const content = contentMatch[2];
    return JSON.parse(content);
  }

  /**
   * Get hover information
   */
  async hover(
    filePath: string,
    position: Position
  ): Promise<Hover | null> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/hover', {
      textDocument: { uri: `file://${filePath}` },
      position,
    });
  }

  /**
   * Go to definition
   */
  async gotoDefinition(
    filePath: string,
    position: Position
  ): Promise<Location | Location[] | null> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/definition', {
      textDocument: { uri: `file://${filePath}` },
      position,
    });
  }

  /**
   * Find references
   */
  async findReferences(
    filePath: string,
    position: Position,
    includeDeclaration: boolean = false
  ): Promise<Location[]> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/references', {
      textDocument: { uri: `file://${filePath}` },
      position,
      context: { includeDeclaration },
    });
  }

  /**
   * Get document symbols
   */
  async documentSymbols(filePath: string): Promise<SymbolInformation[]> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/documentSymbol', {
      textDocument: { uri: `file://${filePath}` },
    });
  }

  /**
   * Search workspace symbols
   */
  async workspaceSymbols(query: string): Promise<SymbolInformation[]> {
    // Use first available server
    const config = this.serverConfigs[0];
    if (!config) {
      throw new Error('No LSP servers configured');
    }

    await this.ensureServerRunning(config.name);

    return this.sendRequest(config.name, 'workspace/symbol', {
      query,
    });
  }

  /**
   * Get diagnostics
   */
  async diagnostics(filePath: string): Promise<Diagnostic[]> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/publishDiagnostics', {
      textDocument: { uri: `file://${filePath}` },
    });
  }

  /**
   * Get code actions
   */
  async codeActions(
    filePath: string,
    range: { start: Position; end: Position },
    diagnostics?: Diagnostic[]
  ): Promise<CodeAction[]> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/codeAction', {
      textDocument: { uri: `file://${filePath}` },
      range,
      context: { diagnostics: diagnostics || [] },
    });
  }

  /**
   * Rename symbol
   */
  async rename(
    filePath: string,
    position: Position,
    newName: string
  ): Promise<any> {
    await this.startServer(filePath);
    const config = this.getServerConfig(filePath);

    return this.sendRequest(config.name, 'textDocument/rename', {
      textDocument: { uri: `file://${filePath}` },
      position,
      newName,
    });
  }

  /**
   * Get server config for file
   */
  private getServerConfig(filePath: string): LSPServerConfig {
    const ext = filePath.split('.').pop() || '';
    const config = this.serverConfigs.find((c) =>
      c.filetypes.includes(ext)
    );

    if (!config) {
      throw new Error(`No LSP server configured for filetype: ${ext}`);
    }

    return config;
  }

  /**
   * Ensure server is running
   */
  private async ensureServerRunning(serverName: string): Promise<void> {
    if (!this.servers.has(serverName)) {
      const config = this.serverConfigs.find((c) => c.name === serverName);
      if (!config) {
        throw new Error(`Server config not found: ${serverName}`);
      }

      const server = spawn(config.command, config.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.servers.set(serverName, server);

      await this.sendRequest(serverName, 'initialize', {
        processId: process.pid,
        capabilities: {},
        rootUri: `file://${process.cwd()}`,
      });

      await this.sendNotification(serverName, 'initialized', {});
    }
  }

  /**
   * Shutdown all servers
   */
  async shutdown(): Promise<void> {
    for (const [name, server] of this.servers.entries()) {
      try {
        await this.sendRequest(name, 'shutdown', {});
        await this.sendNotification(name, 'exit', {});
        server.kill();
      } catch (error) {
        server.kill('SIGKILL');
      }
    }
    this.servers.clear();
  }
}
