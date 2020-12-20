/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {patchMethod, patchProperty, patchPrototype, zoneSymbol} from '../../lib/common/utils';

describe('utils', function() {
  describe('patchMethod', () => {
    it('should patch target where the method is defined', () => {
      let args: any[]|undefined;
      let self: any;
      class Type {
        method(..._args: any[]) {
          args = _args;
          self = this;
          return 'OK';
        }
      }
      const method = Type.prototype.method;
      let delegateMethod: Function;
      let delegateSymbol: string;

      const instance = new Type();
      expect(patchMethod(instance, 'method', (delegate: Function, symbol: string, name: string) => {
        expect(name).toEqual('method');
        delegateMethod = delegate;
        delegateSymbol = symbol;
        return function(self, args) {
          return delegate.apply(self, ['patch', args[0]]);
        };
      })).toBe(delegateMethod!);

      expect(instance.method('a0')).toEqual('OK');
      expect(args).toEqual(['patch', 'a0']);
      expect(self).toBe(instance);
      expect(delegateMethod!).toBe(method);
      expect(delegateSymbol!).toEqual(zoneSymbol('method'));
      expect((Type.prototype as any)[delegateSymbol!]).toBe(method);
    });

    it('should not double patch', () => {
      const Type = function() {};
      const method = Type.prototype.method = function() {};
      patchMethod(Type.prototype, 'method', (delegate) => {
        return function(self, args: any[]) {
          return delegate.apply(self, ['patch', ...args]);
        };
      });
      const pMethod = Type.prototype.method;
      expect(pMethod).not.toBe(method);
      patchMethod(Type.prototype, 'method', (delegate) => {
        return function(self, args) {
          return delegate.apply(self, ['patch', ...args]);
        };
      });
      expect(pMethod).toBe(Type.prototype.method);
    });

    it('should not patch property which is not configurable', () => {
      const TestType = function() {};
      const originalDefineProperty = (Object as any)[zoneSymbol('defineProperty')];
      if (originalDefineProperty) {
        originalDefineProperty(
            TestType.prototype, 'nonConfigurableProperty',
            {configurable: false, writable: true, value: 'test'});
      } else {
        Object.defineProperty(
            TestType.prototype, 'nonConfigurableProperty',
            {configurable: false, writable: true, value: 'test'});
      }
      patchProperty(TestType.prototype, 'nonConfigurableProperty');
      const desc = Object.getOwnPropertyDescriptor(TestType.prototype, 'nonConfigurableProperty');
      expect(desc!.writable).toBeTruthy();
      expect(!desc!.get).toBeTruthy();
    });

    it('should patch target if it overrides a patched method', () => {
      let args: any[]|undefined;
      let childArgs: any[]|undefined;
      let self: any;
      let childSelf: any;
      class Type {
        method(..._args: any[]) {
          args = _args;
          self = this;
          return 'OK';
        }
      }
      class ChildType extends Type {
        method(..._args: any[]) {
          childArgs = _args;
          childSelf = this;
          return 'ChildOK';
        }
      }

      const method = Type.prototype.method;
      const childMethod = ChildType.prototype.method;
      let delegateMethod: Function;
      let delegateSymbol: string;
      let childDelegateMethod: Function;
      let childDelegateSymbol: string;

      const typeInstance = new Type();
      const childTypeInstance = new ChildType();
      expect(patchMethod(
                 Type.prototype, 'method',
                 (delegate: Function, symbol: string, name: string) => {
                   expect(name).toEqual('method');
                   delegateMethod = delegate;
                   delegateSymbol = symbol;
                   return function(self, args) {
                     return delegate.apply(self, ['patch', args[0]]);
                   };
                 }))
          .toBe(delegateMethod!);

      expect(patchMethod(
                 ChildType.prototype, 'method',
                 (delegate: Function, symbol: string, name: string) => {
                   expect(name).toEqual('method');
                   childDelegateMethod = delegate;
                   childDelegateSymbol = symbol;
                   return function(self, args) {
                     return delegate.apply(self, ['child patch', args[0]]);
                   };
                 }))
          .toBe(childDelegateMethod!);

      expect(typeInstance.method('a0')).toEqual('OK');
      expect(childTypeInstance.method('a0')).toEqual('ChildOK');
      expect(args).toEqual(['patch', 'a0']);
      expect(childArgs).toEqual(['child patch', 'a0']);
      expect(self).toBe(typeInstance);
      expect(childSelf).toBe(childTypeInstance);
      expect(delegateMethod!).toBe(method);
      expect(childDelegateMethod!).toBe(childMethod);
      expect(delegateSymbol!).toEqual(zoneSymbol('method'));
      expect(childDelegateSymbol!).toEqual(zoneSymbol('method'));
      expect((Type.prototype as any)[delegateSymbol!]).toBe(method);
      expect((ChildType.prototype as any)[delegateSymbol!]).toBe(childMethod);
    });

    it('should not patch target if does not override a patched method', () => {
      let args: any[]|undefined;
      let self: any;
      class Type {
        method(..._args: any[]) {
          args = _args;
          self = this;
          return 'OK';
        }
      }
      class ChildType extends Type {}
      const method = Type.prototype.method;
      let delegateMethod: Function;
      let delegateSymbol: string;
      let childPatched = false;

      const typeInstance = new Type();
      const childTypeInstance = new ChildType();
      expect(patchMethod(
                 Type.prototype, 'method',
                 (delegate: Function, symbol: string, name: string) => {
                   expect(name).toEqual('method');
                   delegateMethod = delegate;
                   delegateSymbol = symbol;
                   return function(self, args) {
                     return delegate.apply(self, ['patch', args[0]]);
                   };
                 }))
          .toBe(delegateMethod!);

      expect(patchMethod(
                 ChildType.prototype, 'method',
                 (delegate: Function, symbol: string, name: string) => {
                   childPatched = true;
                   return function(self, args) {
                     return delegate.apply(self, ['child patch', args[0]]);
                   };
                 }))
          .toBe(delegateMethod!);

      expect(childPatched).toBe(false);
      expect(typeInstance.method('a0')).toEqual('OK');
      expect(args).toEqual(['patch', 'a0']);
      expect(self).toBe(typeInstance);
      expect(delegateMethod!).toBe(method);
      expect(delegateSymbol!).toEqual(zoneSymbol('method'));
      expect((Type.prototype as any)[delegateSymbol!]).toBe(method);
      expect(childTypeInstance.method('a0')).toEqual('OK');
      expect(args).toEqual(['patch', 'a0']);
      expect(self).toBe(childTypeInstance);
      expect((ChildType.prototype as any)[delegateSymbol!]).toBe(method);
    });
  });

  describe('patchPrototype', () => {
    it('non configurable property desc should be patched', () => {
      'use strict';
      const TestFunction: any = function() {};
      const log: string[] = [];
      Object.defineProperties(TestFunction.prototype, {
        'property1': {
          value: function Property1(callback: Function) {
            Zone.root.run(callback);
          },
          writable: true,
          configurable: true,
          enumerable: true
        },
        'property2': {
          value: function Property2(callback: Function) {
            Zone.root.run(callback);
          },
          writable: true,
          configurable: false,
          enumerable: true
        }
      });

      const zone = Zone.current.fork({name: 'patch'});

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1<root>', 'property2<root>']);
      log.length = 0;

      patchPrototype(TestFunction.prototype, ['property1', 'property2']);

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1patch', 'property2patch']);
    });

    it('non writable property desc should not be patched', () => {
      'use strict';
      const TestFunction: any = function() {};
      const log: string[] = [];
      Object.defineProperties(TestFunction.prototype, {
        'property1': {
          value: function Property1(callback: Function) {
            Zone.root.run(callback);
          },
          writable: true,
          configurable: true,
          enumerable: true
        },
        'property2': {
          value: function Property2(callback: Function) {
            Zone.root.run(callback);
          },
          writable: false,
          configurable: true,
          enumerable: true
        }
      });

      const zone = Zone.current.fork({name: 'patch'});

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1<root>', 'property2<root>']);
      log.length = 0;

      patchPrototype(TestFunction.prototype, ['property1', 'property2']);

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1patch', 'property2<root>']);
    });

    it('readonly property desc should not be patched', () => {
      'use strict';
      const TestFunction: any = function() {};
      const log: string[] = [];
      Object.defineProperties(TestFunction.prototype, {
        'property1': {
          get: function() {
            if (!this._property1) {
              this._property1 = function Property2(callback: Function) {
                Zone.root.run(callback);
              };
            }
            return this._property1;
          },
          set: function(func: Function) {
            this._property1 = func;
          },
          configurable: true,
          enumerable: true
        },
        'property2': {
          get: function() {
            return function Property2(callback: Function) {
              Zone.root.run(callback);
            };
          },
          configurable: true,
          enumerable: true
        }
      });

      const zone = Zone.current.fork({name: 'patch'});

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1<root>', 'property2<root>']);
      log.length = 0;

      patchPrototype(TestFunction.prototype, ['property1', 'property2']);

      zone.run(() => {
        const instance = new TestFunction();
        instance.property1(() => {
          log.push('property1' + Zone.current.name);
        });
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property1patch', 'property2<root>']);
    });

    it('non writable method should not be patched', () => {
      'use strict';
      const TestFunction: any = function() {};
      const log: string[] = [];
      Object.defineProperties(TestFunction.prototype, {
        'property2': {
          value: function Property2(callback: Function) {
            Zone.root.run(callback);
          },
          writable: false,
          configurable: true,
          enumerable: true
        }
      });

      const zone = Zone.current.fork({name: 'patch'});

      zone.run(() => {
        const instance = new TestFunction();
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property2<root>']);
      log.length = 0;

      patchMethod(
          TestFunction.prototype, 'property2',
          function(delegate: Function, delegateName: string, name: string) {
            return function(self: any, args: any) {
              log.push('patched property2');
            };
          });

      zone.run(() => {
        const instance = new TestFunction();
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property2<root>']);
    });

    it('readonly method should not be patched', () => {
      'use strict';
      const TestFunction: any = function() {};
      const log: string[] = [];
      Object.defineProperties(TestFunction.prototype, {
        'property2': {
          get: function() {
            return function Property2(callback: Function) {
              Zone.root.run(callback);
            };
          },
          configurable: true,
          enumerable: true
        }
      });

      const zone = Zone.current.fork({name: 'patch'});

      zone.run(() => {
        const instance = new TestFunction();
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property2<root>']);
      log.length = 0;

      patchMethod(
          TestFunction.prototype, 'property2',
          function(delegate: Function, delegateName: string, name: string) {
            return function(self: any, args: any) {
              log.push('patched property2');
            };
          });

      zone.run(() => {
        const instance = new TestFunction();
        instance.property2(() => {
          log.push('property2' + Zone.current.name);
        });
      });
      expect(log).toEqual(['property2<root>']);
    });
  });
});
