/**
 * LSP Types and Interfaces
 * Based on oh-my-claude-sisyphus (MIT license)
 */

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Location {
  uri: string;
  range: Range;
}

export interface SymbolInformation {
  name: string;
  kind: number;
  location: Location;
  containerName?: string;
}

export interface DocumentSymbol {
  name: string;
  kind: number;
  range: Range;
  selectionRange: Range;
  children?: DocumentSymbol[];
}

export interface Diagnostic {
  range: Range;
  severity: number;
  code?: string | number;
  source?: string;
  message: string;
}

export interface Hover {
  contents: string | { language: string; value: string }[];
  range?: Range;
}

export interface CodeAction {
  title: string;
  kind?: string;
  diagnostics?: Diagnostic[];
  edit?: WorkspaceEdit;
  command?: Command;
}

export interface WorkspaceEdit {
  changes?: { [uri: string]: TextEdit[] };
}

export interface TextEdit {
  range: Range;
  newText: string;
}

export interface Command {
  title: string;
  command: string;
  arguments?: any[];
}

export interface LSPServerConfig {
  name: string;
  command: string;
  args: string[];
  filetypes: string[];
  rootPatterns?: string[];
}

export interface LSPClientOptions {
  serverConfigs: LSPServerConfig[];
  timeout?: number;
}
