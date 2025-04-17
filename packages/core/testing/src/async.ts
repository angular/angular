/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DestroyRef, effect, inject, Injector, Signal} from '../../src/core';
import {TestBedImpl} from './test_bed';

/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```ts
 * it('...', waitForAsync(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * })));
 * ```
 *
 * @publicApi
 */
export function waitForAsync(fn: Function): (done: any) => any {
  const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
  if (!_Zone) {
    return function () {
      return Promise.reject(
        'Zone is needed for the waitForAsync() test helper but could not be found. ' +
          'Please make sure that your environment includes zone.js',
      );
    };
  }
  const asyncTest = _Zone && _Zone[_Zone.__symbol__('asyncTest')];
  if (typeof asyncTest === 'function') {
    return asyncTest(fn);
  }
  return function () {
    return Promise.reject(
      'zone-testing.js is needed for the async() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js/testing',
    );
  };
}

/**
 * Options for `WaitForSignalOptions`.
 *
 * @publicApi
 */
export interface WaitForSignalOptions {
  /**
   * The `Injector` to use when creating the underlying `effect` which watches the signal.
   *
   * If this isn't specified, the TestBed injector will be used
   */
  injector?: Injector;
  /**
   * The timeout value in millisecond
   */
  timeout?: number;
}

/**
 * Utils to wait for a specific condition fulfilled by a Signal's value.
 * By default, it will wait for the signal to be truthy.
 * This is useful when you want to wait for a signal to be in a specific state during your unit tests.
 *
 * @param source The Signal to watch for the test condition.
 * @param testFn The function called with the source value each time the source changes. It should return true when the condition expected is fulfilled.
 * @param options The options to provide both
 *    - the injector to use when creating the underlying effect which watches the signal.
 *
 * If this isn't specified, the TestBed injector will be used
 *
 *    - the timeout value in millisecond. After this time the watcher will be destroyed and the Promise rejected.
 *      Default value is 10000.
 *
 * @usageNotes
 *
 * `waitForSignal` must be called in a test context.
 *
 * @returns The Promise<T> that will be resolved with the signal value when the testFn is returning true.
 *
 * @publicApi
 */
export function waitForSignal<T>(
  source: Signal<T>,
  testFn: (value: T) => boolean = (value) => !!value,
  options?: WaitForSignalOptions,
): Promise<T> {
  const injector = options?.injector ?? TestBedImpl.INSTANCE.inject(Injector);

  const promise = new Promise<T>((resolve, reject) => {
    const watcher = effect(
      () => {
        let value: T;
        try {
          value = source();
          if (testFn(value)) {
            resolve(value);
            cleanUpFn();
          }
        } catch (err) {}
      },
      {injector, manualCleanup: true},
    );
    let cleanUpFn = () => {
      reject();
      clearTimeout(overallTimeoutTimer);
      watcher.destroy();
      destroyFn();
    };

    const overallTimeoutTimer = setTimeout(cleanUpFn, options?.timeout ?? 10000);

    const destroyFn = injector.get(DestroyRef).onDestroy(cleanUpFn);
  });

  return promise;
}
