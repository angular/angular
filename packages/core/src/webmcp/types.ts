/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {
  InferArgsFromInputSchema,
  JsonSchemaForInference,
} from '../../third_party/@mcp-b/webmcp-types';

/**
 * The client context of a given WebMCP tool execution.
 *
 * @experimental
 */
export interface Client {
  // Mostly empty for now until we have more clarity of what this will contain.

  /**
   * A signal which notifies the tool when the operation is aborted. When triggered, the
   * current operation should be canceled and all allocated resources should be cleaned up.
   */
  signal: AbortSignal;
}

/**
 * The execute function of a WebMCP tool. Takes in arguments matching the associated
 * `inputSchema` and returns content for the agent. The returned result is typically a
 * `string`.
 *
 * @param args The arguments of the tool provided by the agent.
 * @param client The client context invoking the tool.
 * @returns The result of executing the tool which will be serialized and provided back
 *     to the connected agent. This is typically just a raw `string`.
 * @experimental
 */
export type Execute<InputSchema extends JsonSchemaForInference> = (
  args: InferArgsFromInputSchema<InputSchema>,
  client: Client,
) => unknown;

/** Options for registering a WebMCP tool. */
export interface ToolRegistrationOptions {
  /** The signal to use for unregistering the tool. */
  signal?: AbortSignal;
}

/**
 * Describes and implements a specific WebMCP tool for an agent to invoke.
 *
 * @experimental
 */
export interface ToolDescriptor<InputSchema extends JsonSchemaForInference> {
  /** The unique name of this tool. */
  name: string;

  /** A description of what the tool does and how the agent should consider using it. */
  description?: string;

  /**
   * A schema which describes the input arguments expected by the {@link execute} function
   * which the agent must provide.
   */
  inputSchema: InputSchema;

  /** The callback function which implements this tool. */
  execute: Execute<InputSchema>;
}

/** The `window.navigator.modelContext` object for imperatively registering WebMCP tools. */
export interface ModelContext {
  /**
   * Register a WebMCP tool for the agent to invoke.
   *
   * @param tool The tool to register.
   * @param options Configuration for the registration.
   */
  registerTool<const InputSchema extends JsonSchemaForInference>(
    tool: ToolDescriptor<InputSchema>,
    options?: ToolRegistrationOptions,
  ): void;

  /**
   * Unregister a tool.
   *
   * @deprecated Only exists for out-of-date `@mcp-b/webmcp-polyfill` testing tool.
   */
  unregisterTool(tool: {name: string}): void;
}
