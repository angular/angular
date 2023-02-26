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

function noop() {}

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
      watch.schedule = noop;
      queuedWatches.delete(watch);
      globalWatches.delete(watch);
    },
  };
}

/**
 * Get a `Promise` that resolves when any scheduled effects have resolved.
 */
export function effectsDone(): Promise<void> {
  if (watchQueuePromise === undefined) {
    // There are no pending effects, so resolve immediately.
    return Promise.resolve();
  }
  if (watchQueuePromise === null) {
    // There are pending effects but the notification promise has not yet been created; do so now.
    let resolveFn!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });

    watchQueuePromise = {promise, resolveFn};
  }
  return watchQueuePromise.promise;
}

/**
 * Shut down all active effects.
 */
export function resetEffects(): void {
  queuedWatches.clear();
  for (const watch of globalWatches) {
    watch.schedule = noop;
  }
  globalWatches.clear();
}

const globalWatches = new Set<Watch>();
const queuedWatches = new Set<Watch>();

interface EffectsDone {
  promise: Promise<void>;
  resolveFn: () => void;
}

/**
 * Represents the outstanding watch queue promise. A value of `undefined` indicates that no
 * microtick has been scheduled yet, indicating that the effects queue is empty. The value is set to
 * `null` once an effect is being queued, to indicate that a microtick to flush the queue has been
 * scheduled. Only when `effectsDone()` is being used do we create a promise to notify when the
 * effects queue has been flushed, to avoid the cost of this promise unless it has been requested.
 */
let watchQueuePromise: EffectsDone|null|undefined = undefined;

function queueWatch(watch: Watch): void {
  queuedWatches.add(watch);

  if (watchQueuePromise === undefined) {
    Promise.resolve().then(runWatchQueue);
    watchQueuePromise = null;
  }
}

export function runWatchQueue(): void {
  for (const watch of queuedWatches) {
    watch.run();
  }
  queuedWatches.clear();

  watchQueuePromise?.resolveFn();
  watchQueuePromise = undefined;
}
