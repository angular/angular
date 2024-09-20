/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Extra Mocha-specific typings to make sure typescript compiler is happy
// Didn't want to add @types/mocha because of duplication in typings-file with @types/jasmine
declare function suite(description: string, suiteFn: () => void): void;
declare function test(description: string, testFn: () => void): void;
declare function specify(description: string, testFn: () => void): void;
declare function setup(fn: () => void): void;
declare function teardown(fn: () => void): void;
declare function suiteSetup(fn: () => void): void;
declare function suiteTeardown(fn: () => void): void;
declare function before(fn: () => void): void;
declare function after(fn: () => void): void;
//

import {ifEnvSupports} from './test-util';

ifEnvSupports('Mocha', function () {
  describe('Mocha BDD-style', () => {
    let throwOnAsync = false;
    let beforeEachZone: Zone | null = null;
    let itZone: Zone | null = null;
    const syncZone = Zone.current;
    let beforeZone: Zone | null = null;

    before(() => {
      beforeZone = Zone.current;
    });

    try {
      Zone.current.scheduleMicroTask('dontallow', (): any => null);
    } catch (e) {
      throwOnAsync = true;
    }

    beforeEach(() => (beforeEachZone = Zone.current));

    it('should throw on async in describe', () => {
      expect(Zone.currentTask).toBeTruthy();
      expect(throwOnAsync).toBe(true);
      expect(syncZone.name).toEqual('syncTestZone for Mocha.describe');
      itZone = Zone.current;
    });

    afterEach(() => {
      let zone = Zone.current;
      expect(zone.name).toEqual('ProxyZone');
      expect(beforeEachZone).toBe(zone);
      expect(itZone).toBe(zone);
    });

    after(() => {
      expect(beforeZone).toBe(Zone.current);
    });
  });

  (describe as any).skip('skip describe', () => {
    test('test', () => {
      fail('should not be here');
    });
  });

  suite('Mocha TDD-style', () => {
    let testZone: Zone | null = null;
    let beforeEachZone: Zone | null = null;
    let suiteSetupZone: Zone | null = null;

    suiteSetup(() => {
      suiteSetupZone = Zone.current;
    });

    setup(() => {
      beforeEachZone = Zone.current;
    });

    test('should run in Zone with "test"-syntax in TDD-mode', () => {
      testZone = Zone.current;
      expect(Zone.currentTask).toBeTruthy();
      expect(testZone.name).toEqual('ProxyZone');
    });

    specify('test should run in Zone with "specify"-syntax in TDD-mode', () => {
      testZone = Zone.current;
      expect(Zone.currentTask).toBeTruthy();
      expect(testZone.name).toEqual('ProxyZone');
    });

    teardown(() => {
      expect(Zone.current.name).toEqual('ProxyZone');
      expect(beforeEachZone).toBe(Zone.current);
      expect(testZone).toBe(Zone.current);
    });

    suiteTeardown(() => {
      expect(suiteSetupZone).toBe(Zone.current);
    });

    (it as any).skip('test skip', () => {
      fail('should not be here');
    });
  });

  describe('return promise', () => {
    let log: string[];
    beforeEach(() => {
      log = [];
    });

    it('should wait for promise to resolve', () => {
      return new Promise<void>((res, _) => {
        setTimeout(() => {
          log.push('resolved');
          res();
        }, 100);
      });
    });

    afterEach(() => {
      expect(log).toEqual(['resolved']);
    });
  });
})();
