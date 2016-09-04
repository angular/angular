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
      if (!done) {
        // if we run beforeEach in @angular/core/testing/testing_internal then we get no done
        // fake it here and assume sync.
        done = function() {};
        done.fail = function(e: any) { throw e; };
      }
      runInTestZone(fn, done, (err: any) => {
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
  const currentZone = Zone.current;
  var AsyncTestZoneSpec = (Zone as any)['AsyncTestZoneSpec'];
  if (AsyncTestZoneSpec === undefined) {
    throw new Error(
        'AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js/dist/async-test.js');
  }
  const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'] as {
    get(): {setDelegate(spec: ZoneSpec): void; getDelegate(): ZoneSpec;};
    assertPresent: () => void;
  };
  if (ProxyZoneSpec === undefined) {
    throw new Error(
        'ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
        'Please make sure that your environment includes zone.js/dist/proxy.js');
  }
  const proxyZoneSpec = ProxyZoneSpec.get();
  ProxyZoneSpec.assertPresent();
  // We need to create the AsyncTestZoneSpec outside the ProxyZone.
  // If we do it in ProxyZone then we will get to infinite recursion.
  const proxyZone = Zone.current.getZoneWith('ProxyZoneSpec');
  const previousDelegate = proxyZoneSpec.getDelegate();
  proxyZone.parent.run(() => {
    var testZoneSpec: ZoneSpec = new AsyncTestZoneSpec(
        () => {
          // Need to restore the original zone.
          currentZone.run(() => {
            if (proxyZoneSpec.getDelegate() == testZoneSpec) {
              // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
              proxyZoneSpec.setDelegate(previousDelegate);
            }
            finishCallback();
          });
        },
        (error: any) => {
          // Need to restore the original zone.
          currentZone.run(() => {
            if (proxyZoneSpec.getDelegate() == testZoneSpec) {
              // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
              proxyZoneSpec.setDelegate(previousDelegate);
            }
            failCallback(error);
          });
        },
        'test');
    proxyZoneSpec.setDelegate(testZoneSpec);
  });
  return Zone.current.runGuarded(fn);
}
