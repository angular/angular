/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

Zone.__load_patch('jest', (context: any, Zone: ZoneType) => {
  if (typeof jest === 'undefined' || jest['__zone_patch__']) {
    return;
  }

  jest['__zone_patch__'] = true;


  if (typeof Zone === 'undefined') {
    throw new Error('Missing Zone.js');
  }

  const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
  const SyncTestZoneSpec = (Zone as any)['SyncTestZoneSpec'];

  if (!ProxyZoneSpec) {
    throw new Error('Missing ProxyZoneSpec');
  }

  const rootZone = Zone.current;
  const syncZone = rootZone.fork(new SyncTestZoneSpec('jest.describe'));
  const proxyZone = rootZone.fork(new ProxyZoneSpec());

  function wrapDescribeFactoryInZone(originalJestFn: Function) {
    return function(this: unknown, ...tableArgs: any[]) {
      const originalDescribeFn = originalJestFn.apply(this, tableArgs);
      return function(this: unknown, ...args: any[]) {
        args[1] = wrapDescribeInZone(args[1]);
        return originalDescribeFn.apply(this, args);
      };
    };
  }

  function wrapTestFactoryInZone(originalJestFn: Function) {
    return function(this: unknown, ...tableArgs: any[]) {
      return function(this: unknown, ...args: any[]) {
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
    return function(this: unknown, ...args: any[]) {
      return syncZone.run(describeBody, this, args);
    };
  }

  /**
   * Gets a function wrapping the body of a jest `it/beforeEach/afterEach` block to
   * execute in a ProxyZone zone.
   * This will run in the `proxyZone`.
   */
  function wrapTestInZone(testBody: Function): Function {
    if (typeof testBody !== 'function') {
      return testBody;
    }
    const wrappedFunc = function() {
      return proxyZone.run(testBody, null, arguments as any);
    };
    // Update the length of wrappedFunc to be the same as the length of the testBody
    // So jest core can handle whether the test function has `done()` or not correctly
    Object.defineProperty(
        wrappedFunc, 'length', {configurable: true, writable: true, enumerable: false});
    wrappedFunc.length = testBody.length;
    return wrappedFunc;
  }

  ['describe', 'xdescribe', 'fdescribe'].forEach(methodName => {
    let originalJestFn: Function = context[methodName];
    if (context[Zone.__symbol__(methodName)]) {
      return;
    }
    context[Zone.__symbol__(methodName)] = originalJestFn;
    context[methodName] = function(this: unknown, ...args: any[]) {
      args[1] = wrapDescribeInZone(args[1]);
      return originalJestFn.apply(this, args);
    };
    context[methodName].each = wrapDescribeFactoryInZone((originalJestFn as any).each);
  });
  context.describe.only = context.fdescribe;
  context.describe.skip = context.xdescribe;

  ['it', 'xit', 'fit', 'test', 'xtest'].forEach(methodName => {
    let originalJestFn: Function = context[methodName];
    if (context[Zone.__symbol__(methodName)]) {
      return;
    }
    context[Zone.__symbol__(methodName)] = originalJestFn;
    context[methodName] = function(this: unknown, ...args: any[]) {
      args[1] = wrapTestInZone(args[1]);
      return originalJestFn.apply(this, args);
    };
    context[methodName].each = wrapTestFactoryInZone((originalJestFn as any).each);
    context[methodName].todo = (originalJestFn as any).todo;
  });

  context.it.only = context.fit;
  context.it.skip = context.xit;
  context.test.only = context.fit;
  context.test.skip = context.xit;

  ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach(methodName => {
    let originalJestFn: Function = context[methodName];
    if (context[Zone.__symbol__(methodName)]) {
      return;
    }
    context[Zone.__symbol__(methodName)] = originalJestFn;
    context[methodName] = function(this: unknown, ...args: any[]) {
      args[0] = wrapTestInZone(args[0]);
      return originalJestFn.apply(this, args);
    };
  });
});
