/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

/**
 * The ZoneType with additional testing related members added.
 * The additional members must be patched onto the type via the
 * `zone.js/testing` package entry point.
 */
interface TestingZoneType extends ZoneType {
  ProxyZoneSpec?: typeof import('../zone-spec/proxy').ProxyZoneSpec;
  SyncTestZoneSpec?: {new (namePrefix: string): ZoneSpec};
}

/**
 * The list of method names for the describe/suite and test/it factories
 * that are called directly (i.e. same signature as describe/it).
 *
 * Example: `describe.skip('...', () => { ... });`
 * Sourced from https://vitest.dev/api/#describe
 */
const DIRECT_MODIFIER_NAMES = [
  'skip',
  'only',
  'concurrent',
  'sequential',
  'shuffle',
  'todo',
] as const;

/**
 * The list of method names for the describe/suite and test/it modifiers
 * that are curried (i.e. called once with a condition/table to get back a chainable fn).
 *
 * Example: `describe.each([...])('...', () => { ... });`
 * Sourced from https://vitest.dev/api/#describe
 */
const CURRIED_MODIFIER_NAMES = ['skipIf', 'runIf', 'each', 'for'] as const;

type TEST_MODIFIER_NAME = (typeof DIRECT_MODIFIER_NAMES | typeof CURRIED_MODIFIER_NAMES)[number];

export function patchVitest(Zone: ZoneType): void {
  Zone.__load_patch('vitest', (context: any, Zone: TestingZoneType) => {
    // Vitest global variable set by the Vitest runner during test execution
    const vitestGlobal = context['vitest'] as {['__zone_patch__']?: boolean} | undefined;

    // Skip patching if vitest is not present or has already been patched
    if (typeof vitestGlobal === 'undefined' || vitestGlobal['__zone_patch__']) {
      return;
    }
    vitestGlobal['__zone_patch__'] = true;

    // Ensure other testing related Zone.js patches have been applied
    if (!Zone.ProxyZoneSpec) {
      throw new Error('Missing ProxyZoneSpec');
    }
    if (!Zone.SyncTestZoneSpec) {
      throw new Error('Missing SyncTestZoneSpec');
    }

    // Setup testing related Zone instances
    const rootZone = Zone.current;
    const syncZone = rootZone.fork(new Zone.SyncTestZoneSpec('vitest.describe'));
    const proxyZone = rootZone.fork(new Zone.ProxyZoneSpec());

    /**
     * Gets a function wrapping the body of a vitest `describe` block to execute in a
     * synchronous-only zone.
     */
    function wrapDescribeInZone(describeBody: Function): Function {
      // `describe` might be called without a body (e.g. `describe.todo`)
      if (typeof describeBody !== 'function') {
        return describeBody;
      }
      return function (this: unknown, ...args: unknown[]) {
        return syncZone.run(describeBody, this, args);
      };
    }

    /**
     * Gets a function wrapping the body of a vitest `it/beforeEach/afterEach` block to
     * execute in a ProxyZone zone.
     * This will run in the `proxyZone`.
     */
    function wrapTestInZone(testBody: Function): Function {
      if (typeof testBody !== 'function') {
        return testBody;
      }
      const wrappedFunc = function () {
        return proxyZone.run(testBody, null, arguments as any);
      };
      // Update the length of wrappedFunc to be the same as the length of the testBody
      // So vitest core can handle whether the test function has `done()` or not correctly
      Object.defineProperty(wrappedFunc, 'length', {
        configurable: true,
        writable: true,
        enumerable: false,
      });
      wrappedFunc.length = testBody.length;
      return wrappedFunc;
    }

    /** Patch functions with modifiers (i.e. `describe`/`it`). */
    function patchFnWithModifiers(methodName: string, wrapFn: (fn: Function) => Function) {
      const originalVitestFn: Function & Record<TEST_MODIFIER_NAME, Function> = context[methodName];
      // Skip if already patched
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }
      context[Zone.__symbol__(methodName)] = originalVitestFn;

      // Patching the main function
      context[methodName] = function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
        args[1] = wrapFn(args[1]);
        return originalVitestFn.apply(this, args);
      };

      // Patching direct modifier calls
      for (const modifierName of DIRECT_MODIFIER_NAMES) {
        context[methodName][modifierName] = function (
          this: unknown,
          ...args: [unknown, Function, ...unknown[]]
        ) {
          args[1] = wrapFn(args[1]);
          return originalVitestFn[modifierName].apply(this, args);
        };
      }

      // Patching curried modifier calls
      for (const modifierName of CURRIED_MODIFIER_NAMES) {
        context[methodName][modifierName] = function (this: unknown, ...modifierArgs: unknown[]) {
          // Since we are patching a curried function, we need
          // to pass the original context first (`originalVitestFn`).
          // Else, the chaining won't be possible (will get an error).
          const originalFn = originalVitestFn[modifierName].apply(originalVitestFn, modifierArgs);

          return function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
            args[1] = wrapFn(args[1]);
            return originalFn.apply(this, args);
          };
        };
      }
    }

    ['suite', 'describe'].forEach((methodName) =>
      patchFnWithModifiers(methodName, wrapDescribeInZone),
    );

    ['it', 'test'].forEach((methodName) => patchFnWithModifiers(methodName, wrapTestInZone));

    ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach((methodName) => {
      const originalVitestFn: Function = context[methodName];
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }

      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: [Function, ...unknown[]]) {
        args[0] = wrapTestInZone(args[0]);
        return originalVitestFn.apply(this, args);
      };
    });
  });
}
