/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine"/>

import {ZoneType} from '../zone-impl';

('use strict');
declare let jest: any;

export function patchJasmine(Zone: ZoneType): void {
  Zone.__load_patch('jasmine', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    const __extends = function (d: any, b: any) {
      for (const p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      function __(this: Object) {
        this.constructor = d;
      }
      d.prototype =
        b === null ? Object.create(b) : ((__.prototype = b.prototype), new (__ as any)());
    };
    // Patch jasmine's describe/it/beforeEach/afterEach functions so test code always runs
    // in a testZone (ProxyZone). (See: angular/zone.js#91 & angular/angular#10503)
    if (!Zone) throw new Error('Missing: zone.js');
    if (typeof jest !== 'undefined') {
      // return if jasmine is a light implementation inside jest
      // in this case, we are running inside jest not jasmine
      return;
    }
    if (typeof jasmine == 'undefined' || (jasmine as any)['__zone_patch__']) {
      return;
    }
    (jasmine as any)['__zone_patch__'] = true;

    const SyncTestZoneSpec: {new (name: string): ZoneSpec} = (Zone as any)['SyncTestZoneSpec'];
    const ProxyZoneSpec: {new (): ZoneSpec} = (Zone as any)['ProxyZoneSpec'];
    if (!SyncTestZoneSpec) throw new Error('Missing: SyncTestZoneSpec');
    if (!ProxyZoneSpec) throw new Error('Missing: ProxyZoneSpec');

    const ambientZone = Zone.current;

    const symbol = Zone.__symbol__;

    // whether patch jasmine clock when in fakeAsync
    const disablePatchingJasmineClock = global[symbol('fakeAsyncDisablePatchingClock')] === true;
    // the original variable name fakeAsyncPatchLock is not accurate, so the name will be
    // fakeAsyncAutoFakeAsyncWhenClockPatched and if this enablePatchingJasmineClock is false, we
    // also automatically disable the auto jump into fakeAsync feature
    const enableAutoFakeAsyncWhenClockPatched =
      !disablePatchingJasmineClock &&
      (global[symbol('fakeAsyncPatchLock')] === true ||
        global[symbol('fakeAsyncAutoFakeAsyncWhenClockPatched')] === true);

    const ignoreUnhandledRejection = global[symbol('ignoreUnhandledRejection')] === true;

    if (!ignoreUnhandledRejection) {
      const globalErrors = (jasmine as any).GlobalErrors;
      if (globalErrors && !(jasmine as any)[symbol('GlobalErrors')]) {
        (jasmine as any)[symbol('GlobalErrors')] = globalErrors;
        (jasmine as any).GlobalErrors = function () {
          const instance = new globalErrors();
          const originalInstall = instance.install;
          if (originalInstall && !instance[symbol('install')]) {
            instance[symbol('install')] = originalInstall;
            instance.install = function () {
              const isNode = typeof process !== 'undefined' && !!process.on;
              // Note: Jasmine checks internally if `process` and `process.on` is defined.
              // Otherwise, it installs the browser rejection handler through the
              // `global.addEventListener`. This code may be run in the browser environment where
              // `process` is not defined, and this will lead to a runtime exception since webpack 5
              // removed automatic Node.js polyfills. Note, that events are named differently, it's
              // `unhandledRejection` in Node.js and `unhandledrejection` in the browser.
              const originalHandlers: any[] = isNode
                ? process.listeners('unhandledRejection')
                : global.eventListeners('unhandledrejection');
              const result = originalInstall.apply(this, arguments);
              isNode
                ? process.removeAllListeners('unhandledRejection')
                : global.removeAllListeners('unhandledrejection');
              if (originalHandlers) {
                originalHandlers.forEach((handler) => {
                  if (isNode) {
                    process.on('unhandledRejection', handler);
                  } else {
                    global.addEventListener('unhandledrejection', handler);
                  }
                });
              }
              return result;
            };
          }
          return instance;
        };
      }
    }

    // Monkey patch all of the jasmine DSL so that each function runs in appropriate zone.
    const jasmineEnv: any = jasmine.getEnv();
    ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
      let originalJasmineFn: Function = jasmineEnv[methodName];
      jasmineEnv[methodName] = function (description: string, specDefinitions: Function) {
        return originalJasmineFn.call(
          this,
          description,
          wrapDescribeInZone(description, specDefinitions),
        );
      };
    });
    ['it', 'xit', 'fit'].forEach((methodName) => {
      let originalJasmineFn: Function = jasmineEnv[methodName];
      jasmineEnv[symbol(methodName)] = originalJasmineFn;
      jasmineEnv[methodName] = function (
        description: string,
        specDefinitions: Function,
        timeout: number,
      ) {
        arguments[1] = wrapTestInZone(specDefinitions);
        return originalJasmineFn.apply(this, arguments);
      };
    });
    ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
      let originalJasmineFn: Function = jasmineEnv[methodName];
      jasmineEnv[symbol(methodName)] = originalJasmineFn;
      jasmineEnv[methodName] = function (specDefinitions: Function, timeout: number) {
        arguments[0] = wrapTestInZone(specDefinitions);
        return originalJasmineFn.apply(this, arguments);
      };
    });

    if (!disablePatchingJasmineClock) {
      // need to patch jasmine.clock().mockDate and jasmine.clock().tick() so
      // they can work properly in FakeAsyncTest
      const originalClockFn: Function = ((jasmine as any)[symbol('clock')] = jasmine['clock']);
      (jasmine as any)['clock'] = function () {
        const clock = originalClockFn.apply(this, arguments);
        if (!clock[symbol('patched')]) {
          clock[symbol('patched')] = symbol('patched');
          const originalTick = (clock[symbol('tick')] = clock.tick);
          clock.tick = function () {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              return fakeAsyncZoneSpec.tick.apply(fakeAsyncZoneSpec, arguments);
            }
            return originalTick.apply(this, arguments);
          };
          const originalMockDate = (clock[symbol('mockDate')] = clock.mockDate);
          clock.mockDate = function () {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              const dateTime = arguments.length > 0 ? arguments[0] : new Date();
              return fakeAsyncZoneSpec.setFakeBaseSystemTime.apply(
                fakeAsyncZoneSpec,
                dateTime && typeof dateTime.getTime === 'function'
                  ? [dateTime.getTime()]
                  : arguments,
              );
            }
            return originalMockDate.apply(this, arguments);
          };
          // for auto go into fakeAsync feature, we need the flag to enable it
          if (enableAutoFakeAsyncWhenClockPatched) {
            ['install', 'uninstall'].forEach((methodName) => {
              const originalClockFn: Function = (clock[symbol(methodName)] = clock[methodName]);
              clock[methodName] = function () {
                const FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
                if (FakeAsyncTestZoneSpec) {
                  (jasmine as any)[symbol('clockInstalled')] = 'install' === methodName;
                  return;
                }
                return originalClockFn.apply(this, arguments);
              };
            });
          }
        }
        return clock;
      };
    }

    // monkey patch createSpyObj to make properties enumerable to true
    if (!(jasmine as any)[Zone.__symbol__('createSpyObj')]) {
      const originalCreateSpyObj = jasmine.createSpyObj;
      (jasmine as any)[Zone.__symbol__('createSpyObj')] = originalCreateSpyObj;
      jasmine.createSpyObj = function () {
        const args: any = Array.prototype.slice.call(arguments);
        const propertyNames = args.length >= 3 ? args[2] : null;
        let spyObj: any;
        if (propertyNames) {
          const defineProperty = Object.defineProperty;
          Object.defineProperty = function <T>(obj: T, p: PropertyKey, attributes: any) {
            return defineProperty.call(this, obj, p, {
              ...attributes,
              configurable: true,
              enumerable: true,
            }) as T;
          };
          try {
            spyObj = originalCreateSpyObj.apply(this, args);
          } finally {
            Object.defineProperty = defineProperty;
          }
        } else {
          spyObj = originalCreateSpyObj.apply(this, args);
        }
        return spyObj;
      };
    }

    /**
     * Gets a function wrapping the body of a Jasmine `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(description: string, describeBody: Function): Function {
      return function (this: unknown) {
        // Create a synchronous-only zone in which to run `describe` blocks in order to raise an
        // error if any asynchronous operations are attempted inside of a `describe`.
        const syncZone = ambientZone.fork(new SyncTestZoneSpec(`jasmine.describe#${description}`));
        return syncZone.run(describeBody, this, arguments as any as any[]);
      };
    }

    function runInTestZone(
      testBody: Function,
      applyThis: any,
      queueRunner: QueueRunner,
      done?: Function,
    ) {
      const isClockInstalled = !!(jasmine as any)[symbol('clockInstalled')];
      const testProxyZoneSpec = queueRunner.testProxyZoneSpec!;
      const testProxyZone = queueRunner.testProxyZone!;
      let lastDelegate;
      if (isClockInstalled && enableAutoFakeAsyncWhenClockPatched) {
        // auto run a fakeAsync
        const fakeAsyncModule = (Zone as any)[Zone.__symbol__('fakeAsyncTest')];
        if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
          testBody = fakeAsyncModule.fakeAsync(testBody);
        }
      }
      if (done) {
        return testProxyZone.run(testBody, applyThis, [done]);
      } else {
        return testProxyZone.run(testBody, applyThis);
      }
    }

    /**
     * Gets a function wrapping the body of a Jasmine `it/beforeEach/afterEach` block to
     * execute in a ProxyZone zone.
     * This will run in `testProxyZone`. The `testProxyZone` will be reset by the `ZoneQueueRunner`
     */
    function wrapTestInZone(testBody: Function): Function {
      // The `done` callback is only passed through if the function expects at least one argument.
      // Note we have to make a function with correct number of arguments, otherwise jasmine will
      // think that all functions are sync or async.
      return (
        testBody &&
        (testBody.length
          ? function (this: QueueRunnerUserContext, done: Function) {
              return runInTestZone(testBody, this, this.queueRunner!, done);
            }
          : function (this: QueueRunnerUserContext) {
              return runInTestZone(testBody, this, this.queueRunner!);
            })
      );
    }
    interface QueueRunner {
      execute(): void;
      testProxyZoneSpec: ZoneSpec | null;
      testProxyZone: Zone | null;
    }
    interface QueueRunnerAttrs {
      queueableFns: {fn: Function}[];
      clearStack: (fn: any) => void;
      catchException: () => boolean;
      fail: () => void;
      onComplete: () => void;
      onException: (error: any) => void;
      userContext: QueueRunnerUserContext;
      timeout: {setTimeout: Function; clearTimeout: Function};
    }
    type QueueRunnerUserContext = {queueRunner?: QueueRunner};
    const QueueRunner = (jasmine as any).QueueRunner as {
      new (attrs: QueueRunnerAttrs): QueueRunner;
    };
    (jasmine as any).QueueRunner = (function (_super) {
      __extends(ZoneQueueRunner, _super);
      function ZoneQueueRunner(this: QueueRunner, attrs: QueueRunnerAttrs) {
        if (attrs.onComplete) {
          attrs.onComplete = ((fn) => () => {
            // All functions are done, clear the test zone.
            this.testProxyZone = null;
            this.testProxyZoneSpec = null;
            ambientZone.scheduleMicroTask('jasmine.onComplete', fn);
          })(attrs.onComplete);
        }

        const nativeSetTimeout = global[Zone.__symbol__('setTimeout')];
        const nativeClearTimeout = global[Zone.__symbol__('clearTimeout')];
        if (nativeSetTimeout) {
          // should run setTimeout inside jasmine outside of zone
          attrs.timeout = {
            setTimeout: nativeSetTimeout ? nativeSetTimeout : global.setTimeout,
            clearTimeout: nativeClearTimeout ? nativeClearTimeout : global.clearTimeout,
          };
        }

        // create a userContext to hold the queueRunner itself
        // so we can access the testProxy in it/xit/beforeEach ...
        if ((jasmine as any).UserContext) {
          if (!attrs.userContext) {
            attrs.userContext = new (jasmine as any).UserContext();
          }
          attrs.userContext.queueRunner = this;
        } else {
          if (!attrs.userContext) {
            attrs.userContext = {};
          }
          attrs.userContext.queueRunner = this;
        }

        // patch attrs.onException
        const onException = attrs.onException;
        attrs.onException = function (this: undefined | QueueRunner, error: any) {
          if (
            error &&
            error.message ===
              'Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'
          ) {
            // jasmine timeout, we can make the error message more
            // reasonable to tell what tasks are pending
            const proxyZoneSpec: any = this && this.testProxyZoneSpec;
            if (proxyZoneSpec) {
              const pendingTasksInfo = proxyZoneSpec.getAndClearPendingTasksInfo();
              try {
                // try catch here in case error.message is not writable
                error.message += pendingTasksInfo;
              } catch (err) {}
            }
          }
          if (onException) {
            onException.call(this, error);
          }
        };

        _super.call(this, attrs);
      }
      ZoneQueueRunner.prototype.execute = function () {
        let zone: Zone | null = Zone.current;
        let isChildOfAmbientZone = false;
        while (zone) {
          if (zone === ambientZone) {
            isChildOfAmbientZone = true;
            break;
          }
          zone = zone.parent;
        }

        if (!isChildOfAmbientZone) throw new Error('Unexpected Zone: ' + Zone.current.name);

        // This is the zone which will be used for running individual tests.
        // It will be a proxy zone, so that the tests function can retroactively install
        // different zones.
        // Example:
        //   - In beforeEach() do childZone = Zone.current.fork(...);
        //   - In it() try to do fakeAsync(). The issue is that because the beforeEach forked the
        //     zone outside of fakeAsync it will be able to escape the fakeAsync rules.
        //   - Because ProxyZone is parent fo `childZone` fakeAsync can retroactively add
        //     fakeAsync behavior to the childZone.

        this.testProxyZoneSpec = new ProxyZoneSpec();
        this.testProxyZone = ambientZone.fork(this.testProxyZoneSpec);
        if (!Zone.currentTask) {
          // if we are not running in a task then if someone would register a
          // element.addEventListener and then calling element.click() the
          // addEventListener callback would think that it is the top most task and would
          // drain the microtask queue on element.click() which would be incorrect.
          // For this reason we always force a task when running jasmine tests.
          Zone.current.scheduleMicroTask('jasmine.execute().forceTask', () =>
            QueueRunner.prototype.execute.call(this),
          );
        } else {
          _super.prototype.execute.call(this);
        }
      };
      return ZoneQueueRunner;
    })(QueueRunner);
  });
}
