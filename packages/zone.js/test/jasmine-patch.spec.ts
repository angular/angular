/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from './test-util';

function supportJasmineSpec() {
  return jasmine && (jasmine as any)['Spec'];
}

(supportJasmineSpec as any).message = 'jasmine spec';

ifEnvSupports(supportJasmineSpec, () => {
  beforeEach(() => {
    // assert that each jasmine run has a task, so that drainMicrotask works properly.
    expect(Zone.currentTask).toBeTruthy();
  });

  describe('jasmine', () => {
    let throwOnAsync = false;
    let beforeEachZone: Zone|null = null;
    let beforeAllZone: Zone|null = null;
    let itZone: Zone|null = null;
    const syncZone = Zone.current;
    try {
      Zone.current.scheduleMicroTask('dontallow', (): any => null);
    } catch (e) {
      throwOnAsync = true;
    }

    beforeAll(() => beforeAllZone = Zone.current);

    beforeEach(() => beforeEachZone = Zone.current);

    it('should throw on async in describe', () => {
      expect(throwOnAsync).toBe(true);
      expect(syncZone.name).toEqual('syncTestZone for jasmine.describe');
      itZone = Zone.current;
    });

    it('should cope with pending tests, which have no test body');

    afterEach(() => {
      let zone = Zone.current;
      expect(zone.name).toEqual('ProxyZone');
      expect(beforeEachZone!.name).toEqual(zone.name);
      expect(itZone).toBe(zone);
    });

    afterAll(() => {
      let zone = Zone.current;
      expect(zone.name).toEqual('ProxyZone');
      expect(beforeAllZone!.name).toEqual(zone.name);
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

  describe('jasmine.createSpyObj', () => {
    it('createSpyObj with properties should be able to be retrieved from the spy', () => {
      const spy = jasmine.createSpyObj('obj', ['someFunction'], {prop1: 'foo'});
      expect(spy.prop1).toEqual('foo');
      const desc: any = Object.getOwnPropertyDescriptor(spy, 'prop1');
      expect(desc.enumerable).toBe(true);
      expect(desc.configurable).toBe(true);
    });
  });
})();
