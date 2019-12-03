/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayMap} from '@angular/core/src/util/array_utils';

import {computeClassChanges, splitClassList} from '../../../src/render3/styling/class_differ';

describe('class differ', () => {
  describe('computeClassChanges', () => {
    function expectComputeClassChanges(oldValue: string, newValue: string) {
      const changes: ArrayMap<boolean|null> = computeClassChanges(oldValue, newValue);
      return expect(changes);
    }

    it('should detect no changes', () => {
      expectComputeClassChanges('', '').toEqual([]);
      expectComputeClassChanges('A', 'A').toEqual(['A', null]);
      expectComputeClassChanges('A B', 'A B').toEqual(['A', null, 'B', null]);
    });

    it('should detect no changes when out of order', () => {
      expectComputeClassChanges('A B', 'B A').toEqual(['A', null, 'B', null]);
      expectComputeClassChanges('A B C', 'B C A').toEqual(['A', null, 'B', null, 'C', null]);
    });

    it('should detect additions', () => {
      expectComputeClassChanges('A B', 'A B C').toEqual(['A', null, 'B', null, 'C', true]);
      expectComputeClassChanges('Alpha Bravo', 'Bravo Alpha Charlie').toEqual([
        'Alpha', null, 'Bravo', null, 'Charlie', true
      ]);
      expectComputeClassChanges('A  B  ', 'C  B  A').toEqual(['A', null, 'B', null, 'C', true]);
    });

    it('should detect removals', () => {
      expectComputeClassChanges('A B C', 'A B').toEqual(['A', null, 'B', null, 'C', false]);
      expectComputeClassChanges('B A C', 'B A').toEqual(['A', null, 'B', null, 'C', false]);
      debugger;
      expectComputeClassChanges('C B A', 'A B').toEqual(['A', null, 'B', null, 'C', false]);
    });

    it('should detect duplicates and ignore them', () => {
      expectComputeClassChanges('A A B C', 'A B C').toEqual(['A', null, 'B', null, 'C', null]);
      expectComputeClassChanges('A A B', 'A A C').toEqual(['A', null, 'B', false, 'C', true]);
    });
  });

  describe('splitClassList', () => {
    function expectSplitClassList(text: string) {
      const changes: ArrayMap<boolean|null> = [] as any;
      splitClassList(text, changes, false);
      return expect(changes);
    }

    it('should parse a list', () => {
      expectSplitClassList('').toEqual([]);
      expectSplitClassList('A').toEqual(['A', false]);
      expectSplitClassList('A B').toEqual(['A', false, 'B', false]);
      expectSplitClassList('Alpha Bravo').toEqual(['Alpha', false, 'Bravo', false]);
    });

    it('should ignore extra spaces', () => {
      expectSplitClassList('  \n\r\t').toEqual([]);
      expectSplitClassList(' A ').toEqual(['A', false]);
      expectSplitClassList(' \n\r\t A \n\r\t B\n\r\t ').toEqual(['A', false, 'B', false]);
      expectSplitClassList(' \n\r\t Alpha \n\r\t Bravo \n\r\t ').toEqual([
        'Alpha', false, 'Bravo', false
      ]);
    });

    it('should remove duplicates', () => {
      expectSplitClassList('').toEqual([]);
      expectSplitClassList('A A').toEqual(['A', false]);
      expectSplitClassList('A B B A').toEqual(['A', false, 'B', false]);
      expectSplitClassList('Alpha Bravo Bravo Alpha').toEqual(['Alpha', false, 'Bravo', false]);
    });

  });
});
