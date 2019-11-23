/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computeClassChanges, removeClass, splitClassList} from '../../../src/render3/styling/class_differ';

describe('class differ', () => {
  describe('computeClassChanges', () => {
    function expectComputeClassChanges(oldValue: string, newValue: string) {
      const changes: (boolean | null | string)[] = [];
      const newLocal = computeClassChanges(oldValue, newValue);
      sortedForEach(newLocal, (value, key) => { changes.push(key, value); });
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
      expectComputeClassChanges('C B A', 'A B').toEqual(['A', null, 'B', null, 'C', false]);
    });

    it('should detect duplicates and ignore them', () => {
      expectComputeClassChanges('A A B C', 'A B C').toEqual(['A', null, 'B', null, 'C', null]);
      expectComputeClassChanges('A A B', 'A A C').toEqual(['A', null, 'B', false, 'C', true]);
    });
  });

  describe('splitClassList', () => {
    function expectSplitClassList(text: string) {
      const changes: (boolean | null | string)[] = [];
      const changesMap = new Map<string, boolean|null>();
      splitClassList(text, changesMap, false);
      changesMap.forEach((value, key) => changes.push(key, value));
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

  describe('removeClass', () => {
    it('should remove class name from a class-list string', () => {
      expect(removeClass('', '')).toEqual('');
      expect(removeClass('A', 'A')).toEqual('');
      expect(removeClass('AB', 'AB')).toEqual('');
      expect(removeClass('A B', 'A')).toEqual('B');
      expect(removeClass('A    B', 'A')).toEqual('B');
    });

    it('should not remove a sub-string', () => {
      expect(removeClass('ABC', 'A')).toEqual('ABC');
      expect(removeClass('ABC', 'B')).toEqual('ABC');
      expect(removeClass('ABC', 'C')).toEqual('ABC');
      expect(removeClass('ABC', 'AB')).toEqual('ABC');
      expect(removeClass('ABC', 'BC')).toEqual('ABC');
    });
  });
});

export function sortedForEach<V>(map: Map<string, V>, fn: (value: V, key: string) => void): void {
  const keys: string[] = [];
  map.forEach((value, key) => keys.push(key));
  keys.sort();
  keys.forEach((key) => fn(map.get(key) !, key));
}
