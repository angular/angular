import {describe, it, expect, beforeEach, ddescribe, iit, xit} from 'angular2/test_lib';

import {List, ListWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('ListWrapper', () => {
    var l: List<int>;

    describe('splice', () => {
      it('should remove sublist of given length and return it', () => {
        var list = [1, 2, 3, 4, 5, 6];
        expect(ListWrapper.splice(list, 1, 3)).toEqual([2, 3, 4]);
        expect(list).toEqual([1, 5, 6]);
      });

      it('should support negative start', () => {
        var list = [1, 2, 3, 4, 5, 6];
        expect(ListWrapper.splice(list, -5, 3)).toEqual([2, 3, 4]);
        expect(list).toEqual([1, 5, 6]);
      });
    });

    describe('fill', () => {
      beforeEach(() => { l = [1, 2, 3, 4]; });

      it('should fill the whole list if neither start nor end are specified', () => {
        ListWrapper.fill(l, 9);
        expect(l).toEqual([9, 9, 9, 9]);
      });

      it('should fill up to the end if end is not specified', () => {
        ListWrapper.fill(l, 9, 1);
        expect(l).toEqual([1, 9, 9, 9]);
      });

      it('should support negative start', () => {
        ListWrapper.fill(l, 9, -1);
        expect(l).toEqual([1, 2, 3, 9]);
      });

      it('should support negative end', () => {
        ListWrapper.fill(l, 9, -2, -1);
        expect(l).toEqual([1, 2, 9, 4]);
      });
    });

    describe('slice', () => {
      beforeEach(() => { l = [1, 2, 3, 4]; });

      it('should return the whole list if neither start nor end are specified',
         () => { expect(ListWrapper.slice(l)).toEqual([1, 2, 3, 4]); });

      it('should return up to the end if end is not specified',
         () => { expect(ListWrapper.slice(l, 1)).toEqual([2, 3, 4]); });

      it('should support negative start', () => { expect(ListWrapper.slice(l, -1)).toEqual([4]); });

      it('should support negative end',
         () => { expect(ListWrapper.slice(l, -3, -1)).toEqual([2, 3]); });
    });

    describe('indexOf', () => {
      beforeEach(() => { l = [1, 2, 3, 4]; });

      it('should find values that exist', () => { expect(ListWrapper.indexOf(l, 1)).toEqual(0); });

      it('should not find values that do not exist',
         () => { expect(ListWrapper.indexOf(l, 9)).toEqual(-1); });

      it('should respect the startIndex parameter',
         () => { expect(ListWrapper.indexOf(l, 1, 1)).toEqual(-1); });
    });
  });

  describe('StringMapWrapper', () => {
    describe('equals', () => {
      it('should return true when comparing empty maps',
         () => { expect(StringMapWrapper.equals({}, {})).toBe(true); });

      it('should return true when comparing the same map', () => {
        var m1 = {'a': 1, 'b': 2, 'c': 3};
        expect(StringMapWrapper.equals(m1, m1)).toBe(true);
      });

      it('should return true when comparing different maps with the same keys and values', () => {
        var m1 = {'a': 1, 'b': 2, 'c': 3};
        var m2 = {'a': 1, 'b': 2, 'c': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(true);
      });

      it('should return false when comparing maps with different numbers of keys', () => {
        var m1 = {'a': 1, 'b': 2, 'c': 3};
        var m2 = {'a': 1, 'b': 2, 'c': 3, 'd': 4};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });

      it('should return false when comparing maps with different keys', () => {
        var m1 = {'a': 1, 'b': 2, 'c': 3};
        var m2 = {'a': 1, 'b': 2, 'CC': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });

      it('should return false when comparing maps with different values', () => {
        var m1 = {'a': 1, 'b': 2, 'c': 3};
        var m2 = {'a': 1, 'b': 20, 'c': 3};
        expect(StringMapWrapper.equals(m1, m2)).toBe(false);
        expect(StringMapWrapper.equals(m2, m1)).toBe(false);
      });
    });
  });
}
