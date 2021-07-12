/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyValuePipe} from '@angular/common';
import {defaultComparator} from '@angular/common/src/pipes/keyvalue_pipe';
import {ɵdefaultKeyValueDiffers as defaultKeyValueDiffers} from '@angular/core';

describe('KeyValuePipe', () => {
  it('should return null when given null', () => {
    const pipe = new KeyValuePipe(defaultKeyValueDiffers);
    expect(pipe.transform(null)).toEqual(null);
  });
  it('should return null when given undefined', () => {
    const pipe = new KeyValuePipe(defaultKeyValueDiffers);
    expect(pipe.transform(undefined)).toEqual(null);
  });
  it('should return null for an unsupported type', () => {
    const pipe = new KeyValuePipe(defaultKeyValueDiffers);
    const fn = () => {};
    expect(pipe.transform(fn as any as null)).toEqual(null);
  });
  describe('object dictionary', () => {
    it('should return empty array of an empty dictionary', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform({})).toEqual([]);
    });
    it('should transform a basic dictionary', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform({1: 2})).toEqual([{key: '1', value: 2}]);
    });
    it('should order by alpha', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform({'b': 1, 'a': 1})).toEqual([
        {key: 'a', value: 1}, {key: 'b', value: 1}
      ]);
    });
    it('should order by numerical', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform({2: 1, 1: 1})).toEqual([{key: '1', value: 1}, {key: '2', value: 1}]);
    });
    it('should order by numerical and alpha', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const input = {2: 1, 1: 1, 'b': 1, 0: 1, 3: 1, 'a': 1};
      expect(pipe.transform(input)).toEqual([
        {key: '0', value: 1}, {key: '1', value: 1}, {key: '2', value: 1}, {key: '3', value: 1},
        {key: 'a', value: 1}, {key: 'b', value: 1}
      ]);
    });
    it('should reorder when compareFn changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const input = {'b': 1, 'a': 2};
      pipe.transform<string, number>(input);
      expect(pipe.transform<string, number>(input, (a, b) => a.value - b.value)).toEqual([
        {key: 'b', value: 1},
        {key: 'a', value: 2},
      ]);
    });
    it('should return the same ref if nothing changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const transform1 = pipe.transform({1: 2});
      const transform2 = pipe.transform({1: 2});
      expect(transform1 === transform2).toEqual(true);
    });
    it('should return a new ref if something changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const transform1 = pipe.transform({1: 2});
      const transform2 = pipe.transform({1: 3});
      expect(transform1 !== transform2).toEqual(true);
    });
    it('should accept a type union of an object with string keys and null', () => {
      let value!: {[key: string]: string}|null;
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(value)).toEqual(null);
    });
    it('should accept a type union of an object with number keys and null', () => {
      let value!: {[key: number]: string}|null;
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(value)).toEqual(null);
    });
  });

  describe('Map', () => {
    it('should return an empty array for an empty Map', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(new Map())).toEqual([]);
    });
    it('should transform a basic Map', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(new Map([[1, 2]]))).toEqual([{key: 1, value: 2}]);
    });
    it('should order by alpha', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(new Map([['b', 1], ['a', 1]]))).toEqual([
        {key: 'a', value: 1}, {key: 'b', value: 1}
      ]);
    });
    it('should order by numerical', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(new Map([[2, 1], [1, 1]]))).toEqual([
        {key: 1, value: 1}, {key: 2, value: 1}
      ]);
    });
    it('should order by numerical and alpha', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const input =
          [[2, 1], [1, 1], ['b', 1], [0, 1], [3, 1], ['a', 1]] as Array<[number | string, number]>;
      expect(pipe.transform(new Map(input))).toEqual([
        {key: 0, value: 1}, {key: 1, value: 1}, {key: 2, value: 1}, {key: 3, value: 1},
        {key: 'a', value: 1}, {key: 'b', value: 1}
      ]);
    });
    it('should order by complex types with compareFn', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const input = new Map([[{id: 1}, 1], [{id: 0}, 1]]);
      expect(pipe.transform<{id: number}, number>(input, (a, b) => a.key.id > b.key.id ? 1 : -1))
          .toEqual([
            {key: {id: 0}, value: 1},
            {key: {id: 1}, value: 1},
          ]);
    });
    it('should reorder when compareFn changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const input = new Map([['b', 1], ['a', 2]]);
      pipe.transform<string, number>(input);
      expect(pipe.transform<string, number>(input, (a, b) => a.value - b.value)).toEqual([
        {key: 'b', value: 1},
        {key: 'a', value: 2},
      ]);
    });
    it('should return the same ref if nothing changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const transform1 = pipe.transform(new Map([[1, 2]]));
      const transform2 = pipe.transform(new Map([[1, 2]]));
      expect(transform1 === transform2).toEqual(true);
    });
    it('should return a new ref if something changes', () => {
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      const transform1 = pipe.transform(new Map([[1, 2]]));
      const transform2 = pipe.transform(new Map([[1, 3]]));
      expect(transform1 !== transform2).toEqual(true);
    });
    it('should accept a type union of a Map and null', () => {
      let value!: Map<number, number>|null;
      const pipe = new KeyValuePipe(defaultKeyValueDiffers);
      expect(pipe.transform(value)).toEqual(null);
    });
  });
});

describe('defaultComparator', () => {
  it('should remain the same order when keys are equal', () => {
    const key = 1;
    const values = [{key, value: 2}, {key, value: 1}];
    expect(values.sort(defaultComparator)).toEqual(values);
  });
  it('should sort undefined keys to the end', () => {
    const values = [{key: 3, value: 1}, {key: undefined, value: 3}, {key: 1, value: 2}];
    expect(values.sort(defaultComparator)).toEqual([
      {key: 1, value: 2}, {key: 3, value: 1}, {key: undefined, value: 3}
    ]);
  });
  it('should sort null keys to the end', () => {
    const values = [{key: 3, value: 1}, {key: null, value: 3}, {key: 1, value: 2}];
    expect(values.sort(defaultComparator)).toEqual([
      {key: 1, value: 2}, {key: 3, value: 1}, {key: null, value: 3}
    ]);
  });
  it('should sort strings in alpha ascending', () => {
    const values = [{key: 'b', value: 1}, {key: 'a', value: 3}];
    expect(values.sort(defaultComparator)).toEqual([{key: 'a', value: 3}, {key: 'b', value: 1}]);
  });
  it('should sort numbers in numerical ascending', () => {
    const values = [{key: 2, value: 1}, {key: 1, value: 3}];
    expect(values.sort(defaultComparator)).toEqual([{key: 1, value: 3}, {key: 2, value: 1}]);
  });
  it('should sort boolean in false (0) -> true (1)', () => {
    const values = [{key: true, value: 3}, {key: false, value: 1}];
    expect(values.sort(defaultComparator)).toEqual([{key: false, value: 1}, {key: true, value: 3}]);
  });
  it('should sort numbers as strings in numerical ascending', () => {
    // We need to cast the values array to "any[]" because the object keys
    // have no type overlap and the "Array.sort" expects all keys to have the
    // same type when passed to the sort comparator.
    const values = [{key: '2', value: 1}, {key: 1, value: 3}] as any[];
    expect(values.sort(defaultComparator)).toEqual([{key: 1, value: 3}, {key: '2', value: 1}]);
  });
});
