/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

('use strict');
declare let jest: any;

export function patchJest(Zone: ZoneType): void {
  Zone.__load_patch('jest', (context: any, Zone: ZoneType, api: _ZonePrivate) => {
    if (typeof jest === 'undefined' || jest['__zone_patch__']) {
      return;
    }

    // From jest 29 and jest-preset-angular v13, the module transform logic
    // changed, and now jest-preset-angular use the use the tsconfig target
    // other than the hardcoded one, https://github.com/thymikee/jest-preset-angular/issues/2010
    // But jest-angular-preset doesn't introduce the @babel/plugin-transform-async-to-generator
    // which is needed by angular since `async/await` still need to be transformed
    // to promise for ES2017+ target.
    // So for now, we disable to output the uncaught error console log for a temp solution,
    // until jest-preset-angular find a proper solution.
    (Zone as any)[api.symbol('ignoreConsoleErrorUncaughtError')] = true;
    jest['__zone_patch__'] = true;

    const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
    const SyncTestZoneSpec = (Zone as any)['SyncTestZoneSpec'];

    if (!ProxyZoneSpec) {
      throw new Error('Missing ProxyZoneSpec');
    }

    const rootZone = Zone.current;
    const syncZone = rootZone.fork(new SyncTestZoneSpec('jest.describe'));
    const proxyZoneSpec = new ProxyZoneSpec();
    const proxyZone = rootZone.fork(proxyZoneSpec);

    function wrapDescribeFactoryInZone(originalJestFn: Function) {
      return function (this: unknown, ...tableArgs: any[]) {
        const originalDescribeFn = originalJestFn.apply(this, tableArgs);
        return function (this: unknown, ...args: any[]) {
          args[1] = wrapDescribeInZone(args[1]);
          return originalDescribeFn.apply(this, args);
        };
      };
    }

    function wrapTestFactoryInZone(originalJestFn: Function) {
      return function (this: unknown, ...tableArgs: any[]) {
        return function (this: unknown, ...args: any[]) {
          args[1] = wrapTestInZone(args[1]);
          return originalJestFn.apply(this, tableArgs).apply(this, args);
        };
      };
    }

    /**
     * Gets a function wrapping the body of a jest `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(describeBody: Function): Function {
      return function (this: unknown, ...args: any[]) {
        return syncZone.run(describeBody, this, args);
      };
    }

    /**
     * Gets a function wrapping the body of a jest `it/beforeEach/afterEach` block to
     * execute in a ProxyZone zone.
     * This will run in the `proxyZone`.
     */
    function wrapTestInZone(testBody: Function, isTestFunc = false): Function {
      if (typeof testBody !== 'function') {
        return testBody;
      }
      const wrappedFunc = function () {
        if (
          (Zone as any)[api.symbol('useFakeTimersCalled')] === true &&
          testBody &&
          !(testBody as any).isFakeAsync
        ) {
          // jest.useFakeTimers is called, run into fakeAsyncTest automatically.
          const fakeAsyncModule = (Zone as any)[Zone.__symbol__('fakeAsyncTest')];
          if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
            testBody = fakeAsyncModule.fakeAsync(testBody);
          }
        }
        proxyZoneSpec.isTestFunc = isTestFunc;
        return proxyZone.run(testBody, null, arguments as any);
      };
      // Update the length of wrappedFunc to be the same as the length of the testBody
      // So jest core can handle whether the test function has `done()` or not correctly
      Object.defineProperty(wrappedFunc, 'length', {
        configurable: true,
        writable: true,
        enumerable: false,
      });
      wrappedFunc.length = testBody.length;
      return wrappedFunc;
    }

    ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
      let originalJestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalJestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[1] = wrapDescribeInZone(args[1]);
        return originalJestFn.apply(this, args);
      };
      context[methodName].each = wrapDescribeFactoryInZone((originalJestFn as any).each);
    });
    context.describe.only = context.fdescribe;
    context.describe.skip = context.xdescribe;

    ['it', 'xit', 'fit', 'test', 'xtest'].forEach((methodName) => {
      let originalJestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalJestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[1] = wrapTestInZone(args[1], true);
        return originalJestFn.apply(this, args);
      };
      context[methodName].each = wrapTestFactoryInZone((originalJestFn as any).each);
      context[methodName].todo = (originalJestFn as any).todo;
      context[methodName].failing = (originalJestFn as any).failing;
    });

    context.it.only = context.fit;
    context.it.skip = context.xit;
    context.test.only = context.fit;
    context.test.skip = context.xit;

    ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
      let originalJestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalJestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[0] = wrapTestInZone(args[0]);
        return originalJestFn.apply(this, args);
      };
    });

    (Zone as any).patchJestObject = function patchJestObject(Timer: any, isModern = false) {
      // check whether currently the test is inside fakeAsync()
      function isPatchingFakeTimer() {
        const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
        return !!fakeAsyncZoneSpec;
      }

      // check whether the current function is inside `test/it` or other methods
      // such as `describe/beforeEach`
      function isInTestFunc() {
        const proxyZoneSpec = Zone.current.get('ProxyZoneSpec');
        return proxyZoneSpec && proxyZoneSpec.isTestFunc;
      }

      if (Timer[api.symbol('fakeTimers')]) {
        return;
      }

      Timer[api.symbol('fakeTimers')] = true;
      // patch jest fakeTimer internal method to make sure no console.warn print out
      api.patchMethod(Timer, '_checkFakeTimers', (delegate) => {
        return function (self: any, args: any[]) {
          if (isPatchingFakeTimer()) {
            return true;
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch useFakeTimers(), set useFakeTimersCalled flag, and make test auto run into fakeAsync
      api.patchMethod(Timer, 'useFakeTimers', (delegate) => {
        return function (self: any, args: any[]) {
          (Zone as any)[api.symbol('useFakeTimersCalled')] = true;
          if (isModern || isInTestFunc()) {
            return delegate.apply(self, args);
          }
          return self;
        };
      });

      // patch useRealTimers(), unset useFakeTimers flag
      api.patchMethod(Timer, 'useRealTimers', (delegate) => {
        return function (self: any, args: any[]) {
          (Zone as any)[api.symbol('useFakeTimersCalled')] = false;
          if (isModern || isInTestFunc()) {
            return delegate.apply(self, args);
          }
          return self;
        };
      });

      // patch setSystemTime(), call setCurrentRealTime() in the fakeAsyncTest
      api.patchMethod(Timer, 'setSystemTime', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec && isPatchingFakeTimer()) {
            fakeAsyncZoneSpec.setFakeBaseSystemTime(args[0]);
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch getSystemTime(), call getCurrentRealTime() in the fakeAsyncTest
      api.patchMethod(Timer, 'getRealSystemTime', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec && isPatchingFakeTimer()) {
            return fakeAsyncZoneSpec.getRealSystemTime();
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch runAllTicks(), run all microTasks inside fakeAsync
      api.patchMethod(Timer, 'runAllTicks', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.flushMicrotasks();
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch runAllTimers(), run all macroTasks inside fakeAsync
      api.patchMethod(Timer, 'runAllTimers', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.flush(100, true);
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch advanceTimersByTime(), call tick() in the fakeAsyncTest
      api.patchMethod(Timer, 'advanceTimersByTime', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.tick(args[0]);
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch runOnlyPendingTimers(), call flushOnlyPendingTimers() in the fakeAsyncTest
      api.patchMethod(Timer, 'runOnlyPendingTimers', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.flushOnlyPendingTimers();
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch advanceTimersToNextTimer(), call tickToNext() in the fakeAsyncTest
      api.patchMethod(Timer, 'advanceTimersToNextTimer', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.tickToNext(args[0]);
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch clearAllTimers(), call removeAllTimers() in the fakeAsyncTest
      api.patchMethod(Timer, 'clearAllTimers', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            fakeAsyncZoneSpec.removeAllTimers();
          } else {
            return delegate.apply(self, args);
          }
        };
      });

      // patch getTimerCount(), call getTimerCount() in the fakeAsyncTest
      api.patchMethod(Timer, 'getTimerCount', (delegate) => {
        return function (self: any, args: any[]) {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          if (fakeAsyncZoneSpec) {
            return fakeAsyncZoneSpec.getTimerCount();
          } else {
            return delegate.apply(self, args);
          }
        };
      });
    };
  });
}
