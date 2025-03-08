/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {mutateNestedProp} from './property-mutation';

describe('property-mutation', () => {
  describe('mutateNestedProp', () => {
    it('throws when no keys are given', () => {
      expect(() => mutateNestedProp({}, [], 1)).toThrow();
    });

    describe('without signals', () => {
      it('mutates objects', () => {
        const obj = {foo: 1};

        mutateNestedProp(obj, ['foo'], 2);

        expect(obj.foo).toBe(2);
      });

      it('mutates arrays', () => {
        const obj = [1];

        mutateNestedProp(obj, ['0'], 2);

        expect(obj.length).toBe(1);
        expect(obj[0]).toBe(2);
      });

      it('mutates nested objects', () => {
        const obj = {foo: {bar: 1}};

        mutateNestedProp(obj, ['foo', 'bar'], 2);

        expect(obj.foo.bar).toBe(2);
      });

      it('mutates nested arrays', () => {
        const obj = [[1]];

        mutateNestedProp(obj, ['0', '0'], 2);

        expect(obj[0][0]).toBe(2);
      });

      it("throws an error when mutating outside an array's bounds", () => {
        const obj = {foo: [1]};

        expect(() => mutateNestedProp(obj, ['foo', '1'], 2)).toThrowError(/index 1.*length 1/);
      });

      it('mutates non-primitive objects', () => {
        class MyFoo {
          bar = 1;
        }

        const obj = {foo: new MyFoo()};

        mutateNestedProp(obj, ['foo', 'bar'], 2);

        expect(obj.foo.bar).toBe(2);
      });

      it('throws an error when mutating a non-existent property', () => {
        const obj = {
          foo: {
            bar: 1,
          },
        };

        expect(() => mutateNestedProp(obj, ['foo', 'baz'], 2)).toThrowError(
          /Property `baz` is not defined/,
        );
      });

      it('throws on mutating a getter property', () => {
        const obj = {
          foo: {
            get bar() {
              return 1;
            },
          },
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 2)).toThrowError(
          /Cannot mutate getter property: bar/,
        );
      });

      it('mutates an object from a getter property', () => {
        const bar = {baz: 1};
        const obj = {
          foo: {
            get bar() {
              return bar;
            },
          },
        };

        mutateNestedProp(obj, ['foo', 'bar', 'baz'], 2);

        expect(obj.foo.bar.baz).toBe(2);
      });

      it('mutates a setter property', () => {
        let bar = 1;
        const obj = {
          foo: {
            get bar() {
              return bar;
            },

            set bar(value: number) {
              bar = value;
            },
          },
        };

        mutateNestedProp(obj, ['foo', 'bar'], 2);

        expect(obj.foo.bar).toBe(2);
      });
    });

    describe('with signals', () => {
      it('updates when the last value is a signal', () => {
        const obj = {foo: signal(1)};

        mutateNestedProp(obj, ['foo'], 2);

        expect(obj.foo()).toBe(2);
      });

      it('immutably updates when the last receiver is a signal', () => {
        const obj = {foo: signal({bar: 1})};
        const originalSignalValue = obj.foo();

        mutateNestedProp(obj, ['foo', 'bar'], 2);

        expect(obj.foo()).not.toBe(originalSignalValue); // Immutable update.
        expect(obj.foo()).toEqual({bar: 2});
      });

      it('immutably updates objects inside of a signal and preserves other data', () => {
        const obj = {foo: signal({bar: 1, baz: 2})};

        mutateNestedProp(obj, ['foo', 'bar'], 3);

        expect(obj.foo()).toEqual({bar: 3, baz: 2});
      });

      it('immutably updates arrays inside of a signal', () => {
        const obj = {foo: signal([1])};
        const originalSignalValue = obj.foo();

        mutateNestedProp(obj, ['foo', '0'], 2);

        expect(obj.foo()).not.toBe(originalSignalValue);
        expect(obj.foo()).toEqual([2]);
      });

      it("throws an error when mutating outside an array's bounds", () => {
        const obj = {foo: signal([1])};

        expect(() => mutateNestedProp(obj, ['foo', '1'], 2)).toThrowError(/index 1.*length 1/);
      });

      it('immutably updates arrays inside of a signal and preserves other data', () => {
        const obj = {foo: signal([1, 2, 3, 4, 5])};

        mutateNestedProp(obj, ['foo', '2'], 6);

        expect(obj.foo()).toEqual([1, 2, 6, 4, 5]);
      });

      it('immutably updates nested value inside a signal', () => {
        const obj = {
          foo: signal({
            bar: {
              baz: 1,
            },
          }),
        };
        const originalSignalValue = obj.foo();

        mutateNestedProp(obj, ['foo', 'bar', 'baz'], 2);

        expect(obj.foo()).not.toBe(originalSignalValue); // Do not mutate original object.
        expect(obj.foo()).toEqual({bar: {baz: 2}});
      });

      it('throws an error when mutating a non-existent property', () => {
        const obj = {
          foo: signal({
            bar: 1,
          }),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'baz'], 2)).toThrowError(
          /Property `baz` is not defined/,
        );
      });

      it('throws on non-primitive objects', () => {
        class MyFoo {
          bar = 1;
        }

        const obj = {foo: signal(new MyFoo())};

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 2)).toThrowError(
          /Cannot immutably update type/,
        );
      });

      it('throws on objects with getters', () => {
        const obj = {
          foo: signal({
            get bar() {
              return 1;
            },
          }),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 2)).toThrowError(
          /Cannot immutably update object/,
        );
      });

      it('throws on objects with setters', () => {
        const obj = {
          foo: signal({
            set bar(_value: number) {},
          }),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 1)).toThrowError(
          /Cannot immutably update object/,
        );
      });

      it('throws on objects with sibling getters or setters', () => {
        const obj = {
          foo: signal({
            bar: 1,
            get baz() {
              return 2;
            },
          }),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 2)).toThrowError(
          /Cannot immutably update object/,
        );
      });

      it('throws on objects with inherited getters or setters', () => {
        const proto = {
          bar: 1,
          get baz() {
            return 2;
          },
        };

        const obj = {
          foo: signal(Object.create(proto)),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar'], 2)).toThrowError(
          /Cannot immutably update object/,
        );
      });

      it('immutably updates objects with unrelated getters or setters', () => {
        const obj = {
          foo: signal({
            bar: 1,

            // Safe: `baz` will not be immutably reconstructed when `bar` changes.
            baz: {
              get property() {
                return 2;
              },

              set property(_value: number) {},
            },
          }),
        };

        const originalBaz = obj.foo().baz;

        mutateNestedProp(obj, ['foo', 'bar'], 3);

        expect(obj.foo().bar).toBe(3);
        expect(obj.foo().baz).toBe(originalBaz);
      });

      it('throws on readonly signals', () => {
        const obj = {
          foo: {
            bar: computed(() => ({baz: 1})),
          },
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar', 'baz'], 2)).toThrowError(
          'Cannot mutate a readonly signal at `foo.bar`.',
        );
      });

      it('throws on nested signals', () => {
        const obj = {
          foo: signal({
            bar: signal({
              baz: 1,
            }),
          }),
        };

        expect(() => mutateNestedProp(obj, ['foo', 'bar', 'baz'], 2)).toThrowError(
          'Cannot mutate nested signals.',
        );
      });

      it('immutable updates objects with unrelated nested signals', () => {
        const obj = {
          foo: signal({
            bar: {
              baz: signal(1),
              hello: 2,
            },
          }),
        };
        const originalFoo = obj.foo();

        mutateNestedProp(obj, ['foo', 'bar', 'hello'], 3);

        expect(obj.foo().bar.hello).toBe(3);
        expect(obj.foo().bar.baz).toBe(originalFoo.bar.baz); // Nested signal should be the same.
      });
    });
  });
});
