/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


const FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
type ProxyZoneSpec = {
  setDelegate(delegateSpec: ZoneSpec): void; getDelegate(): ZoneSpec; resetDelegate(): void;
};
const ProxyZoneSpec: {get(): ProxyZoneSpec; assertPresent: () => ProxyZoneSpec} =
    (Zone as any)['ProxyZoneSpec'];

let _fakeAsyncTestZoneSpec: any = null;

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @experimental
 */
export function resetFakeAsyncZone() {
  _fakeAsyncTestZoneSpec = null;
  ProxyZoneSpec.assertPresent().resetDelegate();
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
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns {Function} The function wrapped to be executed in the fakeAsync zone
 *
 * @experimental
 */
export function fakeAsync(fn: Function): (...args: any[]) => any {
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
        res = fn(...args);
        flushMicrotasks();
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
      resetFakeAsyncZone();
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
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @experimental
 */
export function tick(millis: number = 0): void {
  _getFakeAsyncZoneSpec().tick(millis);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @experimental
 */
export function discardPeriodicTasks(): void {
  let zoneSpec = _getFakeAsyncZoneSpec();
  let pendingTimers = zoneSpec.pendingPeriodicTimers;
  zoneSpec.pendingPeriodicTimers.length = 0;
}

/**
 * Flush any pending microtasks.
 *
 * @experimental
 */
export function flushMicrotasks(): void {
  _getFakeAsyncZoneSpec().flushMicrotasks();
}
