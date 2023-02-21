/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Consumer} from './graph';
import {Watch} from './watch';

/**
 * A global reactive effect, which can be manually scheduled or destroyed.
 *
 * @developerPreview
 */
export interface Effect {
  /**
   * Schedule the effect for manual execution, if it's not already.
   */
  schedule(): void;

  /**
   * Shut down the effect, removing it from any upcoming scheduled executions.
   */
  destroy(): void;

  /**
   * Direct access to the effect's `Consumer` for advanced use cases.
   */
  readonly consumer: Consumer;
}

/**
 * Create a global `Effect` for the given reactive function.
 *
 * @developerPreview
 */
export function effect(effectFn: () => void): Effect {
  const watch = new Watch(effectFn, queueWatch);
  globalWatches.add(watch);

  // Effects start dirty.
  watch.notify();

  return {
    consumer: watch,
    schedule: watch.notify.bind(watch),
    destroy: () => {
      queuedWatches.delete(watch);
      globalWatches.delete(watch);
    },
  };
}

/**
 * Get a `Promise` that resolves when any scheduled effects have resolved.
 */
export function effectsDone(): Promise<void> {
  return watchQueuePromise?.promise ?? Promise.resolve();
}

/**
 * Shut down all active effects.
 */
export function resetEffects(): void {
  queuedWatches.clear();
  globalWatches.clear();
}

const globalWatches = new Set<Watch>();
const queuedWatches = new Set<Watch>();

let watchQueuePromise: {promise: Promise<void>; resolveFn: () => void;}|null = null;

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
