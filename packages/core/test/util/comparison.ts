/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {devModeEqual, eq} from '../../src/util/comparison';

describe('Comparison util', () => {
  describe('devModeEqual', () => {
    it('should do the deep comparison of iterables', () => {
      expect(devModeEqual([['one']], [['one']])).toBe(true);
      expect(devModeEqual(['one'], ['one', 'two'])).toBe(false);
      expect(devModeEqual(['one', 'two'], ['one'])).toBe(false);
      expect(devModeEqual(['one'], 'one')).toBe(false);
      expect(devModeEqual(['one'], {})).toBe(false);
      expect(devModeEqual('one', ['one'])).toBe(false);
      expect(devModeEqual({}, ['one'])).toBe(false);
    });

    it('should compare primitive numbers', () => {
      expect(devModeEqual(1, 1)).toBe(true);
      expect(devModeEqual(1, 2)).toBe(false);
      expect(devModeEqual({}, 2)).toBe(false);
      expect(devModeEqual(1, {})).toBe(false);
    });

    it('should compare primitive strings', () => {
      expect(devModeEqual('one', 'one')).toBe(true);
      expect(devModeEqual('one', 'two')).toBe(false);
      expect(devModeEqual({}, 'one')).toBe(false);
      expect(devModeEqual('one', {})).toBe(false);
    });

    it('should compare primitive booleans', () => {
      expect(devModeEqual(true, true)).toBe(true);
      expect(devModeEqual(true, false)).toBe(false);
      expect(devModeEqual({}, true)).toBe(false);
      expect(devModeEqual(true, {})).toBe(false);
    });

    it('should compare null', () => {
      expect(devModeEqual(null, null)).toBe(true);
      expect(devModeEqual(null, 1)).toBe(false);
      expect(devModeEqual({}, null)).toBe(false);
      expect(devModeEqual(null, {})).toBe(false);
    });

    it('should return true for other objects', () => {
      expect(devModeEqual({}, {})).toBe(true);
    });
  });

  describe('eq', () => {
    describe('Primitive values and identity', () => {
      it('returns true for identical primitives', () => {
        expect(eq(1, 1)).toBe(true);
        expect(eq('hello', 'hello')).toBe(true);
        expect(eq(true, true)).toBe(true);
        expect(eq(null, null)).toBe(true);
        expect(eq(undefined, undefined)).toBe(true);
      });

      it('returns false for different primitives', () => {
        expect(eq(1, 2)).toBe(false);
        expect(eq('foo', 'bar')).toBe(false);
        expect(eq(true, false)).toBe(false);
        expect(eq(null, undefined)).toBe(false);
        expect(eq(0, false)).toBe(false);
        expect(eq('', false)).toBe(false);
      });

      it('handles NaN equality correctly', () => {
        expect(eq(NaN, NaN)).toBe(true);
        expect(eq(NaN, 0)).toBe(false);
        expect(eq(0, NaN)).toBe(false);
      });
    });

    describe('Null, primitive, and type mismatches with objects', () => {
      it('returns false when comparing an object with null or primitives', () => {
        expect(eq({a: 1}, null)).toBe(false);
        expect(eq(null, {a: 1})).toBe(false);
        expect(eq({a: 1}, 123)).toBe(false);
        expect(eq('string', {a: 1})).toBe(false);
      });
    });

    describe('.equals() method support (e.g., Temporal API)', () => {
      it('uses .equals() when present on both objects', () => {
        const objA = {equals: (other: any) => other?.val === 10, val: 10};
        const objB = {equals: (other: any) => other?.val === 10, val: 10};
        const objC = {equals: (other: any) => other?.val === 20, val: 20};

        expect(eq(objA, objB)).toBe(true);
        expect(eq(objA, objC)).toBe(false);
      });

      it('falls back to object inspection if .equals() throws an error', () => {
        const objA = {
          a: 1,
          equals() {
            throw new Error('Comparison failed');
          },
        };
        const objB = {
          a: 1,
          equals() {
            throw new Error('Comparison failed');
          },
        };

        expect(eq(objA, objB)).toBe(true);
      });

      it('does not call .equals() if only one object implements it', () => {
        const objA = {a: 1, equals: () => true};
        const objB = {a: 1};

        expect(eq(objA, objB)).toBe(false);
      });
    });

    describe('Date objects', () => {
      it('returns true for dates with identical timestamps', () => {
        const d1 = new Date('2026-01-01T00:00:00Z');
        const d2 = new Date('2026-01-01T00:00:00Z');
        expect(eq(d1, d2)).toBe(true);
      });

      it('returns false for dates with different timestamps', () => {
        const d1 = new Date('2026-01-01T00:00:00Z');
        const d2 = new Date('2026-01-02T00:00:00Z');
        expect(eq(d1, d2)).toBe(false);
      });

      it('handles invalid dates (NaN timestamps)', () => {
        const invalidDate1 = new Date('invalid');
        const invalidDate2 = new Date('invalid');
        expect(eq(invalidDate1, invalidDate2)).toBe(false);
      });
    });

    describe('Arrays', () => {
      it('compares empty arrays', () => {
        expect(eq([], [])).toBe(true);
      });

      it('compares flat arrays', () => {
        expect(eq([1, 'a', true], [1, 'a', true])).toBe(true);
        expect(eq([1, 'a', true], [1, 'a', false])).toBe(false);
      });

      it('returns false for arrays of different lengths', () => {
        expect(eq([1, 2], [1, 2, 3])).toBe(false);
      });

      it('compares nested arrays', () => {
        expect(eq([1, [2, 3]], [1, [2, 3]])).toBe(true);
        expect(eq([1, [2, 3]], [1, [2, 4]])).toBe(false);
      });

      it('returns false when comparing an array with a plain object', () => {
        expect(eq([1, 2], {'0': 1, '1': 2})).toBe(false);
        expect(eq({'0': 1, '1': 2}, [1, 2])).toBe(false);
      });
    });

    describe('Plain objects', () => {
      it('compares empty objects', () => {
        expect(eq({}, {})).toBe(true);
      });

      it('compares flat objects with equal keys and values', () => {
        expect(eq({a: 1, b: 'test'}, {a: 1, b: 'test'})).toBe(true);
        expect(eq({a: 1, b: 'test'}, {b: 'test', a: 1})).toBe(true);
      });

      it('returns false if objects have different key counts', () => {
        expect(eq({a: 1}, {a: 1, b: 2})).toBe(false);
      });

      it('returns false if key values differ', () => {
        expect(eq({a: 1}, {a: 2})).toBe(false);
      });

      it('returns false if keys differ', () => {
        expect(eq({a: 1}, {b: 1})).toBe(false);
      });

      it('compares deeply nested structures', () => {
        const obj1 = {a: {b: [1, {c: 2}]}};
        const obj2 = {a: {b: [1, {c: 2}]}};
        const obj3 = {a: {b: [1, {c: 3}]}};

        expect(eq(obj1, obj2)).toBe(true);
        expect(eq(obj1, obj3)).toBe(false);
      });

      it('handles objects created with Object.create(null)', () => {
        const obj1 = Object.create(null);
        obj1.a = 1;
        const obj2 = Object.create(null);
        obj2.a = 1;

        expect(eq(obj1, obj2)).toBe(true);
      });
    });
  });
});
