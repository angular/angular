/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';

/**
 * A single configuration item to request from the client.
 *
 * See LSP spec: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_configuration
 */
export interface ConfigurationItem {
  /**
   * The scope to get the configuration section for.
   * This is typically a file URI (e.g., file:///path/to/file.ts).
   * When provided, VS Code returns workspace folder-specific settings
   * that apply to that file's workspace folder.
   */
  scopeUri?: string;

  /**
   * The configuration section asked for.
   * For example: 'typescript.inlayHints' or 'angular.inlayHints'
   * This corresponds to the key prefix in settings.json.
   */
  section?: string;
}

/**
 * Request workspace configuration from the client.
 *
 * This uses the LSP workspace/configuration request which allows the server
 * to pull configuration from the client on-demand. This is the preferred
 * approach over CLI arguments because:
 *
 * 1. Configuration changes take effect immediately without restarting
 * 2. Supports per-workspace and per-folder configuration
 * 3. VS Code automatically merges settings from different scopes:
 *    - Default settings
 *    - User settings (global)
 *    - Workspace settings
 *    - Workspace folder settings
 *    - Language-specific settings
 *
 * The client returns the effective (merged) configuration value for each item.
 *
 * @param connection The LSP connection to the client
 * @param items Array of configuration items to request
 * @returns Array of configuration values, one for each requested item
 *
 * @example
 * ```typescript
 * const [angularConfig] = await getWorkspaceConfiguration(
 *   session.connection,
 *   [
 *     { section: 'angular.documentSymbols', scopeUri: documentUri },
 *   ]
 * );
 * ```
 */
export async function getWorkspaceConfiguration<T = unknown>(
  connection: lsp.Connection,
  items: ConfigurationItem[],
): Promise<T[]> {
  try {
    return await connection.workspace.getConfiguration(items);
  } catch (error) {
    // Return empty objects if the client doesn't support workspace/configuration
    // This provides graceful degradation for older clients
    return items.map(() => ({}) as T);
  }
}
