/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine"/>

import {ZoneType} from '../zone-impl';
import type {ProxyZoneSpec as ProxyZoneSpecType} from '../zone-spec/proxy';

('use strict');
declare let jest: unknown;

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
    if (typeof jasmine === 'undefined') {
      return;
    }
    const symbol = Zone.__symbol__;
    const globalObj = global as unknown as Record<string, unknown>;
    const zoneObj = Zone as unknown as Record<string, unknown>;
    const jasmineObj = jasmine as unknown as Record<string, unknown>;
    if (
      jasmineObj['__zone_patch__'] ||
      globalObj[symbol('jasminePatchInstalled')] ||
      zoneObj[symbol('jasminePatchInstalled')]
    ) {
      return;
    }
    try {
      jasmineObj['__zone_patch__'] = true;
    } catch (_) {}
    globalObj[symbol('jasminePatchInstalled')] = true;
    zoneObj[symbol('jasminePatchInstalled')] = true;

    const SyncTestZoneSpec: {new (name: string): ZoneSpec} = (
      Zone as unknown as {SyncTestZoneSpec: {new (name: string): ZoneSpec}}
    )['SyncTestZoneSpec'];
    const ProxyZoneSpec: {new (): ProxyZoneSpecType} = (
      Zone as unknown as {ProxyZoneSpec: {new (): ProxyZoneSpecType}}
    )['ProxyZoneSpec'];
    if (!SyncTestZoneSpec) throw new Error('Missing: SyncTestZoneSpec');
    if (!ProxyZoneSpec) throw new Error('Missing: ProxyZoneSpec');

    const ambientZone = Zone.current;

    // whether patch jasmine clock when in fakeAsync
    const disablePatchingJasmineClock =
      (global as unknown as Record<string, unknown>)[symbol('fakeAsyncDisablePatchingClock')] ===
      true;
    // the original variable name fakeAsyncPatchLock is not accurate, so the name will be
    // fakeAsyncAutoFakeAsyncWhenClockPatched and if this enablePatchingJasmineClock is false, we
    // also automatically disable the auto jump into fakeAsync feature
    const enableAutoFakeAsyncWhenClockPatched =
      !disablePatchingJasmineClock &&
      ((global as unknown as Record<string, unknown>)[symbol('fakeAsyncPatchLock')] === true ||
        (global as unknown as Record<string, unknown>)[
          symbol('fakeAsyncAutoFakeAsyncWhenClockPatched')
        ] === true);

    const jasmineEnv =
      typeof jasmine.getEnv === 'function'
        ? (jasmine.getEnv() as unknown as Record<string, unknown>)
        : null;
    const isEnvFrozen = !jasmineEnv || Object.isFrozen(jasmineEnv);

    // Monkey patch all of the jasmine DSL so that each function runs in appropriate zone.
    if (!isEnvFrozen && jasmineEnv) {
      ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
        let originalJasmineFn = (jasmineEnv[symbol(methodName)] || jasmineEnv[methodName]) as
          ((description: string, specDefinitions: Function) => unknown) | undefined;
        if (!originalJasmineFn) {
          return;
        }
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
        ) {
          return originalJasmineFn!.call(
            this,
            description,
            wrapDescribeInZone(description, specDefinitions),
          );
        };
      });

      ['it', 'xit', 'fit'].forEach((methodName) => {
        let originalJasmineFn = (jasmineEnv[symbol(methodName)] || jasmineEnv[methodName]) as
          Function | undefined;
        if (!originalJasmineFn) {
          return;
        }
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
          timeout?: number,
        ) {
          if (typeof specDefinitions === 'function') {
            arguments[1] = wrapTestInZone(specDefinitions);
          }
          return originalJasmineFn!.apply(this, arguments);
        };
      });

      ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
        let originalJasmineFn = (jasmineEnv[symbol(methodName)] || jasmineEnv[methodName]) as
          Function | undefined;
        if (!originalJasmineFn) {
          return;
        }
        jasmineEnv[symbol(methodName)] = originalJasmineFn;
        jasmineEnv[methodName] = function (
          this: unknown,
          specDefinitions: Function,
          timeout?: number,
        ) {
          if (typeof specDefinitions === 'function') {
            arguments[0] = wrapTestInZone(specDefinitions);
          }
          return originalJasmineFn!.apply(this, arguments);
        };
      });
    } else {
      ['describe', 'xdescribe', 'fdescribe'].forEach((methodName) => {
        let originalJasmineFn = (globalObj[symbol(methodName)] || globalObj[methodName]) as
          ((description: string, specDefinitions: Function) => unknown) | undefined;
        if (!originalJasmineFn) {
          return;
        }
        globalObj[symbol(methodName)] = originalJasmineFn;
        globalObj[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
        ) {
          return originalJasmineFn!.call(
            this,
            description,
            wrapDescribeInZone(description, specDefinitions),
          );
        };
      });

      ['it', 'xit', 'fit'].forEach((methodName) => {
        let originalJasmineFn = (globalObj[symbol(methodName)] || globalObj[methodName]) as
          Function | undefined;
        if (!originalJasmineFn) {
          return;
        }
        globalObj[symbol(methodName)] = originalJasmineFn;
        globalObj[methodName] = function (
          this: unknown,
          description: string,
          specDefinitions: Function,
          timeout?: number,
        ) {
          if (typeof specDefinitions === 'function') {
            arguments[1] = wrapTestInZone(specDefinitions);
          }
          return originalJasmineFn!.apply(this, arguments);
        };
      });

      ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
        let originalJasmineFn = (globalObj[symbol(methodName)] || globalObj[methodName]) as
          Function | undefined;
        if (!originalJasmineFn) {
          return;
        }
        globalObj[symbol(methodName)] = originalJasmineFn;
        globalObj[methodName] = function (
          this: unknown,
          specDefinitions: Function,
          timeout?: number,
        ) {
          if (typeof specDefinitions === 'function') {
            arguments[0] = wrapTestInZone(specDefinitions);
          }
          return originalJasmineFn!.apply(this, arguments);
        };
      });
    }

    if (!disablePatchingJasmineClock) {
      // need to patch jasmine.clock().mockDate and jasmine.clock().tick() so
      // they can work properly in FakeAsyncTest
      let originalClockFn = (jasmineObj[symbol('clock')] || jasmine.clock) as () => jasmine.Clock;
      jasmineObj[symbol('clock')] = originalClockFn;
      let wrappedClock: Record<string, unknown> | null = null;
      jasmineObj['clock'] = function (this: unknown) {
        const clock = originalClockFn.apply(this, arguments as unknown as []);
        const clockObj = clock as unknown as Record<string, unknown>;
        if (Object.isFrozen(clock)) {
          if (!wrappedClock) {
            wrappedClock = {};
            for (const prop of Object.getOwnPropertyNames(clock)) {
              if (typeof clockObj[prop] === 'function') {
                wrappedClock[prop] = function (this: unknown) {
                  return (clockObj[prop] as Function).apply(clock, arguments);
                };
              } else {
                Object.defineProperty(wrappedClock, prop, {
                  get: () => clockObj[prop],
                  enumerable: true,
                });
              }
            }
            wrappedClock[symbol('patched')] = symbol('patched');
            wrappedClock['tick'] = function () {
              const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
              if (fakeAsyncZoneSpec) {
                return (fakeAsyncZoneSpec as {tick: Function}).tick.apply(
                  fakeAsyncZoneSpec,
                  arguments,
                );
              }
              return (clockObj['tick'] as Function).apply(clock, arguments);
            };
            wrappedClock['mockDate'] = function () {
              const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
              if (fakeAsyncZoneSpec) {
                const dateTime = arguments.length > 0 ? arguments[0] : new Date();
                return (
                  fakeAsyncZoneSpec as {setFakeBaseSystemTime: Function}
                ).setFakeBaseSystemTime.apply(
                  fakeAsyncZoneSpec,
                  dateTime && typeof dateTime.getTime === 'function'
                    ? [dateTime.getTime()]
                    : arguments,
                );
              }
              return (clockObj['mockDate'] as Function).apply(clock, arguments);
            };
            if (enableAutoFakeAsyncWhenClockPatched) {
              ['install', 'uninstall'].forEach((methodName) => {
                wrappedClock![methodName] = function () {
                  const FakeAsyncTestZoneSpec = (Zone as unknown as Record<string, unknown>)[
                    'FakeAsyncTestZoneSpec'
                  ];
                  if (FakeAsyncTestZoneSpec) {
                    jasmineObj[symbol('clockInstalled')] = 'install' === methodName;
                    return;
                  }
                  return (clockObj[methodName] as Function).apply(clock, arguments);
                };
              });
            }
          }
          return wrappedClock as unknown as jasmine.Clock;
        }
        if (!clockObj[symbol('patched')]) {
          clockObj[symbol('patched')] = symbol('patched');
          const originalTick = (clockObj[symbol('tick')] = clock.tick) as Function;
          clock.tick = function () {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              return (fakeAsyncZoneSpec as {tick: Function}).tick.apply(
                fakeAsyncZoneSpec,
                arguments,
              );
            }
            return originalTick.apply(this, arguments);
          };
          const originalMockDate = (clockObj[symbol('mockDate')] = clock.mockDate) as Function;
          clock.mockDate = function () {
            const fakeAsyncZoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
            if (fakeAsyncZoneSpec) {
              const dateTime = arguments.length > 0 ? arguments[0] : new Date();
              return (
                fakeAsyncZoneSpec as {setFakeBaseSystemTime: Function}
              ).setFakeBaseSystemTime.apply(
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
              const originalMethodFn = (clockObj[symbol(methodName)] =
                clockObj[methodName]) as Function;
              clockObj[methodName] = function () {
                const FakeAsyncTestZoneSpec = (Zone as unknown as Record<string, unknown>)[
                  'FakeAsyncTestZoneSpec'
                ];
                if (FakeAsyncTestZoneSpec) {
                  jasmineObj[symbol('clockInstalled')] = 'install' === methodName;
                  return;
                }
                return originalMethodFn.apply(this, arguments);
              };
            });
          }
        }
        return clock;
      };
    }

    // monkey patch createSpyObj to make properties enumerable to true
    if (!jasmineObj[Zone.__symbol__('createSpyObj')]) {
      const originalCreateSpyObj = jasmine.createSpyObj;
      jasmineObj[Zone.__symbol__('createSpyObj')] = originalCreateSpyObj;
      jasmine.createSpyObj = function () {
        const args = Array.prototype.slice.call(arguments);
        const propertyNames = args.length >= 3 ? args[2] : null;
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
            spyObj = (originalCreateSpyObj as Function).apply(this, args);
          } finally {
            Object.defineProperty = defineProperty;
          }
        } else {
          spyObj = (originalCreateSpyObj as Function).apply(this, args);
        }
        return spyObj as jasmine.SpyObj<unknown>;
      };
    }

    /**
     * Gets a function wrapping the body of a Jasmine `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(description: string, describeBody: Function): Function {
      if (typeof describeBody !== 'function') {
        return describeBody;
      }
      return function (this: unknown) {
        // Create a synchronous-only zone in which to run `describe` blocks in order to raise an
        // error if any asynchronous operations are attempted inside of a `describe`.
        const syncZone = ambientZone.fork(new SyncTestZoneSpec(`jasmine.describe#${description}`));
        return syncZone.run(describeBody, this, arguments as unknown as unknown[]);
      };
    }

    const contextMap = new WeakMap<
      object,
      {testZone: Zone; testProxyZoneSpec: ProxyZoneSpecType}
    >();
    let fallbackZoneEntry: {testZone: Zone; testProxyZoneSpec: ProxyZoneSpecType} | null = null;

    function getOrCreateTestZone(ctx: unknown): {
      testZone: Zone;
      testProxyZoneSpec: ProxyZoneSpecType;
    } {
      if (ctx && typeof ctx === 'object') {
        let entry = contextMap.get(ctx);
        if (!entry) {
          const testProxyZoneSpec = new ProxyZoneSpec();
          const testZone = ambientZone.fork(testProxyZoneSpec);
          entry = {testZone, testProxyZoneSpec};
          contextMap.set(ctx, entry);
        }
        return entry;
      }
      if (!fallbackZoneEntry) {
        const testProxyZoneSpec = new ProxyZoneSpec();
        const testZone = ambientZone.fork(testProxyZoneSpec);
        fallbackZoneEntry = {testZone, testProxyZoneSpec};
      }
      return fallbackZoneEntry;
    }

    function runInTestZone(
      testBody: Function,
      applyThis: unknown,
      queueRunner?: QueueRunner,
      done?: Function,
    ) {
      const isClockInstalled = !!jasmineObj[symbol('clockInstalled')];
      let testProxyZone: Zone;
      if (queueRunner && queueRunner.testProxyZone) {
        testProxyZone = queueRunner.testProxyZone;
      } else {
        const entry = getOrCreateTestZone(applyThis);
        testProxyZone = entry.testZone;
      }
      if (isClockInstalled && enableAutoFakeAsyncWhenClockPatched) {
        // auto run a fakeAsync
        const fakeAsyncModule = (Zone as unknown as Record<string, unknown>)[
          Zone.__symbol__('fakeAsyncTest')
        ] as {fakeAsync?: Function} | undefined;
        if (fakeAsyncModule && typeof fakeAsyncModule.fakeAsync === 'function') {
          testBody = fakeAsyncModule.fakeAsync(testBody);
        }
      }
      if (!Zone.currentTask) {
        const task = testProxyZone.scheduleEventTask(
          'jasmine.test',
          testBody,
          undefined,
          () => {},
          () => {},
        );
        if (done) {
          return testProxyZone.runTask(task, applyThis, [done]);
        } else {
          return testProxyZone.runTask(task, applyThis);
        }
      } else {
        if (done) {
          return testProxyZone.run(testBody, applyThis, [done]);
        } else {
          return testProxyZone.run(testBody, applyThis);
        }
      }
    }

    /**
     * Gets a function wrapping the body of a Jasmine `it/beforeEach/afterEach` block to
     * execute in a ProxyZone zone.
     * This will run in `testProxyZone`.
     */
    function wrapTestInZone(testBody: Function): Function {
      if (typeof testBody !== 'function') {
        return testBody;
      }
      // The `done` callback is only passed through if the function expects at least one argument.
      // Note we have to make a function with correct number of arguments, otherwise jasmine will
      // think that all functions are sync or async.
      return testBody.length
        ? function (this: QueueRunnerUserContext, done: Function) {
            return runInTestZone(testBody, this, this?.queueRunner, done);
          }
        : function (this: QueueRunnerUserContext) {
            return runInTestZone(testBody, this, this?.queueRunner);
          };
    }
    interface QueueRunner {
      execute(): void;
      testProxyZoneSpec: ProxyZoneSpecType | null;
      testProxyZone: Zone | null;
    }
    interface QueueRunnerAttrs {
      queueableFns: {fn: Function}[];
      clearStack: (fn: unknown) => void;
      catchException: () => boolean;
      fail: () => void;
      onComplete: () => void;
      onException: (error: Error & {message: string}) => void;
      userContext: QueueRunnerUserContext;
      timeout: {setTimeout: Function; clearTimeout: Function};
    }
    type QueueRunnerUserContext = {queueRunner?: QueueRunner};
    interface QueueRunnerConstructor {
      new (attrs: QueueRunnerAttrs): QueueRunner;
    }
    const j$ = jasmine as unknown as Record<string, unknown> & {
      private?: {
        QueueRunner?: unknown;
        UserContext?: new (...args: unknown[]) => QueueRunnerUserContext;
      };
    };
    const privateApis = (j$?.private?.QueueRunner ? j$?.private : j$) as {
      QueueRunner?: QueueRunnerConstructor;
      UserContext?: new (...args: unknown[]) => QueueRunnerUserContext;
    };
    const QueueRunner = privateApis.QueueRunner;
    if (QueueRunner && !isEnvFrozen) {
      privateApis.QueueRunner = (function (_super: QueueRunnerConstructor) {
        __extends(ZoneQueueRunner, _super);
        function ZoneQueueRunner(this: QueueRunner, attrs: QueueRunnerAttrs) {
          if (attrs.onComplete) {
            attrs.onComplete = ((fn: Function) => () => {
              // All functions are done, clear the test zone.
              this.testProxyZone = null;
              this.testProxyZoneSpec = null;
              ambientZone.scheduleMicroTask('jasmine.onComplete', fn);
            })(attrs.onComplete);
          }

          const nativeSetTimeout = (global as unknown as Record<string, unknown>)[
            Zone.__symbol__('setTimeout')
          ] as Function | undefined;
          const nativeClearTimeout = (global as unknown as Record<string, unknown>)[
            Zone.__symbol__('clearTimeout')
          ] as Function | undefined;
          if (nativeSetTimeout) {
            // should run setTimeout inside jasmine outside of zone
            attrs.timeout = {
              setTimeout: nativeSetTimeout ? nativeSetTimeout : global.setTimeout,
              clearTimeout: nativeClearTimeout ? nativeClearTimeout : global.clearTimeout,
            };
          }

          // create a userContext to hold the queueRunner itself
          // so we can access the testProxy in it/xit/beforeEach ...
          if (privateApis.UserContext) {
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
          attrs.onException = function (
            this: undefined | QueueRunner,
            error: Error & {message: string},
          ) {
            if (
              error &&
              error.message ===
                'Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'
            ) {
              // jasmine timeout, we can make the error message more
              // reasonable to tell what tasks are pending
              const proxyZoneSpec = (this &&
                this.testProxyZoneSpec) as unknown as ProxyZoneSpecType | null;
              if (
                proxyZoneSpec &&
                typeof proxyZoneSpec.getAndClearPendingTasksInfo === 'function'
              ) {
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
        ZoneQueueRunner.prototype.execute = function (this: QueueRunner) {
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
