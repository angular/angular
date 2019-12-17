/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {classIndexOf, computeClassChanges, splitClassList, toggleClass} from '../../../src/render3/styling/class_differ';

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

  describe('toggleClass', () => {
    it('should remove class name from a class-list string', () => {
      expect(toggleClass('', '', false)).toEqual('');
      expect(toggleClass('A', 'A', false)).toEqual('');
      expect(toggleClass('AB', 'AB', false)).toEqual('');
      expect(toggleClass('A B', 'A', false)).toEqual('B');
      expect(toggleClass('A    B', 'A', false)).toEqual('B');
      expect(toggleClass('A    B', 'B', false)).toEqual('A');
      expect(toggleClass('  B ', 'B', false)).toEqual('');
    });

    it('should not remove a sub-string', () => {
      expect(toggleClass('ABC', 'A', false)).toEqual('ABC');
      expect(toggleClass('ABC', 'B', false)).toEqual('ABC');
      expect(toggleClass('ABC', 'C', false)).toEqual('ABC');
      expect(toggleClass('ABC', 'AB', false)).toEqual('ABC');
      expect(toggleClass('ABC', 'BC', false)).toEqual('ABC');
    });

    it('should toggle a class', () => {
      expect(toggleClass('', 'B', false)).toEqual('');
      expect(toggleClass('', 'B', true)).toEqual('B');
      expect(toggleClass('A B C', 'B', true)).toEqual('A B C');
      expect(toggleClass('A C', 'B', true)).toEqual('A C B');
      expect(toggleClass('A B C', 'B', false)).toEqual('A C');
      expect(toggleClass('A B B C', 'B', false)).toEqual('A C');
      expect(toggleClass('A B B C', 'B', true)).toEqual('A B B C');
    });
  });

  describe('classIndexOf', () => {
    it('should match simple case', () => {
      expect(classIndexOf('A', 'A', 0)).toEqual(0);
      expect(classIndexOf('AA', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_A_', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_ A_', 'A', 0)).toEqual(-1);
      expect(classIndexOf('_ A _', 'A', 0)).toEqual(2);
    });

    it('should not match on partial matches', () => {
      expect(classIndexOf('ABC AB', 'AB', 0)).toEqual(4);
      expect(classIndexOf('AB ABC', 'AB', 1)).toEqual(-1);
      expect(classIndexOf('ABC BC', 'BC', 0)).toEqual(4);
      expect(classIndexOf('BC ABC', 'BB', 1)).toEqual(-1);
    });
  });
});

export function sortedForEach<V>(map: Map<string, V>, fn: (value: V, key: string) => void): void {
  const keys: string[] = [];
  map.forEach((value, key) => keys.push(key));
  keys.sort();
  keys.forEach((key) => fn(map.get(key) !, key));
}
