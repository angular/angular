/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {flatten, isDifferent} from '../../src/render3/util';

describe('util', () => {

  describe('isDifferent', () => {

    describe('checkNoChangeMode = false', () => {
      it('should mark non-equal arguments as different', () => {
        expect(isDifferent({}, {}, false)).toBeTruthy();
        expect(isDifferent('foo', 'bar', false)).toBeTruthy();
        expect(isDifferent(0, 1, false)).toBeTruthy();
      });

      it('should not mark equal arguments as different', () => {
        const obj = {};
        expect(isDifferent(obj, obj, false)).toBeFalsy();
        expect(isDifferent('foo', 'foo', false)).toBeFalsy();
        expect(isDifferent(1, 1, false)).toBeFalsy();
      });

      it('should not mark NaN as different',
         () => { expect(isDifferent(NaN, NaN, false)).toBeFalsy(); });

      it('should mark NaN with other values as different', () => {
        expect(isDifferent(NaN, 'foo', false)).toBeTruthy();
        expect(isDifferent(5, NaN, false)).toBeTruthy();
      });
    });

    describe('checkNoChangeMode = true', () => {
      // Assert relaxed constraint in checkNoChangeMode
      it('should not mark non-equal arrays, object and function as different', () => {
        expect(isDifferent([], [], true)).toBeFalsy();
        expect(isDifferent(() => 0, () => 0, true)).toBeFalsy();
        expect(isDifferent({}, {}, true)).toBeFalsy();
      });

      it('should mark non-equal arguments as different', () => {
        expect(isDifferent('foo', 'bar', true)).toBeTruthy();
        expect(isDifferent(0, 1, true)).toBeTruthy();
      });

      it('should not mark equal arguments as different', () => {
        const obj = {};
        expect(isDifferent(obj, obj, false)).toBeFalsy();
        expect(isDifferent('foo', 'foo', false)).toBeFalsy();
        expect(isDifferent(1, 1, false)).toBeFalsy();
      });

      it('should not mark NaN as different',
         () => { expect(isDifferent(NaN, NaN, false)).toBeFalsy(); });

      it('should mark NaN with other values as different', () => {
        expect(isDifferent(NaN, 'foo', false)).toBeTruthy();
        expect(isDifferent(5, NaN, false)).toBeTruthy();
      });
    });

  });

  describe('flatten', () => {

    it('should flatten an empty array', () => { expect(flatten([])).toEqual([]); });

    it('should flatten a flat array', () => { expect(flatten([1, 2, 3])).toEqual([1, 2, 3]); });

    it('should flatten a nested array', () => {
      expect(flatten([1, [2], 3])).toEqual([1, 2, 3]);
      expect(flatten([[1], 2, [3]])).toEqual([1, 2, 3]);
      expect(flatten([1, [2, [3]], 4])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [2, [3]], [4]])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [2, [3]], [[[4]]]])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [], 2])).toEqual([1, 2]);
    });
  });
});
