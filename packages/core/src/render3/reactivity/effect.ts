/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext} from '../../di/contextual';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {Watch} from '../../signals';

const globalWatches = new Set<Watch>();
const queuedWatches = new Set<Watch>();

let watchQueuePromise: {promise: Promise<void>; resolveFn: () => void;}|null = null;

/**
 * A global reactive effect, which can be manually destroyed.
 *
 * @developerPreview
 */
export interface EffectRef {
  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;
}

/**
 * Options passed to the `effect` function.
 *
 * @developerPreview
 */
export interface CreateEffectOptions {
  /**
   * The `Injector` in which to create the effect.
   *
   * If this is not provided, the current injection context will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * Whether the `effect` should require manual cleanup.
   *
   * If this is `false` (the default) the effect will automatically register itself to be cleaned up
   * with the current `DestroyRef`.
   */
  manualCleanup?: boolean;
}

/**
 * Create a global `Effect` for the given reactive function.
 *
 * @developerPreview
 */
export function effect(effectFn: () => void, options?: CreateEffectOptions): EffectRef {
  !options?.injector && assertInInjectionContext(effect);

  const injector = options?.injector ?? inject(Injector);
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;

  const watch = new Watch(effectFn, queueWatch);
  globalWatches.add(watch);

  // Effects start dirty.
  watch.notify();

  let unregisterOnDestroy: (() => void)|undefined;

  const destroy = () => {
    unregisterOnDestroy?.();
    queuedWatches.delete(watch);
    globalWatches.delete(watch);
  };

  unregisterOnDestroy = destroyRef?.onDestroy(destroy);

  return {
    destroy,
  };
}

function queueWatch(watch: Watch): void {
  if (queuedWatches.has(watch) || !globalWatches.has(watch)) {
    return;
  }

  queuedWatches.add(watch);

  if (watchQueuePromise === null) {
    Promise.resolve().then(runWatchQueue);

    let resolveFn!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });

    watchQueuePromise = {
      promise,
      resolveFn,
    };
  }
}

function runWatchQueue(): void {
  for (const watch of queuedWatches) {
    queuedWatches.delete(watch);
    watch.run();
  }

  watchQueuePromise!.resolveFn();
  watchQueuePromise = null;
}
