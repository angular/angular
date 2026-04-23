/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Injector} from '../di';
import {DehydratedBlockRegistry} from '../defer/registry';
import {processAndInitTriggers} from '../defer/triggering';
import {performanceMarkFeature} from '../util/performance';
import {gatherDeferBlocksCommentNodes} from './node_lookup_utils';
import {
  appendDeferBlocksToJSActionMap,
  enableRetrieveDeferBlockDataImpl,
  processBlockData,
} from './utils';

/**
 * Default no-op factory for `DEHYDRATED_BLOCK_REGISTRY`.
 */
let _dehydratedBlockRegistryFactory: () => DehydratedBlockRegistry | null = () => null;

/**
 * Default no-op bootstrap impl for incremental hydration. Replaced by the
 * real implementation when `ɵɵenableIncrementalHydrationRuntime` is called.
 */
let _runIncrementalHydrationBootstrap: (injector: Injector, doc: Document) => void = () => {};

/**
 * Whether the incremental-hydration runtime has been activated.
 * Used to make `ɵɵenableIncrementalHydrationRuntime` idempotent.
 */
let isIncrementalHydrationRuntimeActive = false;

/**
 * Returns the `DehydratedBlockRegistry` used by incremental hydration, or
 * `null` if the runtime has not been activated.
 */
export function createDehydratedBlockRegistry(): DehydratedBlockRegistry | null {
  return _dehydratedBlockRegistryFactory();
}

/**
 * Runs the incremental-hydration bootstrap routine (defer-block scanning,
 * trigger initialization, jsaction wiring). Called from `APP_BOOTSTRAP_LISTENER`.
 * No-op until the runtime is activated.
 */
export function runIncrementalHydrationBootstrap(injector: Injector, doc: Document): void {
  _runIncrementalHydrationBootstrap(injector, doc);
}

/**
 * Activates the incremental-hydration runtime.
 *
 * Emitted by the Angular compiler at the top level of every component file
 * whose template contains a `@defer (hydrate ...)` trigger. The first call
 * swaps in real implementations; subsequent calls are no-ops.
 *
 * @codeGenApi
 */
export function ɵɵenableIncrementalHydrationRuntime(): void {
  if (isIncrementalHydrationRuntimeActive) {
    return;
  }
  isIncrementalHydrationRuntimeActive = true;

  enableRetrieveDeferBlockDataImpl();

  performanceMarkFeature('NgIncrementalHydration');

  _dehydratedBlockRegistryFactory = () => new DehydratedBlockRegistry();

  _runIncrementalHydrationBootstrap = (injector, doc) => {
    const deferBlockData = processBlockData(injector);
    const commentsByBlockId = gatherDeferBlocksCommentNodes(doc, doc.body);
    processAndInitTriggers(injector, deferBlockData, commentsByBlockId);
    appendDeferBlocksToJSActionMap(doc, injector);
  };
}
