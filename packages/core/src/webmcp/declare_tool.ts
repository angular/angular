/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {JsonSchemaForInference} from '../../third_party/@mcp-b/webmcp-types';
import {assertInInjectionContext, inject, Injector, runInInjectionContext} from '../di';
import {DestroyRef} from '../linker';
import type {ModelContext, ToolDescriptor} from './types';

/**
 * Declares a WebMCP tool.
 *
 * The tool is immediately registered and automatically unregistered when
 * the associated injection context is destroyed.
 *
 * The `tool.execute` function is invoked in the injection context of the provided
 * {@link Injector}, or the injection context of `declareExperimentalWebMcpTool` itself.
 *
 * @param tool The tool to register and execute when invoked by an AI agent.
 * @param injector Optional {@link Injector} which will automatically
 *     unregister the tool when destroyed. Defaults to the current injection
 *     context if not provided.
 * @throws NG0203 when called outside an injection context and with no
 *     `injector` argument provided.
 * @experimental
 */
export async function declareExperimentalWebMcpTool<
  const InputSchema extends JsonSchemaForInference,
>(tool: ToolDescriptor<InputSchema>, injector?: Injector): Promise<void> {
  // SSR may not have a document yet, so we abort before checking it.
  if (typeof ngServerMode !== 'undefined' && ngServerMode) return;

  // modelContext was moved from `navigator` to `document` in the spec, but we check both for compatibility with different environments.
  const modelContext =
    (globalThis.document as {modelContext?: ModelContext}).modelContext ??
    (globalThis.navigator as unknown as {modelContext?: ModelContext}).modelContext;

  // Verify WebMCP is supported in this client. The typeof check guards against
  // DOM clobbering (e.g. <form id="modelContext">), which would produce a truthy
  // Element instead of a ModelContext object.
  if (!modelContext || typeof modelContext.registerTool !== 'function') return;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    if (!injector) assertInInjectionContext(declareExperimentalWebMcpTool);
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

  // Unregister when the associated `Injector` is destroyed.
  destroyRef.onDestroy(() => void abortCtrl.abort());

  await modelContext.registerTool(wrappedTool, {signal: abortCtrl.signal});
}
