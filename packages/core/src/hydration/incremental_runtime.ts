/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DehydratedBlockRegistry} from '../defer/registry';
import {processAndInitTriggers} from '../defer/triggering';
import type {Injector} from '../di';
import {InjectionToken} from '../di/injection_token';
import {INJECTOR} from '../render3/interfaces/view';
import {getLView} from '../render3/state';
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

interface IncrementalHydrationBootstrapState {
  requested: boolean;
  activated: boolean;
  injector: Injector;
  document: Document;
}

export const INCREMENTAL_HYDRATION_BOOTSTRAP =
  new InjectionToken<IncrementalHydrationBootstrapState>(
    typeof ngDevMode === 'undefined' || ngDevMode ? 'INCREMENTAL_HYDRATION_BOOTSTRAP' : '',
  );

/**
 * Returns the `DehydratedBlockRegistry` used by incremental hydration, or
 * `null` if the runtime has not been activated.
 */
export function createDehydratedBlockRegistry(): DehydratedBlockRegistry | null {
  return _dehydratedBlockRegistryFactory();
}

/**
 * Runs incremental hydration bootstrap once application bootstrap and the
 * compiler-generated runtime activation have both occurred.
 */
export function runIncrementalHydrationBootstrap(state: IncrementalHydrationBootstrapState): void {
  if (state.requested && state.activated) {
    _runIncrementalHydrationBootstrap(state.injector, state.document);
  }
}

/**
 * Activates the incremental-hydration runtime.
 *
 * Emitted by the Angular compiler before the first hydrating `@defer` block in
 * a creation block. The first call swaps in the real implementations. Every
 * client call also notifies the current application that the runtime is
 * available.
 *
 * @codeGenApi
 */
export function ɵɵenableIncrementalHydrationRuntime(): void {
  if (!isIncrementalHydrationRuntimeActive) {
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

  if (typeof ngServerMode === 'undefined' || !ngServerMode) {
    const injector = getLView()[INJECTOR];
    const state = injector.get(INCREMENTAL_HYDRATION_BOOTSTRAP, null, {optional: true});
    if (state !== null && !state.activated) {
      state.activated = true;
      runIncrementalHydrationBootstrap(state);
    }
  }
}

/**
 * Resets module-level runtime activation for tests that run SSR and client hydration in the same
 * process. This is not a full hydration reset and should only be used when cold client activation
 * is part of the behavior under test.
 */
export function resetIncrementalHydrationRuntimeForTests(): void {
  isIncrementalHydrationRuntimeActive = false;
  _dehydratedBlockRegistryFactory = () => null;
  _runIncrementalHydrationBootstrap = () => {};
}
