/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {OnDestroy} from '../core';
import {Injector, inject, ɵɵdefineInjectable} from '../di';
import {NgZone} from '../zone';
import {IDLE_SERVICE} from './idle_service';

/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param injector injector for the app
 * @param options Optional options passed to `requestIdleCallback`.
 */
export function onIdle(callback: VoidFunction, injector: Injector, options?: IdleRequestOptions) {
  const scheduler = injector.get(IdleScheduler);
  const cleanupFn = () => scheduler.remove(callback);

  scheduler.add(callback, options);
  return cleanupFn;
}

export function onIdleWrapper(options?: IdleRequestOptions) {
  return (callback: VoidFunction, injector: Injector) => onIdle(callback, injector, options);
}

/**
 * A bucket groups callbacks sharing the same idle request options into a single
 * `requestIdleCallback` invocation.
 */
interface IdleBucket {
  idleId: number | null;
  readonly queue: Set<VoidFunction>;
}

/**
 * Helper service to schedule `requestIdleCallback`s for batches of defer blocks,
 * to avoid calling `requestIdleCallback` for each defer block (e.g. if
 * defer blocks are defined inside a for loop).
 *
 * Callbacks are grouped into buckets by their serialized options key. Each bucket is
 * scheduled independently with its own `requestIdleCallback` call, so different
 * options never interfere with each other. Callbacks that share the same
 * options (including no options) are batched together.
 */
export class IdleScheduler implements OnDestroy {
  // Serialize options rather than using the object reference to ensure
  // that different IdleRequestOptions references with the same values
  // are batched into the same bucket.
  private readonly buckets = new Map<string, IdleBucket>();

  // Lookup from callback to its bucket key.
  private readonly callbackBucket = new Map<VoidFunction, string>();

  private readonly ngZone = inject(NgZone);
  private readonly idleService = inject(IDLE_SERVICE);

  add(callback: VoidFunction, options?: IdleRequestOptions) {
    const key = getIdleRequestKey(options);
    this.callbackBucket.set(callback, key);

    let bucket = this.buckets.get(key);
    if (bucket == null) {
      bucket = {idleId: null, queue: new Set()};
      this.buckets.set(key, bucket);
    }
    bucket.queue.add(callback);
    this.scheduleBucket(bucket, options);
  }

  remove(callback: VoidFunction) {
    const key = this.callbackBucket.get(callback);
    if (key === undefined) return;

    this.callbackBucket.delete(callback);

    const bucket = this.buckets.get(key);
    if (!bucket) return;

    bucket.queue.delete(callback);

    // If the last callback in this bucket was removed, cancel the
    // idle callback - cancel it.
    if (bucket.queue.size === 0) {
      this.cancelBucket(bucket);
      this.buckets.delete(key);
    }
  }

  private scheduleBucket(bucket: IdleBucket, options?: IdleRequestOptions) {
    if (bucket.idleId !== null) {
      return;
    }

    const key = getIdleRequestKey(options);
    const callback = (deadline?: IdleDeadline) => {
      this.cancelBucket(bucket);

      for (const cb of bucket.queue) {
        cb();
        bucket.queue.delete(cb);
        this.callbackBucket.delete(cb);

        if (deadline && deadline.timeRemaining() === 0 && !deadline.didTimeout) {
          break;
        }
      }

      if (bucket.queue.size > 0) {
        this.scheduleBucket(bucket, options);
      } else {
        this.buckets.delete(key);
      }
    };

    // Ensure that the callback runs in the NgZone since
    // the `requestIdleCallback` is not currently patched by Zone.js.
    bucket.idleId = this.idleService.requestOnIdle(
      (deadline) => this.ngZone.run(() => callback(deadline)),
      options,
    );
  }

  private cancelBucket(bucket: IdleBucket) {
    if (bucket.idleId !== null) {
      this.idleService.cancelOnIdle(bucket.idleId);
      bucket.idleId = null;
    }
  }

  ngOnDestroy() {
    for (const bucket of this.buckets.values()) {
      this.cancelBucket(bucket);
    }
    this.buckets.clear();
    this.callbackBucket.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IdleScheduler,
    providedIn: 'root',
    factory: () => new IdleScheduler(),
  });
}

/** Generates a string that can be used to find identical idle request option objects. */
function getIdleRequestKey(options?: IdleRequestOptions): string {
  if (!options || options.timeout == null) {
    return '';
  }

  return `${options.timeout}`;
}
