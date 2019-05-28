/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {normalizeIntoStylingMap as createMap} from '../../../src/render3/styling_next/map_based_bindings';

describe('map-based bindings', () => {
  describe('StylingMapArray construction', () => {
    it('should create a new StylingMapArray instance from a given value', () => {
      createAndAssertValues(null, []);
      createAndAssertValues(undefined, []);
      createAndAssertValues({}, []);
      createAndAssertValues({foo: 'bar'}, ['foo', 'bar']);
      createAndAssertValues({bar: null}, ['bar', null]);
      createAndAssertValues('', []);
      createAndAssertValues('abc xyz', ['abc', true, 'xyz', true]);
      createAndAssertValues([], []);
    });

    it('should list each entry in the context in alphabetical order', () => {
      const value1 = {width: '200px', color: 'red', zIndex: -1};
      const map1 = createMap(null, value1);
      expect(map1).toEqual([value1, 'color', 'red', 'width', '200px', 'zIndex', -1]);

      const value2 = 'yes no maybe';
      const map2 = createMap(null, value2);
      expect(map2).toEqual([value2, 'maybe', true, 'no', true, 'yes', true]);
    });

    it('should patch an existing StylingMapArray entry with new values and retain the alphabetical order',
       () => {
         const value1 = {color: 'red'};
         const map1 = createMap(null, value1);
         expect(map1).toEqual([value1, 'color', 'red']);

         const value2 = {backgroundColor: 'red', color: 'blue', opacity: '0.5'};
         const map2 = createMap(map1, value2);
         expect(map1).toBe(map2);
         expect(map1).toEqual(
             [value2, 'backgroundColor', 'red', 'color', 'blue', 'opacity', '0.5']);

         const value3 = 'myClass';
         const map3 = createMap(null, value3);
         expect(map3).toEqual([value3, 'myClass', true]);

         const value4 = 'yourClass everyonesClass myClass';
         const map4 = createMap(map3, value4);
         expect(map3).toBe(map4);
         expect(map4).toEqual([value4, 'everyonesClass', true, 'myClass', true, 'yourClass', true]);
       });

    it('should nullify old values that are not a part of the new set of values', () => {
      const value1 = {color: 'red', fontSize: '20px'};
      const map1 = createMap(null, value1);
      expect(map1).toEqual([value1, 'color', 'red', 'fontSize', '20px']);

      const value2 = {color: 'blue', borderColor: 'purple', opacity: '0.5'};
      const map2 = createMap(map1, value2);
      expect(map2).toEqual(
          [value2, 'borderColor', 'purple', 'color', 'blue', 'fontSize', null, 'opacity', '0.5']);

      const value3 = 'orange';
      const map3 = createMap(null, value3);
      expect(map3).toEqual([value3, 'orange', true]);

      const value4 = 'apple banana';
      const map4 = createMap(map3, value4);
      expect(map4).toEqual([value4, 'apple', true, 'banana', true, 'orange', null]);
    });

    it('should hyphenate property names ', () => {
      const value1 = {fontSize: '50px', paddingTopLeft: '20px'};
      const map1 = createMap(null, value1, true);
      expect(map1).toEqual([value1, 'font-size', '50px', 'padding-top-left', '20px']);
    });
  });
});

function createAndAssertValues(newValue: any, entries: any[]) {
  const result = createMap(null, newValue);
  expect(result).toEqual([newValue || null, ...entries]);
}
