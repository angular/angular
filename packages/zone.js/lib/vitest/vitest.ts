import {ZoneType} from '../zone-impl';

('use strict');
declare let vi: any;

export function patchVitest(Zone: ZoneType): void {
  Zone.__load_patch('vitest', (context: any, Zone: ZoneType, api: _ZonePrivate) => {
    if (typeof globalThis === 'undefined') {
      return;
    }

    const vitestGlobals = [
      'describe',
      'it',
      'test',
      'beforeEach',
      'afterEach',
      'beforeAll',
      'afterAll',
    ];
    const hasVitest = vitestGlobals.some((name) => typeof (globalThis as any)[name] === 'function');

    if (!hasVitest || (context as any)['__zone_patch__vitest']) {
      return;
    }

    (context as any)['__zone_patch__vitest'] = true;

    const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
    const SyncTestZoneSpec = (Zone as any)['SyncTestZoneSpec'];

    if (!ProxyZoneSpec) {
      throw new Error('Missing ProxyZoneSpec');
    }

    const rootZone = Zone.current;
    const syncZone = rootZone.fork(new SyncTestZoneSpec('vitest.describe'));
    const proxyZoneSpec = new ProxyZoneSpec();
    const proxyZone = rootZone.fork(proxyZoneSpec);

    function wrapDescribeFactoryInZone(originalVitestFn: Function) {
      return function (this: unknown, ...tableArgs: any[]) {
        const originalDescribeFn = originalVitestFn.apply(this, tableArgs);
        return function (this: unknown, ...args: any[]) {
          args[1] = wrapDescribeInZone(args[1]);
          return originalDescribeFn.apply(this, args);
        };
      };
    }

    function wrapTestFactoryInZone(originalVitestFn: Function) {
      return function (this: unknown, ...tableArgs: any[]) {
        return function (this: unknown, ...args: any[]) {
          args[1] = wrapTestInZone(args[1]);
          return originalVitestFn.apply(this, tableArgs).apply(this, args);
        };
      };
    }

    function wrapDescribeInZone(describeBody: Function): Function {
      return function (this: unknown, ...args: any[]) {
        return syncZone.run(describeBody, this, args);
      };
    }

    function wrapTestInZone(testBody: Function, isTestFunc = false): Function {
      if (typeof testBody !== 'function') {
        return testBody;
      }
      const wrappedFunc = function () {
        if (
          typeof vi !== 'undefined' &&
          (Zone as any)[api.symbol('useFakeTimersCalled')] === true &&
          testBody &&
          !(testBody as any).isFakeAsync
        ) {
          const fakeAsyncModule = (Zone as any)[Zone.__symbol__('fakeAsyncTest')];
          if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
            testBody = fakeAsyncModule.fakeAsync(testBody);
          }
        }
        proxyZoneSpec.isTestFunc = isTestFunc;
        return proxyZone.run(testBody, null, arguments as any);
      };
      Object.defineProperty(wrappedFunc, 'length', {
        configurable: true,
        writable: true,
        enumerable: false,
      });
      wrappedFunc.length = testBody.length;
      return wrappedFunc;
    }

    ['describe'].forEach((methodName) => {
      let originalVitestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[1] = wrapDescribeInZone(args[1]);
        return originalVitestFn.apply(this, args);
      };
      if ((originalVitestFn as any).each) {
        context[methodName].each = wrapDescribeFactoryInZone((originalVitestFn as any).each);
      }
      context[methodName].only = context[methodName].only
        ? (function (originalOnly: Function) {
            const wrapped = function (this: unknown, ...args: any[]) {
              args[1] = wrapDescribeInZone(args[1]);
              return originalOnly.apply(this, args);
            };
            wrapped.each = wrapDescribeFactoryInZone((originalOnly as any).each);
            return wrapped;
          })((originalVitestFn as any).only)
        : undefined;
      context[methodName].skip = context[methodName].skip
        ? (function (originalSkip: Function) {
            const wrapped = function (this: unknown, ...args: any[]) {
              args[1] = wrapDescribeInZone(args[1]);
              return originalSkip.apply(this, args);
            };
            wrapped.each = wrapDescribeFactoryInZone((originalSkip as any).each);
            return wrapped;
          })((originalVitestFn as any).skip)
        : undefined;
      context[methodName].todo = (originalVitestFn as any).todo;
      context[methodName].skipIf = (originalVitestFn as any).skipIf;
      context[methodName].runIf = (originalVitestFn as any).runIf;
    });

    ['it', 'test'].forEach((methodName) => {
      let originalVitestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[1] = wrapTestInZone(args[1], true);
        return originalVitestFn.apply(this, args);
      };
      if ((originalVitestFn as any).each) {
        context[methodName].each = wrapTestFactoryInZone((originalVitestFn as any).each);
      }
      context[methodName].only = context[methodName].only
        ? (function (originalOnly: Function) {
            const wrapped = function (this: unknown, ...args: any[]) {
              args[1] = wrapTestInZone(args[1], true);
              return originalOnly.apply(this, args);
            };
            wrapped.each = wrapTestFactoryInZone((originalOnly as any).each);
            return wrapped;
          })((originalVitestFn as any).only)
        : undefined;
      context[methodName].skip = context[methodName].skip
        ? (function (originalSkip: Function) {
            const wrapped = function (this: unknown, ...args: any[]) {
              args[1] = wrapTestInZone(args[1], true);
              return originalSkip.apply(this, args);
            };
            wrapped.each = wrapTestFactoryInZone((originalSkip as any).each);
            return wrapped;
          })((originalVitestFn as any).skip)
        : undefined;
      context[methodName].todo = (originalVitestFn as any).todo;
      context[methodName].skipIf = (originalVitestFn as any).skipIf;
      context[methodName].runIf = (originalVitestFn as any).runIf;
      context[methodName].fails = (originalVitestFn as any).fails;
      context[methodName].concurrent = (originalVitestFn as any).concurrent;
    });

    ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
      let originalVitestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: any[]) {
        args[0] = wrapTestInZone(args[0]);
        return originalVitestFn.apply(this, args);
      };
    });

    if (typeof vi !== 'undefined') {
      (Zone as any).patchVitestObject = function patchVitestObject(VitestUtils: any) {
        function isPatchingFakeTimer() {
          const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
          return !!fakeAsyncZoneSpec;
        }

        function isInTestFunc() {
          const proxyZoneSpec = Zone.current.get('ProxyZoneSpec');
          return proxyZoneSpec && proxyZoneSpec.isTestFunc;
        }

        if (VitestUtils[api.symbol('fakeTimers')]) {
          return;
        }

        VitestUtils[api.symbol('fakeTimers')] = true;

        api.patchMethod(VitestUtils, 'useFakeTimers', (delegate) => {
          return function (self: any, args: any[]) {
            (Zone as any)[api.symbol('useFakeTimersCalled')] = true;
            if (isInTestFunc()) {
              return delegate.apply(self, args);
            }
            return self;
          };
        });

        api.patchMethod(VitestUtils, 'useRealTimers', (delegate) => {
          return function (self: any, args: any[]) {
            (Zone as any)[api.symbol('useFakeTimersCalled')] = false;
            if (isInTestFunc()) {
              return delegate.apply(self, args);
            }
            return self;
          };
        });

        api.patchMethod(VitestUtils, 'setSystemTime', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec && isPatchingFakeTimer()) {
              fakeAsyncZoneSpec.setFakeBaseSystemTime(args[0]);
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'getRealSystemTime', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec && isPatchingFakeTimer()) {
              return fakeAsyncZoneSpec.getRealSystemTime();
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'runAllTicks', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.flushMicrotasks();
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'runAllTimers', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.flush(100, true);
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'advanceTimersByTime', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.tick(args[0]);
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'runOnlyPendingTimers', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.flushOnlyPendingTimers();
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'advanceTimersToNextTimer', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.tickToNext(args[0]);
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'clearAllTimers', (delegate) => {
          return function (self: any, args: any[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              fakeAsyncZoneSpec.removeAllTimers();
            } else {
              return delegate.apply(self, args);
            }
          };
        });

        api.patchMethod(VitestUtils, 'getTimerCount', (delegate) => {
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
    }
  });
}
