/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LinkedList, LinkedListNode} from '../../../../../src/render3/view/pipeline/ir/linked_list';

export interface TestNode extends LinkedListNode<TestNode> {
  value: number;
}

function compare(a: TestNode, b: TestNode) {
  if (a.value < b.value) {
    return -1;
  } else if (a.value > b.value) {
    return 1;
  } else {
    return 0;
  }
}

function makeList(...args: number[]): LinkedList<TestNode> {
  const list = new LinkedList<TestNode>();
  for (const arg of args) {
    list.append({
      prev: null,
      next: null,
      value: arg,
    });
  }
  return list;
}

function expectListToEqual(list: LinkedList<TestNode>, expected: number[]): void {
  const actual = Array.from(list).map(n => n.value);
  expect(actual).toEqual(expected);
}

describe('LinkedList', () => {
  describe('sorting', () => {
    it('should sort an entire list', () => {
      const list = makeList(2, 1, 5, 3, 4);
      list.sortSubset(list.head!, list.tail!, compare);
      expectListToEqual(list, [1, 2, 3, 4, 5]);
    });

    it('should sort a middle subset of the list', () => {
      const list = makeList(2, 1, 5, 7, 6, 3, 4);
      list.sortSubset(list.head!.next!, list.tail!.prev!, compare);
      expectListToEqual(list, [2, 1, 3, 5, 6, 7, 4]);
    });

    it('should sort a beginning subset of the list', () => {
      const list = makeList(2, 1, 5, 7, 6, 3, 4);
      list.sortSubset(list.head!, Array.from(list)[4], compare);
      expectListToEqual(list, [1, 2, 5, 6, 7, 3, 4]);
    });

    it('should sort an ending subset of the list', () => {
      const list = makeList(2, 1, 5, 7, 6, 3, 4);
      list.sortSubset(Array.from(list)[3], list.tail!, compare);
      expectListToEqual(list, [2, 1, 5, 3, 4, 6, 7]);
    });
  });
});
