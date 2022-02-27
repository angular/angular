/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', waitForAsync(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 *
 * @publicApi
 */
export function waitForAsync(fn: Function): (done: any) => any {
  const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
  if (!_Zone) {
    return function() {
      return Promise.reject(
          'Zone is needed for the waitForAsync() test helper but could not be found. ' +
          'Please make sure that your environment includes zone.js');
    };
  }
  const asyncTest = _Zone && _Zone[_Zone.__symbol__('asyncTest')];
  if (typeof asyncTest === 'function') {
    return asyncTest(fn);
  }
  return function() {
    return Promise.reject(
        'zone-testing.js is needed for the async() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js/testing');
  };
}

/**
 * @deprecated use `waitForAsync()`, (expected removal in v12)
 * @see {@link waitForAsync}
 * @publicApi
 * */
export function async(fn: Function): (done: any) => any {
  return waitForAsync(fn);
}

/**
 * Register a callback function when all the async tasks finished inside
 * the waitForAsync() test function.
 *
 * Example:
 *
 * ```
 * it('...', waitForAsync(() => {
 *   let timeoutCalled = false;
 *   setTimeout(() => {
 *     timeoutCalled = true;
 *   });
 *   onWaitForAsyncFinished(() => {
 *     expect(timeoutCalled).toBe(true);
 *   });
 * });
 * ```
 *
 * @publicApi
 */
export function onWaitForAsyncFinished(fn: Function): void {
  const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
  if (!_Zone) {
    throw new Error(
        'Zone is needed for the waitForAsync() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js');
  };
  const onWaitForAsyncFinished = _Zone && _Zone[_Zone.__symbol__('onWaitForAsyncFinished')];
  if (typeof onWaitForAsyncFinished === 'function') {
    onWaitForAsyncFinished(fn);
  } else {
    throw new Error(
        'zone-testing is needed for the onWaitForAsyncFinished() test helper but could not be found. ' +
        'Please make sure that your environment includes zone-testing.js');
  }
}

/**
 * Register a callback function when error thrown in the async tasks inside
 * the waitForAsync() test function.
 *
 * Example:
 *
 * ```
 * it('...', waitForAsync(() => {
 *   setTimeout(() => {
 *     throw new Error('test');
 *   });
 *   onWaitForAsyncThrowError((err) => {
 *     expect(err.message).toEqual('test');
 *   });
 * });
 * ```
 *
 * @publicApi
 */
export function onWaitForAsyncThrowError(fn: (error: any) => void): void {
  const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
  if (!_Zone) {
    throw new Error(
        'Zone is needed for the waitForAsync() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js');
  };
  const onWaitForAsyncThrowError = _Zone && _Zone[_Zone.__symbol__('onWaitForAsyncThrowError')];
  if (typeof onWaitForAsyncThrowError === 'function') {
    onWaitForAsyncThrowError(fn);
  } else {
    throw new Error(
        'zone-testing is needed for the onWaitForAsyncThrowError() test helper but could not be found. ' +
        'Please make sure that your environment includes zone-testing.js');
  }
}
