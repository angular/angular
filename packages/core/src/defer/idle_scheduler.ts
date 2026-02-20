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
 * Helper service to schedule and manage `requestIdleCallback`s.
 */
export class IdleScheduler implements OnDestroy {
  ngZone = inject(NgZone);

  requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
  cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis);

  idleCallbackIds = new Map<VoidFunction, number>();

  add(callback: VoidFunction) {
    const id = this.requestIdleCallbackFn(() => this.ngZone.run(callback)) as number;
    this.idleCallbackIds.set(callback, id);
  }

  remove(callback: VoidFunction) {
    if (this.idleCallbackIds.has(callback)) {
      const id = this.idleCallbackIds.get(callback);
      this.cancelIdleCallbackFn(id!);
      this.idleCallbackIds.delete(callback);
    }
  }

  ngOnDestroy() {
    for (const [_, id] of this.idleCallbackIds) {
      this.cancelIdleCallbackFn(id);
    }
    this.idleCallbackIds.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IdleScheduler,
    providedIn: 'root',
    factory: () => new IdleScheduler(),
  });
}
