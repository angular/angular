/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SortedLinkedList} from '../../src/dynamic/linked';

function compareNumbers(a: number, b: number): number {
  if (a < b) {
    return -1;
  } else if (a === b) {
    return 0;
  } else {
    return 1;
  }
}

function expectSequence(list: SortedLinkedList<number>, sequence: number[]) {
  expect(list.length).toBe(sequence.length);
  if (sequence.length === 0) {
    expect(list.head).toBeNull();
    expect(list.tail).toBeNull();
    return;
  }
  let prevNode = null;
  let node = list.head;
  for (let i = 0; i < sequence.length; i++) {
    expect(node).not.toBeNull();
    if (node === null) {
      return;
    }
    expect(node.value).toBe(sequence[i]);
    expect(node.prev).toBe(prevNode);
    prevNode = node;
    node = node.next;
  }
  expect(list.tail).toBe(prevNode);
  expect(node).toBeNull();
}

function insertAll(list: SortedLinkedList<number>, sequence: number[]) {
  sequence.forEach(value => list.insert(value));
}

export function main() {
  describe('dynamic sorted linked list', () => {
    let list: SortedLinkedList<number>;
    beforeEach(() => { list = new SortedLinkedList(compareNumbers); });
    it('starts off correctly allocated', () => { expectSequence(list, []); });
    describe('inserts', () => {
      it('one element', () => {
        list.insert(1);
        expectSequence(list, [1]);
      });
      it('2nd element at tail', () => {
        insertAll(list, [2, 1]);
        expectSequence(list, [1, 2]);
      });
      it('3rd element at tail', () => {
        insertAll(list, [3, 2, 1]);
        expectSequence(list, [1, 2, 3]);
      });
      it('an element in the middle', () => {
        insertAll(list, [3, 1, 2]);
        expectSequence(list, [1, 2, 3]);
      });
    });
    describe('removes', () => {
      it('the head', () => {
        insertAll(list, [1, 2, 3]);
        list.remove(1);
        expectSequence(list, [2, 3]);
      });
      it('the middle', () => {
        insertAll(list, [1, 2, 3]);
        list.remove(2);
        expectSequence(list, [1, 3]);
      });
      it('the tail', () => {
        insertAll(list, [1, 2, 3]);
        list.remove(3);
        expectSequence(list, [1, 2]);
      });
      it('a non-existent element', () => {
        insertAll(list, [1, 2, 3]);
        list.remove(4);
        expectSequence(list, [1, 2, 3]);
      });
      it('the only element', () => {
        list.insert(1);
        list.remove(1);
        expectSequence(list, []);
      });
    })
    it('pops the head element', () => {
      insertAll(list, [1, 2, 3]);
      expect(list.pop()).toBe(1);
      expectSequence(list, [2, 3]);
      expect(list.pop()).toBe(2);
      expectSequence(list, [3]);
      expect(list.pop()).toBe(3);
      expectSequence(list, []);
      expect(list.pop()).toBeNull();
    });
    describe('handles a duplicate element', () => {
      it('at the head', () => {
        insertAll(list, [1, 2, 3, 1]);
        expectSequence(list, [1, 1, 2, 3]);
      });
      it('at the middle', () => {
        insertAll(list, [1, 2, 3, 2]);
        expectSequence(list, [1, 2, 2, 3]);
      });
      it('at the tail', () => {
        insertAll(list, [1, 2, 3, 3]);
        expectSequence(list, [1, 2, 3, 3]);
      });
    });
  });
}
