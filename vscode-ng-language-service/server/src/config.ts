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
 * const [tsConfig, angularConfig] = await getWorkspaceConfiguration(
 *   session.connection,
 *   [
 *     { section: 'typescript.inlayHints', scopeUri: documentUri },
 *     { section: 'angular.inlayHints', scopeUri: documentUri },
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

/**
 * Request a single configuration section from the client.
 *
 * This is a convenience wrapper around getWorkspaceConfiguration for
 * requesting a single section.
 *
 * @param connection The LSP connection to the client
 * @param section The configuration section to request
 * @param scopeUri Optional URI to scope the configuration to a specific file/folder
 * @returns The configuration value for the requested section
 *
 * @example
 * ```typescript
 * const config = await getConfigurationSection(
 *   session.connection,
 *   'angular.inlayHints',
 *   documentUri
 * );
 * ```
 */
export async function getConfigurationSection<T = unknown>(
  connection: lsp.Connection,
  section: string,
  scopeUri?: string,
): Promise<T> {
  const [result] = await getWorkspaceConfiguration<T>(connection, [{section, scopeUri}]);
  return result;
}

/**
 * Flatten a nested configuration object into a flat object with dot-notation keys.
 *
 * VS Code returns configuration as nested objects based on the section hierarchy.
 * This utility flattens them into a format that's easier to work with when
 * mapping to internal configuration formats.
 *
 * @param config The nested configuration object
 * @param prefix The prefix to use for the keys (typically the section name)
 * @returns A flat object with dot-notation keys
 *
 * @example
 * ```typescript
 * // Input: { parameterNames: { enabled: 'all' } }
 * // Output: { 'typescript.inlayHints.parameterNames.enabled': 'all' }
 * const flat = flattenConfiguration(tsConfig, 'typescript.inlayHints');
 * ```
 */
export function flattenConfiguration(
  config: Record<string, unknown>,
  prefix: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function flatten(obj: Record<string, unknown>, currentPrefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = `${currentPrefix}.${key}`;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }

  flatten(config, prefix);
  return result;
}
