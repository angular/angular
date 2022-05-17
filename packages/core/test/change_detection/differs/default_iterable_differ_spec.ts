/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultIterableDiffer, DefaultIterableDifferFactory} from '@angular/core/src/change_detection/differs/default_iterable_differ';

import {TestIterable} from '../../util/iterable';
import {iterableChangesAsString, iterableDifferToString} from '../util';

class ItemWithId {
  constructor(private id: string) {}

  toString() {
    return `{id: ${this.id}}`;
  }
}

class ComplexItem {
  constructor(private id: string, private color: string) {}

  toString() {
    return `{id: ${this.id}, color: ${this.color}}`;
  }
}

type IterableChangeRecord<V> = {
  item: V,
  currentIndex: number|null,
  previousIndex: number|null,
};

// TODO(vicb): UnmodifiableListView / frozen object when implemented
{
  describe('iterable differ', function() {
    describe('DefaultIterableDiffer', function() {
      let differ: DefaultIterableDiffer<any>;

      beforeEach(() => {
        differ = new DefaultIterableDiffer();
      });

      it('should support list and iterables', () => {
        const f = new DefaultIterableDifferFactory();
        expect(f.supports([])).toBeTruthy();
        expect(f.supports(new TestIterable())).toBeTruthy();
        expect(f.supports(new Map())).toBeFalsy();
        expect(f.supports(null)).toBeFalsy();
      });

      it('should support iterables', () => {
        const l: any = new TestIterable();

        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({collection: []}));

        l.list = [1];
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(
                iterableChangesAsString({collection: ['1[null->0]'], additions: ['1[null->0]']}));

        l.list = [2, 1];
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['2[null->0]', '1[0->1]'],
          previous: ['1[0->1]'],
          additions: ['2[null->0]'],
          moves: ['1[0->1]']
        }));
      });

      it('should detect additions', () => {
        const l: any[] = [];
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({collection: []}));

        l.push('a');
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(
                iterableChangesAsString({collection: ['a[null->0]'], additions: ['a[null->0]']}));

        l.push('b');
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(iterableChangesAsString(
                {collection: ['a', 'b[null->1]'], previous: ['a'], additions: ['b[null->1]']}));
      });

      it('should support changing the reference', () => {
        let l = [0];
        differ.check(l);

        l = [1, 0];
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['1[null->0]', '0[0->1]'],
          previous: ['0[0->1]'],
          additions: ['1[null->0]'],
          moves: ['0[0->1]']
        }));

        l = [2, 1, 0];
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['2[null->0]', '1[0->1]', '0[1->2]'],
          previous: ['1[0->1]', '0[1->2]'],
          additions: ['2[null->0]'],
          moves: ['1[0->1]', '0[1->2]']
        }));
      });

      it('should handle swapping element', () => {
        const l = [1, 2];
        differ.check(l);

        l.length = 0;
        l.push(2);
        l.push(1);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['2[1->0]', '1[0->1]'],
          previous: ['1[0->1]', '2[1->0]'],
          moves: ['2[1->0]', '1[0->1]']
        }));
      });

      it('should handle incremental swapping element', () => {
        const l = ['a', 'b', 'c'];
        differ.check(l);

        l.splice(1, 1);
        l.splice(0, 0, 'b');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['b[1->0]', 'a[0->1]', 'c'],
          previous: ['a[0->1]', 'b[1->0]', 'c'],
          moves: ['b[1->0]', 'a[0->1]']
        }));

        l.splice(1, 1);
        l.push('a');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['b', 'c[2->1]', 'a[1->2]'],
          previous: ['b', 'a[1->2]', 'c[2->1]'],
          moves: ['c[2->1]', 'a[1->2]']
        }));
      });

      it('should detect changes in list', () => {
        const l: any[] = [];
        differ.check(l);

        l.push('a');
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(
                iterableChangesAsString({collection: ['a[null->0]'], additions: ['a[null->0]']}));

        l.push('b');
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(iterableChangesAsString(
                {collection: ['a', 'b[null->1]'], previous: ['a'], additions: ['b[null->1]']}));

        l.push('c');
        l.push('d');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['a', 'b', 'c[null->2]', 'd[null->3]'],
          previous: ['a', 'b'],
          additions: ['c[null->2]', 'd[null->3]']
        }));

        l.splice(2, 1);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['a', 'b', 'd[3->2]'],
          previous: ['a', 'b', 'c[2->null]', 'd[3->2]'],
          moves: ['d[3->2]'],
          removals: ['c[2->null]']
        }));

        l.length = 0;
        l.push('d');
        l.push('c');
        l.push('b');
        l.push('a');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['d[2->0]', 'c[null->1]', 'b[1->2]', 'a[0->3]'],
          previous: ['a[0->3]', 'b[1->2]', 'd[2->0]'],
          additions: ['c[null->1]'],
          moves: ['d[2->0]', 'b[1->2]', 'a[0->3]']
        }));
      });

      it('should ignore [NaN] != [NaN]', () => {
        const l = [NaN];
        differ.check(l);
        differ.check(l);
        expect(iterableDifferToString(differ))
            .toEqual(iterableChangesAsString({collection: [NaN], previous: [NaN]}));
      });

      it('should detect [NaN] moves', () => {
        const l: any[] = [NaN, NaN];
        differ.check(l);

        l.unshift('foo');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['foo[null->0]', 'NaN', 'NaN[0->2]'],
          previous: ['NaN[0->2]', 'NaN'],
          additions: ['foo[null->0]'],
          moves: ['NaN[0->2]']
        }));
      });

      it('should remove and add same item', () => {
        const l = ['a', 'b', 'c'];
        differ.check(l);

        l.splice(1, 1);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['a', 'c[2->1]'],
          previous: ['a', 'b[1->null]', 'c[2->1]'],
          moves: ['c[2->1]'],
          removals: ['b[1->null]']
        }));

        l.splice(1, 0, 'b');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['a', 'b[null->1]', 'c[1->2]'],
          previous: ['a', 'c[1->2]'],
          additions: ['b[null->1]'],
          moves: ['c[1->2]']
        }));
      });

      it('should not report unnecessary moves', () => {
        const l = ['a', 'b', 'c'];
        differ.check(l);

        l.length = 0;
        l.push('b');
        l.push('a');
        l.push('c');
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['b[1->0]', 'a[0->1]', 'c'],
          previous: ['a[0->1]', 'b[1->0]', 'c'],
          moves: ['b[1->0]', 'a[0->1]']
        }));
      });

      describe('with duplicates', () => {
        it('should support replacements', () => {
          const l = ['a', '*', '*', 'd', '-', '-', '-', 'e'];
          differ.check(l);
          l[1] = 'b';
          l[5] = 'c';
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: ['a', 'b[null->1]', '*', 'd', '-', 'c[null->5]', '-', 'e'],
            previous: ['a', '*[1->null]', '*', 'd', '-', '-[5->null]', '-', 'e'],
            additions: ['b[null->1]', 'c[null->5]'],
            removals: ['*[1->null]', '-[5->null]'],
          }));
        });

        it('should support insertions and moves', () => {
          const l = ['a', 'a', 'b', 'b'];
          differ.check(l);
          l.splice(0, 0, 'b');
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: ['b[2->0]', 'a', 'a[0->2]', 'b', 'b[null->4]'],
            previous: ['a[0->2]', 'a', 'b[2->0]', 'b'],
            additions: ['b[null->4]'],
            moves: ['b[2->0]', 'a[0->2]']
          }));
        });

        it('should support removals and moves', () => {
          const l = ['a', 'a', 'a', 'b', 'b'];
          differ.check(l);
          l.splice(0, 1);
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: ['a', 'a', 'b[4->2]', 'b'],
            previous: ['a', 'a', 'a[2->null]', 'b', 'b[4->2]'],
            moves: ['b[4->2]'],
            removals: ['a[2->null]']
          }));
        });

        it('should support a mix of all operations', () => {
          let l = ['a', 'b', 'c', 'c', 'a', 'a', 'b', 'e', 'd'];
          differ.check(l);
          l = ['d', 'd', 'f', 'b', 'b', 'a', 'a', 'c'];
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: [
              'd[8->0]', 'd[null->1]', 'f[null->2]', 'b[1->3]', 'b[6->4]', 'a', 'a[0->6]', 'c[2->7]'
            ],
            previous: [
              'a[0->6]', 'b[1->3]', 'c[2->7]', 'c[3->null]', 'a[4->null]', 'a', 'b[6->4]',
              'e[7->null]', 'd[8->0]'
            ],
            moves: ['d[8->0]', 'b[1->3]', 'b[6->4]', 'a[0->6]', 'c[2->7]'],
            additions: ['d[null->1]', 'f[null->2]'],
            removals: ['c[3->null]', 'a[4->null]', 'e[7->null]']
          }));
        });

        it('should find removal at correct index when replacing an item', () => {
          let l = ['a', 'a', 'a', 'a', 'a'];
          differ.check(l);
          l = ['a', 'a', 'b', 'a', 'a'];
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: ['a', 'a', 'b[null->2]', 'a', 'a'],
            previous: ['a', 'a', 'a[2->null]', 'a', 'a'],
            additions: ['b[null->2]'],
            removals: ['a[2->null]']
          }));
        });

        it('should not find moves when no items have moved', () => {
          let l = ['a', 'a', 'a', 'b', 'b'];
          differ.check(l);
          l = ['b', 'a', 'a', 'b', 'b'];
          differ.check(l);
          expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
            collection: ['b[null->0]', 'a', 'a', 'b', 'b'],
            previous: ['a[0->null]', 'a', 'a', 'b', 'b'],
            additions: ['b[null->0]'],
            removals: ['a[0->null]']
          }));
        });
      });

      describe('forEachOperation', () => {
        function stringifyItemChange(
            record: IterableChangeRecord<any>, p: number|null, c: number|null,
            originalIndex: number|null) {
          const suffix = originalIndex == null ? '' : ' [o=' + originalIndex + ']';
          const value = record.item;
          if (record.currentIndex == null) {
            return `REMOVE ${value} (${p} -> VOID)${suffix}`;
          } else if (record.previousIndex == null) {
            return `INSERT ${value} (VOID -> ${c})${suffix}`;
          } else {
            return `MOVE ${value} (${p} -> ${c})${suffix}`;
          }
        }

        function modifyArrayUsingOperation(
            arr: number[], item: number, prev: number|null, next: number|null) {
          let value: number = null!;
          // Either prev or next will not be null
          if (prev == null) {
            arr.splice(next!, 0, item);
          } else if (next == null) {
            value = arr[prev];
            arr.splice(prev, 1);
          } else {
            value = arr[prev];
            arr.splice(prev, 1);
            arr.splice(next, 0, value);
          }
          return value;
        }

        it('should trigger a series of insert/move/remove changes for inputs that have been diffed',
           () => {
             const startData = [0, 1, 2, 3, 4, 5];
             const endData = [6, 2, 7, 0, 4, 8];

             differ = differ.diff(startData)!;
             differ = differ.diff(endData)!;

             const operations: string[] = [];
             differ.forEachOperation(
                 (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                   modifyArrayUsingOperation(startData, record.item, prev, next);
                   operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
                 });

             expect(operations).toEqual([
               'INSERT 6 (VOID -> 0)', 'MOVE 0 (1 -> 3) [o=0]', 'REMOVE 1 (1 -> VOID) [o=1]',
               'INSERT 7 (VOID -> 2)', 'REMOVE 3 (4 -> VOID) [o=3]', 'INSERT 8 (VOID -> 5)',
               'REMOVE 5 (6 -> VOID) [o=5]'
             ]);

             expect(startData).toEqual(endData);
           });

        it('should consider inserting/removing/moving items with respect to items that have not moved at all',
           () => {
             const startData = [0, 1, 2, 3];
             const endData = [2, 1];

             differ = differ.diff(startData)!;
             differ = differ.diff(endData)!;

             const operations: string[] = [];
             differ.forEachOperation(
                 (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                   modifyArrayUsingOperation(startData, record.item, prev, next);
                   operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
                 });

             expect(operations).toEqual([
               'REMOVE 0 (0 -> VOID) [o=0]', 'MOVE 2 (1 -> 0) [o=2]', 'REMOVE 3 (2 -> VOID) [o=3]'
             ]);

             expect(startData).toEqual(endData);
           });

        it('should be able to manage operations within a criss/cross of move operations', () => {
          const startData = [1, 2, 3, 4, 5, 6];
          const endData = [3, 6, 4, 9, 1, 2];

          differ = differ.diff(startData)!;
          differ = differ.diff(endData)!;

          const operations: string[] = [];
          differ.forEachOperation(
              (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                modifyArrayUsingOperation(startData, record.item, prev, next);
                operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
              });

          expect(operations).toEqual([
            'MOVE 3 (2 -> 0) [o=2]', 'MOVE 1 (1 -> 3) [o=0]', 'MOVE 6 (5 -> 1) [o=5]',
            'MOVE 2 (2 -> 5) [o=1]', 'INSERT 9 (VOID -> 3)', 'REMOVE 5 (5 -> VOID) [o=4]'
          ]);

          expect(startData).toEqual(endData);
        });

        it('should skip moves for multiple nodes that have not moved', () => {
          const startData = [0, 1, 2, 3, 4];
          const endData = [4, 1, 2, 3, 0, 5];

          differ = differ.diff(startData)!;
          differ = differ.diff(endData)!;

          const operations: string[] = [];
          differ.forEachOperation(
              (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                modifyArrayUsingOperation(startData, record.item, prev, next);
                operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
              });

          expect(operations).toEqual([
            'MOVE 4 (4 -> 0) [o=4]', 'MOVE 0 (1 -> 4) [o=0]', 'INSERT 5 (VOID -> 5)'
          ]);

          expect(startData).toEqual(endData);
        });

        it('should not fail', () => {
          const startData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
          const endData = [10, 11, 1, 5, 7, 8, 0, 5, 3, 6];

          differ = differ.diff(startData)!;
          differ = differ.diff(endData)!;

          const operations: string[] = [];
          differ.forEachOperation(
              (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                modifyArrayUsingOperation(startData, record.item, prev, next);
                operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
              });

          expect(operations).toEqual([
            'MOVE 10 (10 -> 0) [o=10]', 'MOVE 0 (1 -> 6) [o=0]', 'MOVE 11 (11 -> 1) [o=11]',
            'REMOVE 2 (3 -> VOID) [o=2]', 'MOVE 5 (5 -> 3) [o=5]', 'MOVE 3 (4 -> 8) [o=3]',
            'REMOVE 4 (4 -> VOID) [o=4]', 'MOVE 7 (6 -> 4) [o=7]', 'MOVE 8 (8 -> 5) [o=8]',
            'MOVE 6 (7 -> 8) [o=6]', 'INSERT 5 (VOID -> 7)', 'REMOVE 9 (10 -> VOID) [o=9]'
          ]);

          expect(startData).toEqual(endData);
        });

        it('should trigger nothing when the list is completely full of replaced items that are tracked by the index',
           () => {
             differ = new DefaultIterableDiffer((index: number) => index);

             const startData = [1, 2, 3, 4];
             const endData = [5, 6, 7, 8];

             differ = differ.diff(startData)!;
             differ = differ.diff(endData)!;

             const operations: string[] = [];
             differ.forEachOperation(
                 (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                   modifyArrayUsingOperation(startData, record.item, prev, next);
                   operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
                 });

             expect(operations).toEqual([]);
           });

        it('should trigger only two moves when swapping first and last elements', () => {
          const startData = [0, 1, 2, 3, 4, 5, 6];
          const endData = [6, 1, 2, 3, 4, 5, 0];

          differ = differ.diff(startData)!;
          differ = differ.diff(endData)!;

          const operations: string[] = [];
          differ.forEachOperation(
              (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                modifyArrayUsingOperation(startData, record.item, prev, next);
                operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
              });

          expect(operations).toEqual(['MOVE 6 (6 -> 0) [o=6]', 'MOVE 0 (1 -> 6) [o=0]']);

          expect(startData).toEqual(endData);
        });

        describe('with duplicates', () => {
          it('should delete correct item when replacing', () => {
            const startData = [0, 0, 0, 0, 0, 0];
            const endData = [0, 0, 1, 0, 0, 0];

            differ = differ.diff(startData)!;
            differ = differ.diff(endData)!;

            const operations: string[] = [];
            differ.forEachOperation(
                (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                  modifyArrayUsingOperation(startData, record.item, prev, next);
                  operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
                });

            expect(operations).toEqual(['INSERT 1 (VOID -> 2)', 'REMOVE 0 (3 -> VOID) [o=2]']);

            expect(startData).toEqual(endData);
          });

          it('should not perform moves when no items have moved', () => {
            const startData = [0, 1, 1, 0];
            const endData = [1, 1, 1, 0];

            differ = differ.diff(startData)!;
            differ = differ.diff(endData)!;

            const operations: string[] = [];
            differ.forEachOperation(
                (record: IterableChangeRecord<number>, prev: number|null, next: number|null) => {
                  modifyArrayUsingOperation(startData, record.item, prev, next);
                  operations.push(stringifyItemChange(record, prev, next, record.previousIndex));
                });

            expect(operations).toEqual(['INSERT 1 (VOID -> 0)', 'REMOVE 0 (1 -> VOID) [o=0]']);

            expect(startData).toEqual(endData);
          });
        });
      });

      describe('diff', () => {
        it('should return self when there is a change', () => {
          expect(differ.diff(['a', 'b'])).toBe(differ);
        });

        it('should return null when there is no change', () => {
          differ.diff(['a', 'b']);
          expect(differ.diff(['a', 'b'])).toEqual(null);
        });

        it('should treat null as an empty list', () => {
          differ.diff(['a', 'b']);
          expect(iterableDifferToString(differ.diff(null!)!)).toEqual(iterableChangesAsString({
            previous: ['a[0->null]', 'b[1->null]'],
            removals: ['a[0->null]', 'b[1->null]']
          }));
        });

        it('should throw when given an invalid collection', () => {
          expect(() => differ.diff('invalid')).toThrowError(/Error trying to diff 'invalid'/);
        });
      });
    });

    describe('trackBy function by id', function() {
      let differ: any;

      const trackByItemId = (index: number, item: any): any => item.id;

      const buildItemList = (list: string[]) => list.map((val) => new ItemWithId(val));

      beforeEach(() => {
        differ = new DefaultIterableDiffer(trackByItemId);
      });

      it('should treat the collection as dirty if identity changes', () => {
        differ.diff(buildItemList(['a']));
        expect(differ.diff(buildItemList(['a']))).toBe(differ);
      });

      it('should treat seen records as identity changes, not additions', () => {
        let l = buildItemList(['a', 'b', 'c']);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: [`{id: a}[null->0]`, `{id: b}[null->1]`, `{id: c}[null->2]`],
          additions: [`{id: a}[null->0]`, `{id: b}[null->1]`, `{id: c}[null->2]`]
        }));

        l = buildItemList(['a', 'b', 'c']);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: [`{id: a}`, `{id: b}`, `{id: c}`],
          identityChanges: [`{id: a}`, `{id: b}`, `{id: c}`],
          previous: [`{id: a}`, `{id: b}`, `{id: c}`]
        }));
      });

      it('should have updated properties in identity change collection', () => {
        let l = [new ComplexItem('a', 'blue'), new ComplexItem('b', 'yellow')];
        differ.check(l);

        l = [new ComplexItem('a', 'orange'), new ComplexItem('b', 'red')];
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: [`{id: a, color: orange}`, `{id: b, color: red}`],
          identityChanges: [`{id: a, color: orange}`, `{id: b, color: red}`],
          previous: [`{id: a, color: orange}`, `{id: b, color: red}`]
        }));
      });

      it('should track moves normally', () => {
        let l = buildItemList(['a', 'b', 'c']);
        differ.check(l);

        l = buildItemList(['b', 'a', 'c']);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['{id: b}[1->0]', '{id: a}[0->1]', '{id: c}'],
          identityChanges: ['{id: b}[1->0]', '{id: a}[0->1]', '{id: c}'],
          previous: ['{id: a}[0->1]', '{id: b}[1->0]', '{id: c}'],
          moves: ['{id: b}[1->0]', '{id: a}[0->1]']
        }));
      });

      it('should track duplicate moves normally', () => {
        let l = buildItemList(['a', 'a']);
        differ.check(l);

        l = buildItemList(['b', 'a', 'a']);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['{id: b}[null->0]', '{id: a}', '{id: a}[0->2]'],
          identityChanges: ['{id: a}', '{id: a}[0->2]'],
          previous: ['{id: a}[0->2]', '{id: a}'],
          moves: ['{id: a}[0->2]'],
          additions: ['{id: b}[null->0]']
        }));
      });

      it('should keep the order of duplicates', () => {
        const l1 = [
          new ComplexItem('a', 'blue'),
          new ComplexItem('b', 'yellow'),
          new ComplexItem('c', 'orange'),
          new ComplexItem('a', 'red'),
        ];
        differ.check(l1);

        const l2 = [
          new ComplexItem('b', 'yellow'),
          new ComplexItem('a', 'blue'),
          new ComplexItem('c', 'orange'),
          new ComplexItem('a', 'red'),
        ];
        differ.check(l2);

        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: [
            '{id: b, color: yellow}[1->0]', '{id: a, color: blue}[0->1]', '{id: c, color: orange}',
            '{id: a, color: red}'
          ],
          identityChanges: [
            '{id: b, color: yellow}[1->0]', '{id: a, color: blue}[0->1]', '{id: c, color: orange}',
            '{id: a, color: red}'
          ],
          previous: [
            '{id: a, color: blue}[0->1]', '{id: b, color: yellow}[1->0]', '{id: c, color: orange}',
            '{id: a, color: red}'
          ],
          moves: ['{id: b, color: yellow}[1->0]', '{id: a, color: blue}[0->1]'],
        }));
      });

      it('should not have identity changed', () => {
        const l1 = [
          new ComplexItem('a', 'blue'),
          new ComplexItem('b', 'yellow'),
          new ComplexItem('c', 'orange'),
          new ComplexItem('a', 'red'),
        ];
        differ.check(l1);

        const l2 = [l1[1], l1[0], l1[2], l1[3]];
        differ.check(l2);

        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: [
            '{id: b, color: yellow}[1->0]', '{id: a, color: blue}[0->1]', '{id: c, color: orange}',
            '{id: a, color: red}'
          ],
          previous: [
            '{id: a, color: blue}[0->1]', '{id: b, color: yellow}[1->0]', '{id: c, color: orange}',
            '{id: a, color: red}'
          ],
          moves: ['{id: b, color: yellow}[1->0]', '{id: a, color: blue}[0->1]'],
        }));
      });

      it('should track removals normally', () => {
        const l = buildItemList(['a', 'b', 'c']);
        differ.check(l);

        l.splice(2, 1);
        differ.check(l);
        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['{id: a}', '{id: b}'],
          previous: ['{id: a}', '{id: b}', '{id: c}[2->null]'],
          removals: ['{id: c}[2->null]']
        }));
      });
    });

    describe('trackBy function by index', function() {
      let differ: DefaultIterableDiffer<string>;

      const trackByIndex = (index: number, item: any): number => index;

      beforeEach(() => {
        differ = new DefaultIterableDiffer(trackByIndex);
      });

      it('should track removals normally', () => {
        differ.check(['a', 'b', 'c', 'd']);
        differ.check(['e', 'f', 'g', 'h']);
        differ.check(['e', 'f', 'h']);

        expect(iterableDifferToString(differ)).toEqual(iterableChangesAsString({
          collection: ['e', 'f', 'h'],
          previous: ['e', 'f', 'h', 'h[3->null]'],
          removals: ['h[3->null]'],
          identityChanges: ['h']
        }));
      });
    });
  });
}
