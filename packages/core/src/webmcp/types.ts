/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// g3-only-start
// import type {WebMCP} from 'webmcp-types';
// type ModelContextTool = WebMCP.ModelContextTool;
// type ModelContextToolFromSchema<T extends object> = WebMCP.ModelContextToolFromSchema<T>;
// type ToolExecuteCallbackOptions = WebMCP.ToolExecuteCallbackOptions;
// g3-only-end
// 3p-only-start
import type {
  ModelContextTool,
  ModelContextToolFromSchema,
  ToolExecuteCallbackOptions,
} from '../../third_party/webmcp-types';
// 3p-only-end

/**
 * The client context of a given WebMCP tool execution.
 *
 * @experimental 22.0
 */
export type Client = ToolExecuteCallbackOptions;

/**
 * The execute function of a WebMCP tool. Takes in arguments matching the associated
 * to the connected agent. This is typically just a raw `string`.
 *
 * @experimental 22.0
 */
export type Execute<InputSchema extends object = object> =
  ModelContextToolFromSchema<InputSchema>['execute'];

/**
 * Describes and implements a specific WebMCP tool for an agent to invoke.
 *
 * @experimental 22.0
 */
export interface ToolDescriptor<
  InputSchema extends object = object,
  OutputSchema extends object = object,
> extends Omit<ModelContextTool, 'execute'> {
  /**
   * A schema which describes the input arguments expected by the {@link execute} function
   * which the agent must provide.
   */
  inputSchema?: InputSchema;

  /**
   * A schema which describes the format of the output data.
   *
   * Note: This schema is used purely for metadata purposes to inform AI agents of the expected
   * output format. Angular does not validate that the return value of `execute` strictly adheres
   * to this schema.
   */
  outputSchema?: OutputSchema;

  /** The callback function which implements this tool. */
  execute: Execute<InputSchema>;
}
