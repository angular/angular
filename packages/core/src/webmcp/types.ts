/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// g3-only-start
// import type {
//   InferArgsFromInputSchema,
//   JsonSchemaForInference,
// } from '@mcp-b/webmcp-types';
// g3-only-end
// 3p-only-start
import type {
  InferArgsFromInputSchema,
  JsonSchemaForInference,
} from '../../third_party/@mcp-b/webmcp-types';
// 3p-only-end

/**
 * The client context of a given WebMCP tool execution.
 *
 * @experimental 22.0
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
 * @experimental 22.0
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
 * Annotations for a WebMCP tool which describe its behavior.
 *
 * @experimental 22.2
 */
export interface Annotations {
  /**
   * A hint that the tool will not modify user-visible state (e.g. it will not trigger
   * a navigation, mutate the DOM, or alter data stored on a backend). Agents may be
   * more likely to use tools which are explicitly declared read-only as they are
   * safer against potential misuse.
   */
  readOnlyHint?: boolean;

  /**
   * A hint that the tool will return untrusted content from the perspective of the
   * author of the tool.
   */
  untrustedContentHint?: boolean;
}

/**
 * Describes and implements a specific WebMCP tool for an agent to invoke.
 *
 * @experimental 22.0
 */
export interface ToolDescriptor<InputSchema extends JsonSchemaForInference> {
  /** The unique name of this tool. */
  name: string;

  /** A description of what the tool does and how the agent should consider using it. */
  description: string;

  /**
   * A schema which describes the input arguments expected by the {@link execute} function
   * which the agent must provide.
   */
  inputSchema: InputSchema;

  /** The callback function which implements this tool. */
  execute: Execute<InputSchema>;

  /** Optional annotations describing the tool's behavior and safety properties. */
  annotations?: Annotations;
}

/** The `window.document.modelContext` object for imperatively registering WebMCP tools. */
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
  ): Promise<void>;
}
