/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';
import {assertInInjectionContext, inject, Injector, runInInjectionContext} from '../di';
import type {ModelContext, ToolDescriptor} from './types';
import {DestroyRef} from '../linker';

/**
 * Declares a WebMCP tool.
 *
 * The tool is immediately registered and automatically unregistered when
 * the associated injection context is destroyed.
 *
 * The `tool.execute` function is invoked in the injection context of the provided
 * {@link Injector}, or the injection context of `declareWebMcpTool` itself.
 *
 * @param tool The tool to register and execute when invoked by an AI agent.
 * @param injector Optional {@link Injector} which will automatically
 *     unregister the tool when destroyed. Defaults to the current injection
 *     context if not provided.
 * @throws NG0203 when called outside an injection context and with no
 *     `injector` argument provided.
 * @experimental
 */
export function declareWebMcpTool<const InputSchema extends JsonSchemaForInference>(
  tool: ToolDescriptor<InputSchema>,
  injector?: Injector,
): void {
  const {modelContext} = globalThis.navigator as typeof globalThis.navigator & {
    modelContext?: ModelContext;
  };

  // Verify WebMCP is supported in this client.
  if (!modelContext) return;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    if (!injector) assertInInjectionContext(declareWebMcpTool);
  }

  // Inject the `DestroyRef` and `Injector` immediately, so if it fails we abort
  // before causing any side effects.
  const currentInjector = injector ?? inject(Injector);
  const destroyRef = currentInjector.get(DestroyRef);

  // Wrap the input tool with an `AbortSignal` which aborts when the
  // injection context is destroyed.
  const abortCtrl = new AbortController();
  const wrappedTool: ToolDescriptor<InputSchema> = {
    ...tool,
    execute: (args, client) =>
      runInInjectionContext(currentInjector, () =>
        tool.execute(args, {
          ...client,
          signal: abortCtrl.signal,
        }),
      ),
  };

  modelContext.registerTool(wrappedTool, {signal: abortCtrl.signal});

  // Unregister when the associated `Injector` is destroyed.
  destroyRef.onDestroy(() => {
    abortCtrl.abort();

    // `unregisterTool` has been removed from the spec, but we continue to
    // call it because `@mcp-b/webmcp-polyfill` still relies on it for tests.
    modelContext.unregisterTool?.({name: tool.name});
  });
}
