/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListWrapper, MapWrapper, StringMapWrapper} from '../src/collection';

export function main() {
  describe('ListWrapper', () => {
    describe('maximum', () => {
      it('should return the maximal element', () => {
        expect(ListWrapper.maximum([1, 2, 3, 4], x => x)).toEqual(4);
      });

      it('should ignore null values', () => {
        expect(ListWrapper.maximum([null, 2, 3, null], x => x)).toEqual(3);
      });

      it('should use the provided function to determine maximum', () => {
        expect(ListWrapper.maximum([1, 2, 3, 4], x => -x)).toEqual(1);
      });

      it('should return null for an empty list',
         () => { expect(ListWrapper.maximum([], x => x)).toEqual(null); });
    });

  });

  describe('StringMapWrapper', () => {
    describe('equals', () => {
      it('should return true when comparing empty maps',
         () => { expect(StringMapWrapper.equals({}, {})).toBe(true); });

      it('should return true when comparing the same map', () => {
        var m1: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        expect(StringMapWrapper.equals(m1, m1)).toBe(true);
      });

      it('should return true when comparing different maps with the same keys and values', () => {
        var m1: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        var m2: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(true);
      });

      it('should return false when comparing maps with different numbers of keys', () => {
        var m1: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        var m2: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3, 'd': 4};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });

      it('should return false when comparing maps with different keys', () => {
        var m1: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        var m2: {[key: string]: number} = {'a': 1, 'b': 2, 'CC': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });

      it('should return false when comparing maps with different values', () => {
        var m1: {[key: string]: number} = {'a': 1, 'b': 2, 'c': 3};
        var m2: {[key: string]: number} = {'a': 1, 'b': 20, 'c': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });
    });

    describe('MapWrapper', () => {
      it('should return a list of keys values', () => {
        var m = new Map();
        m.set('a', 'b');
        expect(MapWrapper.keys(m)).toEqual(['a']);
        expect(MapWrapper.values(m)).toEqual(['b']);
      });
    });
  });
}
