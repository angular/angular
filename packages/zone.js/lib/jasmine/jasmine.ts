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
declare let jest: unknown;

interface ProxyZoneSpecType extends ZoneSpec {
  resetDelegate(): void;
  getAndClearPendingTasksInfo(): string;
}

interface TestingZoneType extends ZoneType {
  ProxyZoneSpec?: {new (): ProxyZoneSpecType};
  SyncTestZoneSpec?: {new (name: string): ZoneSpec};
  FakeAsyncTestZoneSpec?: {new (): ZoneSpec};
}

interface JasmineClock {
  tick: (...args: unknown[]) => unknown;
  mockDate: (...args: unknown[]) => unknown;
  install: (...args: unknown[]) => unknown;
  uninstall: (...args: unknown[]) => unknown;
  [key: string]: unknown;
}

interface JasmineEnv {
  describe?: Function;
  xdescribe?: Function;
  fdescribe?: Function;
  it?: Function;
  xit?: Function;
  fit?: Function;
  beforeEach?: Function;
  afterEach?: Function;
  beforeAll?: Function;
  afterAll?: Function;
  addReporter?: (reporter: JasmineReporter) => void;
  [key: string]: unknown;
}

interface JasmineReporter {
  specStarted?: (result?: unknown) => void;
  specDone?: (result?: {status?: string; failedExpectations?: {message?: string}[]}) => void;
}

