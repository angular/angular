/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * fakeAsync has been moved to zone.js
 * this file is for fallback in case old version of zone.js is used
 */
const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
const FakeAsyncTestZoneSpec = _Zone && _Zone['FakeAsyncTestZoneSpec'];
type ProxyZoneSpec = {
  setDelegate(delegateSpec: ZoneSpec): void; getDelegate(): ZoneSpec; resetDelegate(): void;
};
const ProxyZoneSpec: {get(): ProxyZoneSpec; assertPresent: () => ProxyZoneSpec} =
    _Zone && _Zone['ProxyZoneSpec'];

let _fakeAsyncTestZoneSpec: any = null;

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeAsyncZoneFallback() {
  _fakeAsyncTestZoneSpec = null;
  // in node.js testing we may not have ProxyZoneSpec in which case there is nothing to reset.
  ProxyZoneSpec && ProxyZoneSpec.assertPresent().resetDelegate();
}

let _inFakeAsyncCall = false;

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * Can be used to wrap inject() calls.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns The function wrapped to be executed in the fakeAsync zone
 *
 * @publicApi
 */
export function fakeAsyncFallback(fn: Function): (...args: any[]) => any {
  // Not using an arrow function to preserve context passed from call site
  return function(...args: any[]) {
    const proxyZoneSpec = ProxyZoneSpec.assertPresent();
    if (_inFakeAsyncCall) {
      throw new Error('fakeAsync() calls can not be nested');
    }
    _inFakeAsyncCall = true;
    try {
      if (!_fakeAsyncTestZoneSpec) {
        if (proxyZoneSpec.getDelegate() instanceof FakeAsyncTestZoneSpec) {
          throw new Error('fakeAsync() calls can not be nested');
        }

        _fakeAsyncTestZoneSpec = new FakeAsyncTestZoneSpec();
      }

      let res: any;
      const lastProxyZoneSpec = proxyZoneSpec.getDelegate();
      proxyZoneSpec.setDelegate(_fakeAsyncTestZoneSpec);
      try {
        res = fn.apply(this, args);
        flushMicrotasksFallback();
      } finally {
        proxyZoneSpec.setDelegate(lastProxyZoneSpec);
      }

      if (_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length > 0) {
        throw new Error(
            `${_fakeAsyncTestZoneSpec.pendingPeriodicTimers.length} ` +
            `periodic timer(s) still in the queue.`);
      }

      if (_fakeAsyncTestZoneSpec.pendingTimers.length > 0) {
        throw new Error(
            `${_fakeAsyncTestZoneSpec.pendingTimers.length} timer(s) still in the queue.`);
      }
      return res;
    } finally {
      _inFakeAsyncCall = false;
      resetFakeAsyncZoneFallback();
    }
  };
}

function _getFakeAsyncZoneSpec(): any {
  if (_fakeAsyncTestZoneSpec == null) {
    throw new Error('The code should be running in the fakeAsync zone to call this function');
  }
  return _fakeAsyncTestZoneSpec;
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @publicApi
 */
export function tickFallback(millis: number = 0): void {
  _getFakeAsyncZoneSpec().tick(millis);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
 * draining the macrotask queue until it is empty. The returned value is the milliseconds
 * of time that would have been elapsed.
 *
 * @param maxTurns
 * @returns The simulated time elapsed, in millis.
 *
 * @publicApi
 */
export function flushFallback(maxTurns?: number): number {
  return _getFakeAsyncZoneSpec().flush(maxTurns);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardPeriodicTasksFallback(): void {
  const zoneSpec = _getFakeAsyncZoneSpec();
  zoneSpec.pendingPeriodicTimers.length = 0;
}

/**
 * Flush any pending microtasks.
 *
 * @publicApi
 */
export function flushMicrotasksFallback(): void {
  _getFakeAsyncZoneSpec().flushMicrotasks();
}
