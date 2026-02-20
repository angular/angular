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

/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param injector injector for the app
 */
export function onIdle(callback: VoidFunction, injector: Injector) {
  const scheduler = injector.get(IdleScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  scheduler.add(callback);
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
export class IdleScheduler implements OnDestroy {
  // Currently scheduled idle callback id.
  idleId: number | null = null;

  // Queue of callbacks to be invoked next.
  queue = new Set<VoidFunction>();

  ngZone = inject(NgZone);

  requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
  cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis);

  add(callback: VoidFunction) {
    this.queue.add(callback);
    this.scheduleIdleCallback();
  }

  remove(callback: VoidFunction) {
    this.queue.delete(callback);

    // If the last callback was removed and there is a pending
    // idle callback - cancel it.
    if (this.queue.size === 0) {
      this.cancelIdleCallback();
    }
  }

  private scheduleIdleCallback() {
    if (this.idleId !== null) {
      return;
    }

    const callback = (deadline?: IdleDeadline) => {
      this.cancelIdleCallback();

      for (const callbackFn of this.queue) {
        callbackFn();
        this.queue.delete(callbackFn);

        if (deadline && deadline.timeRemaining() === 0 && !deadline.didTimeout) {
          break;
        }
      }

      if (this.queue.size > 0) {
        this.scheduleIdleCallback();
      }
    };
    // Ensure that the callback runs in the NgZone since
    // the `requestIdleCallback` is not currently patched by Zone.js.
    this.idleId = this.requestIdleCallbackFn((deadline) =>
      this.ngZone.run(() => callback(deadline)),
    ) as number;
  }

  private cancelIdleCallback() {
    if (this.idleId !== null) {
      this.cancelIdleCallbackFn(this.idleId);
      this.idleId = null;
    }
  }

  ngOnDestroy() {
    this.cancelIdleCallback();
    this.queue.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IdleScheduler,
    providedIn: 'root',
    factory: () => new IdleScheduler(),
  });
}
