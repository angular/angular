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
 * The list of method names for the describe/suite factories.
 * Example: `describe.skip('...', () => { ... });`
 * Sourced from https://vitest.dev/api/#describe
 */
const DESCRIBE_FACTORY_NAMES = [
  'skip',
  'skipIf',
  'runIf',
  'only',
  'concurrent',
  'sequential',
  'shuffle',
  'todo',
  'each',
  'for',
] as const;

/**
 * The list of method names for the test/it factories.
 * Example: `test.skip('...', () => { ... });`
 * Sourced from https://vitest.dev/api/#test
 */
const TEST_FACTORY_NAMES = [
  'skip',
  'skipIf',
  'runIf',
  'only',
  'concurrent',
  'sequential',
  'shuffle',
  'todo',
  'each',
  'for',
] as const;

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

    ['suite', 'describe'].forEach((methodName) => {
      let originalVitestFn: Function & Record<(typeof DESCRIBE_FACTORY_NAMES)[number], Function> =
        context[methodName];
      // Skip if already patched
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }

      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
        args[1] = wrapDescribeInZone(args[1]);
        return originalVitestFn.apply(this, args);
      };

      for (const factoryName of DESCRIBE_FACTORY_NAMES) {
        context[methodName][factoryName] = function (this: unknown, ...factoryArgs: unknown[]) {
          const originalDescribeFn = originalVitestFn.apply(this, factoryArgs);
          return function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
            args[1] = wrapDescribeInZone(args[1]);
            return originalDescribeFn.apply(this, args);
          };
        };
      }
    });

    ['it', 'test'].forEach((methodName) => {
      let originalVitestFn: Function & Record<(typeof TEST_FACTORY_NAMES)[number], Function> =
        context[methodName];
      // Skip if already patched
      if (context[Zone.__symbol__(methodName)]) {
        return;
      }

      context[Zone.__symbol__(methodName)] = originalVitestFn;
      context[methodName] = function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
        args[1] = wrapTestInZone(args[1]);
        return originalVitestFn.apply(this, args);
      };

      for (const factoryName of TEST_FACTORY_NAMES) {
        context[methodName][factoryName] = function (this: unknown, ...factoryArgs: unknown[]) {
          return function (this: unknown, ...args: [unknown, Function, ...unknown[]]) {
            args[1] = wrapTestInZone(args[1]);
            return originalVitestFn.apply(this, factoryArgs).apply(this, args);
          };
        };
      }
    });

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
