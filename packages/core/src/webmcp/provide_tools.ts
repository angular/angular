/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';
import {EnvironmentProviders, makeEnvironmentProviders, provideEnvironmentInitializer} from '../di';
import {declareWebMcpTool} from './declare_tool';
import type {ToolDescriptor} from './types';

/**
 * Provides a list of WebMCP tools tied to the lifecycle of the associated `Injector`.
 *
 * The tools are automatically registered when the environment is initialized
 * and unregistered when the associated injector is destroyed.
 *
 * The `tools[number].execute` function is invoked in the injection context of the
 * associated `Injector`.
 *
 * @param tools The tools to register and execute when invoked by an AI agent.
 * @returns An {@link EnvironmentProviders} that can be used in `bootstrapApplication`
 *     or route providers.
 * @experimental
 */
export function provideWebMcpTools<const InputSchema extends JsonSchemaForInference>(
  tools: ToolDescriptor<InputSchema>[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      for (const tool of tools) declareWebMcpTool(tool);
    }),
  ]);
}
