/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, inject, ɵɵdefineInjectable} from '../di';
import {NgZone} from '../zone';

/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param injector injector for the app
 * @param timeout Optional timeout in milliseconds to pass to requestIdleCallback
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
  idleId: number | null = null;

  // Set of callbacks to be invoked next.
  current = new Set<VoidFunction>();

  // Set of callbacks collected while invoking current set of callbacks.
  // Those callbacks are scheduled for the next idle period.
  deferred = new Set<VoidFunction>();

  // Options to pass to requestIdleCallback
  private timeout: number | null = null;

  ngZone = inject(NgZone);

  requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
  cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis);

  add(callback: VoidFunction, options?: IdleRequestOptions) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    target.add(callback);
    // Store options if provided, giving precedence to the first non-undefined options
    if (options) {
      this.timeout = options.timeout ?? null;
    }
    if (this.idleId === null) {
      this.scheduleIdleCallback();
    }
  }

  remove(callback: VoidFunction) {
    const {current, deferred} = this;

    current.delete(callback);
    deferred.delete(callback);

    // If the last callback was removed and there is a pending
    // idle callback - cancel it.
    if (current.size === 0 && deferred.size === 0) {
      this.cancelIdleCallback();
    }
  }

  private scheduleIdleCallback() {
    const callback = () => {
      this.cancelIdleCallback();

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
    const idleCallback = () => this.ngZone.run(callback);

    // Only pass options if we're using the real requestIdleCallback (not setTimeout fallback)
    if (this.timeout && typeof requestIdleCallback !== 'undefined') {
      this.idleId = requestIdleCallback(idleCallback, {timeout: this.timeout});
    } else {
      this.idleId = this.requestIdleCallbackFn(idleCallback) as number;
    }
  }

  private cancelIdleCallback() {
    if (this.idleId !== null) {
      this.cancelIdleCallbackFn(this.idleId);
      this.idleId = null;
      this.timeout = null;
    }
  }

  ngOnDestroy() {
    this.cancelIdleCallback();
    this.current.clear();
    this.deferred.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IdleScheduler,
    providedIn: 'root',
    factory: () => new IdleScheduler(),
  });
}
