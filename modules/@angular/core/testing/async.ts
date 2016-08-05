import {BaseException} from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare var global: any;

var _global = <any>(typeof window === 'undefined' ? global : window);

/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 *
 * @stable
 */
export function async(fn: Function): (done: any) => any {
  // If we're running using the Jasmine test framework, adapt to call the 'done'
  // function when asynchronous activity is finished.
  if (_global.jasmine) {
    return (done: any) => {
      runInTestZone(fn, done, (err: string | Error) => {
        if (typeof err === 'string') {
          return done.fail(new Error(<string>err));
        } else {
          done.fail(err);
        }
      });
    };
  }
  // Otherwise, return a promise which will resolve when asynchronous activity
  // is finished. This will be correctly consumed by the Mocha framework with
  // it('...', async(myFn)); or can be used in a custom framework.
  return () => new Promise<void>((finishCallback, failCallback) => {
           runInTestZone(fn, finishCallback, failCallback);
         });
}

function runInTestZone(fn: Function, finishCallback: Function, failCallback: Function) {
  var AsyncTestZoneSpec = (Zone as any /** TODO #9100 */)['AsyncTestZoneSpec'];
  if (AsyncTestZoneSpec === undefined) {
    throw new Error(
        'AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js/dist/async-test.js');
  }
  const asyncTestZoneSpec = new AsyncTestZoneSpec(resetProxyZoneWrapper(finishCallback), resetProxyZoneWrapper(failCallback), 'test');

  var proxyZoneSpec = (Zone as any).current.get('ProxyZoneSpec');
  if (!proxyZoneSpec) {
    throw new BaseException("ProxyZoneSpec not found. Did you forget to install it?");
  }
  proxyZoneSpec.setDelegate(asyncTestZoneSpec);

  return testZone.run(fn);
}


/**
 * Wraps a callback into a function that calls the callback and resets the ProxyZone spec delegate
 */
function resetProxyZoneWrapper(callback: Function): Function {
  return function() {
    try {
      callback.call(null, arguments);
    } finally {
      const proxyZoneSpec = (Zone as any).current.get('ProxyZoneSpec');
      proxyZoneSpec.resetDelegate();
    }
  }
}
