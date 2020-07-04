/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {arrayIndexOfSorted, arrayInsert, arrayInsert2, arrayInsertSorted, arrayRemoveSorted, arraySplice, flatten, KeyValueArray, keyValueArrayDelete, keyValueArrayGet, keyValueArrayIndexOf, keyValueArraySet} from '../../src/util/array_utils';

describe('array_utils', () => {
  describe('flatten', () => {
    it('should flatten an empty array', () => {
      expect(flatten([])).toEqual([]);
    });

    it('should flatten a flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should flatten a nested array depth-first', () => {
      expect(flatten([1, [2], 3])).toEqual([1, 2, 3]);
      expect(flatten([[1], 2, [3]])).toEqual([1, 2, 3]);
      expect(flatten([1, [2, [3]], 4])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [2, [3]], [4]])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [2, [3]], [[[4]]]])).toEqual([1, 2, 3, 4]);
      expect(flatten([1, [], 2])).toEqual([1, 2]);
    });
  });

  describe('fast arraySplice', () => {
    function expectArraySplice(array: any[], index: number) {
      arraySplice(array, index, 1);
      return expect(array);
    }

    it('should remove items', () => {
      expectArraySplice([0, 1, 2], 0).toEqual([1, 2]);
      expectArraySplice([0, 1, 2], 1).toEqual([0, 2]);
      expectArraySplice([0, 1, 2], 2).toEqual([0, 1]);
    });
  });

  describe('arrayInsertSorted', () => {
    function expectArrayInsert(array: any[], index: number, value: any) {
      arrayInsert(array, index, value);
      return expect(array);
    }

    function expectArrayInsert2(array: any[], index: number, value1: any, value2: any) {
      arrayInsert2(array, index, value1, value2);
      return expect(array);
    }

    it('should insert items', () => {
      expectArrayInsert([], 0, 'A').toEqual(['A']);
      expectArrayInsert([0], 0, 'A').toEqual(['A', 0]);
      expectArrayInsert([0], 1, 'A').toEqual([0, 'A']);
      expectArrayInsert([0, 1, 2], 0, 'A').toEqual(['A', 0, 1, 2]);
      expectArrayInsert([0, 1, 2], 1, 'A').toEqual([0, 'A', 1, 2]);
      expectArrayInsert([0, 1, 2], 2, 'A').toEqual([0, 1, 'A', 2]);
      expectArrayInsert([0, 1, 2], 3, 'A').toEqual([0, 1, 2, 'A']);
    });

    it('should insert items', () => {
      expectArrayInsert2([], 0, 'A', 'B').toEqual(['A', 'B']);
      expectArrayInsert2([0], 0, 'A', 'B').toEqual(['A', 'B', 0]);
      expectArrayInsert2([0], 1, 'A', 'B').toEqual([0, 'A', 'B']);
      expectArrayInsert2([0, 1, 2], 0, 'A', 'B').toEqual(['A', 'B', 0, 1, 2]);
      expectArrayInsert2([0, 1, 2], 1, 'A', 'B').toEqual([0, 'A', 'B', 1, 2]);
      expectArrayInsert2([0, 1, 2], 2, 'A', 'B').toEqual([0, 1, 'A', 'B', 2]);
      expectArrayInsert2([0, 1, 2], 3, 'A', 'B').toEqual([0, 1, 2, 'A', 'B']);
      expectArrayInsert2(['height', '1px', 'width', '2000px'], 0, 'color', 'red').toEqual([
        'color', 'red', 'height', '1px', 'width', '2000px'
      ]);
    });
  });

  describe('arrayInsertSorted', () => {
    it('should insert items don\'t allow duplicates', () => {
      let a;
      a = ['a', 'c', 'e', 'g', 'i'];
      expect(arrayInsertSorted(a, 'a')).toEqual(0);
      expect(a).toEqual(['a', 'c', 'e', 'g', 'i']);

      a = ['a', 'c', 'e', 'g', 'i'];
      expect(arrayInsertSorted(a, 'b')).toEqual(1);
      expect(a).toEqual(['a', 'b', 'c', 'e', 'g', 'i']);

      a = ['a', 'c', 'e', 'g', 'i'];
      expect(arrayInsertSorted(a, 'c')).toEqual(1);
      expect(a).toEqual(['a', 'c', 'e', 'g', 'i']);

      a = ['a', 'c', 'e', 'g', 'i'];
      expect(arrayInsertSorted(a, 'd')).toEqual(2);
      expect(a).toEqual(['a', 'c', 'd', 'e', 'g', 'i']);

      a = ['a', 'c', 'e', 'g', 'i'];
      expect(arrayInsertSorted(a, 'e')).toEqual(2);
      expect(a).toEqual(['a', 'c', 'e', 'g', 'i']);
    });
  });



  describe('arrayRemoveSorted', () => {
    it('should remove items', () => {
      let a;
      a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayRemoveSorted(a, 'a')).toEqual(0);
      expect(a).toEqual(['b', 'c', 'd', 'e']);

      a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayRemoveSorted(a, 'b')).toEqual(1);
      expect(a).toEqual(['a', 'c', 'd', 'e']);

      a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayRemoveSorted(a, 'c')).toEqual(2);
      expect(a).toEqual(['a', 'b', 'd', 'e']);

      a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayRemoveSorted(a, 'd')).toEqual(3);
      expect(a).toEqual(['a', 'b', 'c', 'e']);

      a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayRemoveSorted(a, 'e')).toEqual(4);
      expect(a).toEqual(['a', 'b', 'c', 'd']);
    });
  });


  describe('arrayIndexOfSorted', () => {
    it('should get index of', () => {
      const a = ['a', 'b', 'c', 'd', 'e'];
      expect(arrayIndexOfSorted(a, 'a')).toEqual(0);
      expect(arrayIndexOfSorted(a, 'b')).toEqual(1);
      expect(arrayIndexOfSorted(a, 'c')).toEqual(2);
      expect(arrayIndexOfSorted(a, 'd')).toEqual(3);
      expect(arrayIndexOfSorted(a, 'e')).toEqual(4);
    });
  });

  describe('KeyValueArray', () => {
    it('should support basic operations', () => {
      const map: KeyValueArray<number> = [] as any;

      expect(keyValueArrayIndexOf(map, 'A')).toEqual(~0);

      expect(keyValueArraySet(map, 'B', 1)).toEqual(0);
      expect(map).toEqual(['B', 1]);
      expect(keyValueArrayIndexOf(map, 'B')).toEqual(0);

      expect(keyValueArraySet(map, 'A', 0)).toEqual(0);
      expect(map).toEqual(['A', 0, 'B', 1]);
      expect(keyValueArrayIndexOf(map, 'B')).toEqual(2);
      expect(keyValueArrayIndexOf(map, 'AA')).toEqual(~2);

      expect(keyValueArraySet(map, 'C', 2)).toEqual(4);
      expect(map).toEqual(['A', 0, 'B', 1, 'C', 2]);

      expect(keyValueArrayGet(map, 'A')).toEqual(0);
      expect(keyValueArrayGet(map, 'B')).toEqual(1);
      expect(keyValueArrayGet(map, 'C')).toEqual(2);
      expect(keyValueArrayGet(map, 'AA')).toEqual(undefined);

      expect(keyValueArraySet(map, 'B', -1)).toEqual(2);
      expect(map).toEqual(['A', 0, 'B', -1, 'C', 2]);

      expect(keyValueArrayDelete(map, 'AA')).toEqual(~2);
      expect(keyValueArrayDelete(map, 'B')).toEqual(2);
      expect(map).toEqual(['A', 0, 'C', 2]);
      expect(keyValueArrayDelete(map, 'A')).toEqual(0);
      expect(map).toEqual(['C', 2]);
      expect(keyValueArrayDelete(map, 'C')).toEqual(0);
      expect(map).toEqual([]);
    });
  });
});
