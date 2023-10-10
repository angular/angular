/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, ɵɵdefineInjectable} from '../di';
import {INJECTOR, LView} from '../render3/interfaces/view';
import {NgZone} from '../zone';

import {wrapWithLViewCleanup} from './utils';

/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param lView LView that hosts an instance of a defer block.
 * @param withLViewCleanup A flag that indicates whether a scheduled callback
 *           should be cancelled in case an LView is destroyed before a callback
 *           was invoked.
 */
export function onIdle(callback: VoidFunction, lView: LView, withLViewCleanup: boolean) {
  const injector = lView[INJECTOR]!;
  const scheduler = injector.get(IdleScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  const wrappedCallback =
      withLViewCleanup ? wrapWithLViewCleanup(callback, lView, cleanupFn) : callback;
  scheduler.add(wrappedCallback);
  return cleanupFn;
}

/**
 * Use shims for the `requestIdleCallback` and `cancelIdleCallback` functions for
 * environments where those functions are not available (e.g. Node.js and Safari).
 *
 * Note: we wrap the `requestIdleCallback` call into a function, so that it can be
 * overridden/mocked in test environment and picked up by the runtime code.
 */
const _requestIdleCallback = () =>
    typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
const _cancelIdleCallback = () =>
    typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;

/**
 * Helper service to schedule `requestIdleCallback`s for batches of defer blocks,
 * to avoid calling `requestIdleCallback` for each defer block (e.g. if
 * defer blocks are defined inside a for loop).
 */
export class IdleScheduler {
  // Indicates whether current callbacks are being invoked.
  executingCallbacks = false;

  // Currently scheduled idle callback id.
  idleId: number|null = null;

  // Set of callbacks to be invoked next.
  current = new Set<VoidFunction>();

  // Set of callbacks collected while invoking current set of callbacks.
  // Those callbacks are scheduled for the next idle period.
  deferred = new Set<VoidFunction>();

  ngZone = inject(NgZone);

  requestIdleCallback = _requestIdleCallback().bind(globalThis);
  cancelIdleCallback = _cancelIdleCallback().bind(globalThis);

  add(callback: VoidFunction) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    target.add(callback);
    if (this.idleId === null) {
      this.scheduleIdleCallback();
    }
  }

  remove(callback: VoidFunction) {
    this.current.delete(callback);
    this.deferred.delete(callback);
  }

  private scheduleIdleCallback() {
    const callback = () => {
      this.cancelIdleCallback(this.idleId!);
      this.idleId = null;

      this.executingCallbacks = true;

      for (const callback of this.current) {
        callback();
      }
      this.current.clear();

      this.executingCallbacks = false;

      // If there are any callbacks added during an invocation
      // of the current ones - make them "current" and schedule
      // a new idle callback.
      if (this.deferred.size > 0) {
        for (const callback of this.deferred) {
          this.current.add(callback);
        }
        this.deferred.clear();
        this.scheduleIdleCallback();
      }
    };
    // Ensure that the callback runs in the NgZone since
    // the `requestIdleCallback` is not currently patched by Zone.js.
    this.idleId = this.requestIdleCallback(() => this.ngZone.run(callback)) as number;
  }

  ngOnDestroy() {
    if (this.idleId !== null) {
      this.cancelIdleCallback(this.idleId);
      this.idleId = null;
    }
    this.current.clear();
    this.deferred.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: IdleScheduler,
    providedIn: 'root',
    factory: () => new IdleScheduler(),
  });
}
