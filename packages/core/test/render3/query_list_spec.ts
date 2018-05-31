/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList} from '../../src/render3/query';

describe('QueryList', () => {
  let q: QueryList<number>;

  beforeEach(() => { q = new QueryList<number>(); });

  describe('dirty and reset', () => {

    it('should be dirty and empty initially', () => {
      expect(q.dirty).toBeTruthy();
      expect(q.length).toBe(0);
    });

    it('should be not dirty after reset', () => {
      expect(q.dirty).toBeTruthy();
      q.reset([1, 2, 3]);
      expect(q.dirty).toBeFalsy();
      expect(q.length).toBe(3);
    });

  });

  describe('elements access', () => {

    it('should give access to the first / last element', () => {
      q.reset([1, 2, 3]);
      expect(q.length).toBe(3);
      expect(q.first).toBe(1);
      expect(q.last).toBe(3);
    });

    it('should return copy of matched elements as an array', () => {
      q.reset([1, 2, 3]);

      const result = q.toArray();
      expect(result).toEqual([1, 2, 3]);

      // mutate returned result to make sure that oryginal values in query are not mutated
      result.push(4);
      expect(q.toArray()).toEqual([1, 2, 3]);
    });

  });

  describe('array-like methods', () => {

    it('should support map method', () => {
      q.reset([1, 2, 3]);
      expect(q.map<number>((item: number, idx: number) => {
        return item + idx;
      })).toEqual([1, 3, 5]);
    });

    it('should support filter method', () => {
      q.reset([1, 2, 3]);
      expect(q.filter((item: number, idx: number) => { return item > 2; })).toEqual([3]);
    });

    it('should support find method', () => {
      q.reset([1, 2, 3]);
      expect(q.find((item: number, idx: number) => { return item > 0; })).toBe(1);
    });

    it('should support reduce method', () => {
      q.reset([1, 2, 3]);
      expect(q.reduce<number>((prevValue: number, curValue: number, curIndex: number) => {
        return prevValue + curValue + curIndex;
      }, 0)).toBe(9);
    });

    it('should support forEach method', () => {
      let itemIdxSum = 0;
      q.reset([1, 2, 3]);
      q.forEach((item: number, idx: number) => { itemIdxSum += item + idx; });
      expect(itemIdxSum).toBe(9);
    });

    it('should support some method', () => {
      q.reset([1, 2, 3]);
      expect(q.some((item: number, idx: number) => { return item > 0; })).toBe(true);
    });

  });

  describe('destroy', () => {
    it('should close all subscriptions', () => {
      let completed = false;
      q.changes.subscribe(() => {}, () => {}, () => { completed = true; });
      q.destroy();
      expect(completed).toBeTruthy();
    });
  });
});
