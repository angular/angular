import {describe, it, expect, beforeEach, ddescribe, iit, xit}
  from 'angular2/test_lib';

import {List, ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('ListWrapper', () => {
    var l: List;

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
      beforeEach(() => {
        l = [1, 2, 3, 4];
      });

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
      beforeEach(() => {
        l = [1, 2, 3, 4];
      });

      it('should return the whole list if neither start nor end are specified', () => {
        expect(ListWrapper.slice(l)).toEqual([1, 2, 3, 4]);
      });

      it('should return up to the end if end is not specified', () => {
        expect(ListWrapper.slice(l, 1)).toEqual([2, 3, 4]);
      });

      it('should support negative start', () => {
        expect(ListWrapper.slice(l, -1)).toEqual([4]);
      });

      it('should support negative end', () => {
        expect(ListWrapper.slice(l, -3, -1)).toEqual([2, 3]);
      });
    });
 });
}