export function patchJasmine(Zone: ZoneType): void {
  Zone.__load_patch('jasmine', (global: Window, Zone: ZoneType, api: _ZonePrivate) => {
    const __extends = function (d: Function, b: Function) {
      for (const p in b) {
        if (Object.hasOwn(b, p)) {
          (d as unknown as Record<string, unknown>)[p] = (b as unknown as Record<string, unknown>)[
            p
          ];
        }
      }
      function __(this: Object) {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new (__ as unknown as {new (): Object})());
    };
    // Patch jasmine's describe/it/beforeEach/afterEach functions so test code always runs
    // in a testZone (ProxyZone). (See: angular/zone.js#91 & angular/angular#10503)
    if (!Zone) throw new Error('Missing: zone.js');
    if (typeof jest !== 'undefined') {
      // return if jasmine is a light implementation inside jest
      // in this case, we are running inside jest not jasmine
      return;
    }
    const jasmineObj = jasmine as unknown as Record<string, unknown>;
    if (typeof jasmine === 'undefined' || jasmineObj['__zone_patch__']) {
      return;
    }
    jasmineObj['__zone_patch__'] = true;

    const testingZone = Zone as TestingZoneType;
    if (!testingZone.SyncTestZoneSpec) throw new Error('Missing: SyncTestZoneSpec');
    if (!testingZone.ProxyZoneSpec) throw new Error('Missing: ProxyZoneSpec');
    const SyncTestZoneSpec = testingZone.SyncTestZoneSpec;
    const ProxyZoneSpec = testingZone.ProxyZoneSpec;

    const ambientZone = Zone.current;

    const symbol = Zone.__symbol__;

    const globalObj = global as unknown as Record<string, unknown>;

    // whether patch jasmine clock when in fakeAsync
    const disablePatchingJasmineClock = globalObj[symbol('fakeAsyncDisablePatchingClock')] === true;
    // the original variable name fakeAsyncPatchLock is not accurate, so the name will be
    // fakeAsyncAutoFakeAsyncWhenClockPatched and if this enablePatchingJasmineClock is false, we
    // also automatically disable the auto jump into fakeAsync feature
    const enableAutoFakeAsyncWhenClockPatched =
      !disablePatchingJasmineClock &&
      (globalObj[symbol('fakeAsyncPatchLock')] === true ||
        globalObj[symbol('fakeAsyncAutoFakeAsyncWhenClockPatched')] === true);

    const jasmineEnv = (jasmineObj['getEnv'] as () => JasmineEnv)();
    const isEnvFrozen = Object.isFrozen(jasmineEnv);
    const proxyZoneSpec = new ProxyZoneSpec();
    const proxyZone = ambientZone.fork(proxyZoneSpec);

    // Monkey patch all of the jasmine DSL so that each function runs in appropriate zone.
    if (!isEnvFrozen) {
      ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
        const originalJasmineFn = jasmineEnv[methodName] as Function;
        jasmineEnv[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
        ) {
          return originalJasmineFn.call(
            this,
            description,
            wrapDescribeInZone(description, specDefinitions),
          );
        };
      });
      ['it', 'xit', 'fit'].forEach((methodName) => {
        const originalJasmineFn = jasmineEnv[methodName] as Function;
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
          timeout?: number,
        ) {
          return originalJasmineFn.call(
            this,
            description,
            wrapTestInZone(specDefinitions),
            timeout,
          );
        };
      });
      ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
        const originalJasmineFn = jasmineEnv[methodName] as Function;
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (
          this: unknown,
          specDefinitions: Function,
          timeout?: number,
        ) {
          return originalJasmineFn.call(this, wrapTestInZone(specDefinitions), timeout);
        };
      });
    } else {
      // Jasmine 7+ has frozen Env, so monkey patch the globals instead.
      const globalFns = global as unknown as Record<string, Function | undefined>;
      ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
        const originalJasmineFn = globalFns[methodName];
        if (typeof originalJasmineFn === 'function') {
          globalFns[symbol(methodName)] = originalJasmineFn;
          globalFns[methodName] = function (
            this: unknown,
            description: string,
            specDefinitions: Function,
          ) {
            return originalJasmineFn.call(
              this,
              description,
              wrapDescribeInZone(description, specDefinitions),
            );
          };
        }
      });
      ['it', 'xit', 'fit'].forEach((methodName) => {
        const originalJasmineFn = globalFns[methodName];
        if (typeof originalJasmineFn === 'function') {
          globalFns[symbol(methodName)] = originalJasmineFn;
          globalFns[methodName] = function (
            this: unknown,
            description: string,
            specDefinitions: Function,
            timeout?: number,
          ) {
            return originalJasmineFn.call(
              this,
              description,
              wrapTestInZone(specDefinitions),
              timeout,
            );
          };
        }
      });
      ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
        const originalJasmineFn = globalFns[methodName];
        if (typeof originalJasmineFn === 'function') {
          globalFns[symbol(methodName)] = originalJasmineFn;
          globalFns[methodName] = function (
            this: unknown,
            specDefinitions: Function,
            timeout?: number,
          ) {
            return originalJasmineFn.call(this, wrapTestInZone(specDefinitions), timeout);
          };
        }
      });

      if (typeof jasmineEnv.addReporter === 'function') {
        jasmineEnv.addReporter({
          specStarted() {
            proxyZoneSpec.resetDelegate();
          },
          specDone(result) {
            proxyZoneSpec.resetDelegate();
            if (result?.status === 'failed') {
              const pendingTasksInfo = proxyZoneSpec.getAndClearPendingTasksInfo();
              if (pendingTasksInfo && result.failedExpectations) {
                for (const failure of result.failedExpectations) {
                  if (failure.message && failure.message.includes('Timeout')) {
                    try {
                      failure.message += pendingTasksInfo;
                    } catch {}
                  }
                }
              }
            }
          },
        });
      }
    }

    if (!disablePatchingJasmineClock) {
      // need to patch jasmine.clock().mockDate and jasmine.clock().tick() so
      // they can work properly in FakeAsyncTest
      const originalClockFn = (jasmineObj[symbol('clock')] = jasmineObj['clock']) as Function;
      let clockProxy: JasmineClock | null = null;
      jasmineObj['clock'] = function (this: unknown, ...args: unknown[]) {
        const clock = originalClockFn.apply(this, args) as JasmineClock;
        if (!clock) return clock;
        if (Object.isFrozen(clock)) {
          if (
            !clockProxy ||
            (clockProxy as unknown as Record<string, unknown>)[symbol('targetClock')] !== clock
          ) {
            clockProxy = createClockProxy(clock);
          }
          return clockProxy;
        }
        if (!clock[symbol('patched')]) {
          clock[symbol('patched')] = symbol('patched');
          const originalTick = (clock[symbol('tick')] = clock.tick) as Function;
          clock.tick = function (this: unknown, ...tickArgs: unknown[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec') as
              {tick: Function} | undefined;
            if (fakeAsyncZoneSpec) {
              return fakeAsyncZoneSpec.tick.apply(fakeAsyncZoneSpec, tickArgs);
            }
            return originalTick.apply(this, tickArgs);
          };
          const originalMockDate = (clock[symbol('mockDate')] = clock.mockDate) as Function;
          clock.mockDate = function (this: unknown, ...mockDateArgs: unknown[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec') as
              {setFakeBaseSystemTime: Function} | undefined;
            if (fakeAsyncZoneSpec) {
              const dateTime =
                mockDateArgs.length > 0 ? (mockDateArgs[0] as Date | undefined) : new Date();
              return fakeAsyncZoneSpec.setFakeBaseSystemTime.apply(
                fakeAsyncZoneSpec,
                dateTime && typeof dateTime.getTime === 'function'
                  ? [dateTime.getTime()]
                  : mockDateArgs,
              );
            }
            return originalMockDate.apply(this, mockDateArgs);
          };
          // for auto go into fakeAsync feature, we need the flag to enable it
          if (enableAutoFakeAsyncWhenClockPatched) {
            ['install', 'uninstall'].forEach((methodName) => {
              const originalMethodFn = (clock[symbol(methodName)] = clock[methodName]) as Function;
              clock[methodName] = function (this: unknown, ...methodArgs: unknown[]) {
                const FakeAsyncTestZoneSpec = testingZone.FakeAsyncTestZoneSpec;
                if (FakeAsyncTestZoneSpec) {
                  jasmineObj[symbol('clockInstalled')] = 'install' === methodName;
                  return;
                }
                return originalMethodFn.apply(this, methodArgs);
              };
            });
          }
        }
        return clock;
      };

      function createClockProxy(clock: JasmineClock): JasmineClock {
        const wrapper: JasmineClock = {
          tick(...tickArgs: unknown[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec') as
              {tick: Function} | undefined;
            if (fakeAsyncZoneSpec) {
              return fakeAsyncZoneSpec.tick.apply(fakeAsyncZoneSpec, tickArgs);
            }
            return clock.tick.apply(clock, tickArgs);
          },
          mockDate(...mockDateArgs: unknown[]) {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec') as
              {setFakeBaseSystemTime: Function} | undefined;
            if (fakeAsyncZoneSpec) {
              const dateTime =
                mockDateArgs.length > 0 ? (mockDateArgs[0] as Date | undefined) : new Date();
              return fakeAsyncZoneSpec.setFakeBaseSystemTime.apply(
                fakeAsyncZoneSpec,
                dateTime && typeof dateTime.getTime === 'function'
                  ? [dateTime.getTime()]
                  : mockDateArgs,
              );
            }
            return clock.mockDate.apply(clock, mockDateArgs);
          },
          install(...installArgs: unknown[]) {
            const FakeAsyncTestZoneSpec = testingZone.FakeAsyncTestZoneSpec;
            if (enableAutoFakeAsyncWhenClockPatched && FakeAsyncTestZoneSpec) {
              jasmineObj[symbol('clockInstalled')] = true;
              return proxy;
            }
            const res = clock.install.apply(clock, installArgs);
            return res === clock ? proxy : res;
          },
          uninstall(...uninstallArgs: unknown[]) {
            const FakeAsyncTestZoneSpec = testingZone.FakeAsyncTestZoneSpec;
            if (enableAutoFakeAsyncWhenClockPatched && FakeAsyncTestZoneSpec) {
              jasmineObj[symbol('clockInstalled')] = false;
              return;
            }
            return clock.uninstall.apply(clock, uninstallArgs);
          },
        };

        const proxy: JasmineClock = new Proxy(wrapper, {
          get(target, prop, receiver) {
            if (prop === symbol('targetClock')) {
              return clock;
            }
            if (prop in target) {
              return (target as unknown as Record<string | symbol, unknown>)[prop];
            }
            const val = (clock as unknown as Record<string | symbol, unknown>)[prop];
            return typeof val === 'function' ? (val as Function).bind(clock) : val;
          },
        });
        return proxy;
      }
    }

    // monkey patch createSpyObj to make properties enumerable to true
    if (!jasmineObj[Zone.__symbol__('createSpyObj')]) {
      const originalCreateSpyObj = jasmine.createSpyObj;
      jasmineObj[Zone.__symbol__('createSpyObj')] = originalCreateSpyObj;
      jasmine.createSpyObj = function (this: unknown, ...args: unknown[]) {
        const propertyNames = args.length >= 3 ? (args[2] as unknown[]) : null;
        let spyObj: unknown;
        if (propertyNames) {
          const defineProperty = Object.defineProperty;
          Object.defineProperty = function <T>(
            obj: T,
            p: PropertyKey,
            attributes: PropertyDescriptor & ThisType<unknown>,
          ) {
            return defineProperty.call(this, obj, p, {
              ...attributes,
              configurable: true,
              enumerable: true,
            }) as T;
          };
          try {
            spyObj = originalCreateSpyObj.apply(
              this,
              args as Parameters<typeof originalCreateSpyObj>,
            );
          } finally {
            Object.defineProperty = defineProperty;
          }
        } else {
          spyObj = originalCreateSpyObj.apply(
            this,
            args as Parameters<typeof originalCreateSpyObj>,
          );
        }
        return spyObj;
      };
    }

    /**
     * Gets a function wrapping the body of a Jasmine `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(description: string, describeBody: Function): Function {
      return function (this: unknown, ...args: unknown[]) {
        // Create a synchronous-only zone in which to run `describe` blocks in order to raise an
        // error if any asynchronous operations are attempted inside of a `describe`.
        const syncZone = ambientZone.fork(new SyncTestZoneSpec(`jasmine.describe#${description}`));
        return syncZone.run(describeBody, this, args);
      };
    }

    function runInTestZone(
      testBody: Function,
      applyThis: unknown,
      queueRunner?: QueueRunner,
      done?: Function,
    ) {
      const isClockInstalled = Boolean(
        globalObj[symbol('clockInstalled')] || jasmineObj[symbol('clockInstalled')],
      );
      const currentTestProxyZone = queueRunner?.testProxyZone ?? proxyZone;
      if (isClockInstalled && enableAutoFakeAsyncWhenClockPatched) {
        // auto run a fakeAsync
        const fakeAsyncModule = (Zone as unknown as Record<string, unknown>)[
          Zone.__symbol__('fakeAsyncTest')
        ] as {fakeAsync?: (fn: Function) => Function} | undefined;
        if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
          testBody = fakeAsyncModule.fakeAsync(testBody);
        }
      }
      if (done) {
        return currentTestProxyZone.run(testBody, applyThis, [done]);
      } else {
        return currentTestProxyZone.run(testBody, applyThis);
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
      if (typeof testBody !== 'function') {
        return testBody;
      }
      const wrappedFunc = testBody.length
        ? function (this: QueueRunnerUserContext, done: Function) {
            return runInTestZone(testBody, this, this?.queueRunner, done);
          }
        : function (this: QueueRunnerUserContext) {
            return runInTestZone(testBody, this, this?.queueRunner);
          };
      Object.defineProperty(wrappedFunc, 'length', {
        value: testBody.length,
        configurable: true,
        writable: true,
        enumerable: false,
      });
      return wrappedFunc;
    }
    interface QueueRunner {
      execute(): void;
      testProxyZoneSpec: ZoneSpec | null;
      testProxyZone: Zone | null;
    }
    interface QueueRunnerAttrs {
      queueableFns: {fn: Function}[];
      clearStack: (fn: unknown) => void;
      catchException: () => boolean;
      fail: () => void;
      onComplete: () => void;
      onException: (error: unknown) => void;
      userContext: QueueRunnerUserContext;
      timeout: {setTimeout: Function; clearTimeout: Function};
    }
    interface QueueRunnerConstructor {
      new (attrs: QueueRunnerAttrs): QueueRunner;
      prototype: QueueRunner;
    }
    type QueueRunnerUserContext = {queueRunner?: QueueRunner};
    const j$ = jasmine as unknown as {
      private?: {
        QueueRunner?: QueueRunnerConstructor;
        UserContext?: new (...args: unknown[]) => QueueRunnerUserContext;
      };
      QueueRunner?: QueueRunnerConstructor;
      UserContext?: new (...args: unknown[]) => QueueRunnerUserContext;
    };
    const privateApis = (j$?.private?.QueueRunner ? j$.private : j$) as
      | {
          QueueRunner?: QueueRunnerConstructor;
          UserContext?: new (...args: unknown[]) => QueueRunnerUserContext;
        }
      | undefined;
    const QueueRunner = privateApis?.QueueRunner;
    if (QueueRunner) {
      privateApis!.QueueRunner = (function (
        _super: QueueRunnerConstructor,
      ): QueueRunnerConstructor {
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

          const nativeSetTimeout = globalObj[Zone.__symbol__('setTimeout')] as Function | undefined;
          const nativeClearTimeout = globalObj[Zone.__symbol__('clearTimeout')] as
            Function | undefined;
          if (nativeSetTimeout) {
            // should run setTimeout inside jasmine outside of zone
            attrs.timeout = {
              setTimeout: nativeSetTimeout ?? global.setTimeout,
              clearTimeout: nativeClearTimeout ?? global.clearTimeout,
            };
          }

          // create a userContext to hold the queueRunner itself
          // so we can access the testProxy in it/xit/beforeEach ...
          if (privateApis?.UserContext) {
            if (!attrs.userContext) {
              attrs.userContext = new privateApis.UserContext();
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
          attrs.onException = function (this: undefined | QueueRunner, error: unknown) {
            const err = error as {message?: string} | undefined;
            if (
              err &&
              err.message ===
                'Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'
            ) {
              // jasmine timeout, we can make the error message more
              // reasonable to tell what tasks are pending
              const proxyZoneSpec =
                this &&
                (this.testProxyZoneSpec as unknown as {getAndClearPendingTasksInfo: () => string});
              if (proxyZoneSpec) {
                const pendingTasksInfo = proxyZoneSpec.getAndClearPendingTasksInfo();
                try {
                  // try catch here in case error.message is not writable
                  err.message += pendingTasksInfo;
                } catch {}
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
        return ZoneQueueRunner as unknown as QueueRunnerConstructor;
      })(QueueRunner);
    }
  });
}
