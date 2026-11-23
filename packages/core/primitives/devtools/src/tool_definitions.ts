/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Definition of an AI tool that can be exposed to Chrome DevTools.
 */
export interface ToolDefinition<T = any, R = unknown> {
  /** Name of the tool, should be namespaced (e.g., 'angular:di_graph'). */
  name: string;

  /** Human-readable description of what the tool does. */
  description: string;

  /** JSON schema for the tool's input arguments. */
  inputSchema: Record<string, unknown>;

  /** Function that executes the tool. */
  execute: (args: T) => R | Promise<R>;
}

/**
 * A group of related AI tools.
 */
export interface ToolGroup {
  /** Name of the tool group. */
  name: string;

  /** List of tools in this group. */
  tools: ToolDefinition[];
}

/**
 * Event dispatched by Chrome DevTools to discover tools in the page.
 */
export interface DevtoolsToolDiscoveryEvent extends CustomEvent {
  /** Callback to register tools with DevTools. */
  respondWith(toolGroup: ToolGroup): void;
}
