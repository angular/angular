/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('ProxySpec', () => {
  let ProxyZoneSpec: any;
  let delegate: ZoneSpec;
  let proxyZoneSpec: any;
  let proxyZone: Zone;

  beforeEach(() => {
    ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'];
    expect(typeof ProxyZoneSpec).toBe('function');
    delegate = {name: 'delegate'};
    proxyZoneSpec = new ProxyZoneSpec(delegate);
    proxyZone = Zone.current.fork(proxyZoneSpec);
  });

  describe('properties', () => {
    it('should expose ProxyZone in the properties', () => {
      expect(proxyZone.get('ProxyZoneSpec')).toBe(proxyZoneSpec);
    });

    it('should assert that it is in or out of ProxyZone', () => {
      let rootZone = Zone.current;
      while (rootZone.parent) {
        rootZone = rootZone.parent;
      }
      rootZone.run(() => {
        expect(() => ProxyZoneSpec.assertPresent()).toThrow();
        expect(ProxyZoneSpec.isLoaded()).toBe(false);
        expect(ProxyZoneSpec.get()).toBe(undefined);
        proxyZone.run(() => {
          expect(ProxyZoneSpec.isLoaded()).toBe(true);
          expect(() => ProxyZoneSpec.assertPresent()).not.toThrow();
          expect(ProxyZoneSpec.get()).toBe(proxyZoneSpec);
        });
      });
    });

    it('should reset properties', () => {
      expect(proxyZone.get('myTestKey')).toBe(undefined);
      proxyZoneSpec.setDelegate({name: 'd1', properties: {'myTestKey': 'myTestValue'}});
      expect(proxyZone.get('myTestKey')).toBe('myTestValue');
      proxyZoneSpec.resetDelegate();
      expect(proxyZone.get('myTestKey')).toBe(undefined);
    });
  });

  describe('delegate', () => {
    it('should set/reset delegate', () => {
      const defaultDelegate: ZoneSpec = {name: 'defaultDelegate'};
      const otherDelegate: ZoneSpec = {name: 'otherDelegate'};
      const proxyZoneSpec = new ProxyZoneSpec(defaultDelegate);
      const proxyZone = Zone.current.fork(proxyZoneSpec);

      expect(proxyZoneSpec.getDelegate()).toEqual(defaultDelegate);

      proxyZoneSpec.setDelegate(otherDelegate);
      expect(proxyZoneSpec.getDelegate()).toEqual(otherDelegate);
      proxyZoneSpec.resetDelegate();
      expect(proxyZoneSpec.getDelegate()).toEqual(defaultDelegate);
    });
  });

  describe('forwarding', () => {
    beforeEach(() => {
      proxyZoneSpec = new ProxyZoneSpec();
      proxyZone = Zone.current.fork(proxyZoneSpec);
    });

    it('should fork', () => {
      const forkedZone = proxyZone.fork({name: 'fork'});
      expect(forkedZone).not.toBe(proxyZone);
      expect(forkedZone.name).toBe('fork');
      let called = false;
      proxyZoneSpec.setDelegate({
        name: '.',
        onFork:
            (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
             zoneSpec: ZoneSpec) => {
              expect(currentZone).toBe(proxyZone);
              expect(targetZone).toBe(proxyZone), expect(zoneSpec.name).toBe('fork2');
              called = true;
            }
      });
      proxyZone.fork({name: 'fork2'});
      expect(called).toBe(true);
    });

    it('should intercept', () => {
      const fn = (a: any) => a;
      expect(proxyZone.wrap(fn, 'test')('works')).toEqual('works');
      proxyZoneSpec.setDelegate({
        name: '.',
        onIntercept:
            (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
             delegate: Function, source: string): Function => {
              return () => '(works)';
            }
      });
      expect(proxyZone.wrap(fn, 'test')('works')).toEqual('(works)');
    });

    it('should invoke', () => {
      const fn = () => 'works';
      expect(proxyZone.run(fn)).toEqual('works');
      proxyZoneSpec.setDelegate({
        name: '.',
        onInvoke:
            (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
             delegate: Function, applyThis: any, applyArgs: any[], source: string) => {
              return `(${
                  parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source)})`;
            }
      });
      expect(proxyZone.run(fn)).toEqual('(works)');
    });

    it('should handleError', () => {
      const error = new Error('TestError');
      const fn = () => {
        throw error;
      };
      expect(() => proxyZone.run(fn)).toThrow(error);
      proxyZoneSpec.setDelegate({
        name: '.',
        onHandleError:
            (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any):
                boolean => {
                  expect(error).toEqual(error);
                  return false;
                }
      });
      expect(() => proxyZone.runGuarded(fn)).not.toThrow();
    });

    it('should Task', () => {
      const fn = (): any => null;
      const task = proxyZone.scheduleMacroTask('test', fn, {}, () => null, () => null);
      expect(task.source).toEqual('test');
      proxyZone.cancelTask(task);
    });
  });

  describe('delegateSpec change', () => {
    let log: string[] = [];
    beforeEach(() => {
      log = [];
    });
    it('should trigger hasTask when invoke', (done: Function) => {
      const zoneSpec1 = {
        name: 'zone1',
        onHasTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, hasTask: HasTaskState) => {
          log.push(`zoneSpec1 hasTask: ${hasTask.microTask},${hasTask.macroTask}`);
          return delegate.hasTask(target, hasTask);
        }
      };
      const zoneSpec2 = {
        name: 'zone2',
        onHasTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, hasTask: HasTaskState) => {
          log.push(`zoneSpec2 hasTask: ${hasTask.microTask},${hasTask.macroTask}`);
          return delegate.hasTask(target, hasTask);
        }
      };
      proxyZoneSpec.setDelegate(zoneSpec1);
      proxyZone.run(() => {
        setTimeout(() => {
          log.push('timeout in zoneSpec1');
        }, 50);
      });
      proxyZoneSpec.setDelegate(zoneSpec2);
      proxyZone.run(() => {
        Promise.resolve(1).then(() => {
          log.push('then in zoneSpec2');
        });
      });
      proxyZoneSpec.setDelegate(null);
      proxyZone.run(() => {
        setTimeout(() => {
          log.push('timeout in null spec');
        }, 50);
      });
      proxyZoneSpec.setDelegate(zoneSpec2);
      proxyZone.run(() => {
        Promise.resolve(1).then(() => {
          log.push('then in zoneSpec2');
        });
      });

      setTimeout(() => {
        expect(log).toEqual([
          'zoneSpec1 hasTask: false,true', 'zoneSpec2 hasTask: false,true',
          'zoneSpec2 hasTask: true,true', 'zoneSpec2 hasTask: true,true', 'then in zoneSpec2',
          'then in zoneSpec2', 'zoneSpec2 hasTask: false,true', 'timeout in zoneSpec1',
          'timeout in null spec', 'zoneSpec2 hasTask: false,false'
        ]);
        done();
      }, 300);
    });
  });
});
