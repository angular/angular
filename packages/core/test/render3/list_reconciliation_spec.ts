/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LiveCollection, reconcile} from '../../src/render3/list_reconciliation';
import {assertDefined} from '../../src/util/assert';

interface ItemAdapter<T, V> {
  create(index: number, value: V): T;
  update(item: T, index: number, value: V): void;
  unwrap(item: T): V;
}

class NoopItemFactory<T, V> implements ItemAdapter<T, V> {
  create(index: number, value: V): T {
    return value as any as T;
  }
  update(item: T, index: number, value: V): void {}

  unwrap(item: T): V {
    return item as any as V;
  }
}

class LoggingLiveCollection<T, V> extends LiveCollection<T, V> {
  operations = {
    at: 0,
    key: 0,
  };

  private logs: any[][] = [];

  constructor(
    private arr: T[],
    private itemFactory: ItemAdapter<T, V> = new NoopItemFactory<T, V>(),
  ) {
    super();
  }

  override get length(): number {
    return this.arr.length;
  }
  override at(index: number): V {
    return this.itemFactory.unwrap(this.getItem(index));
  }
  override attach(index: number, item: T): void {
    this.logs.push(['attach', index, item]);
    this.arr.splice(index, 0, item);
  }
  override detach(index: number): T {
    const item = this.getItem(index);
    this.logs.push(['detach', index, item]);
    this.arr.splice(index, 1);
    return item;
  }
  override create(index: number, value: V): T {
    this.logs.push(['create', index, value]);
    return this.itemFactory.create(index, value);
  }
  override destroy(item: T): void {
    this.logs.push(['destroy', item]);
  }
  override updateValue(index: number, value: V): void {
    this.itemFactory.update(this.getItem(index), index, value);
  }

  getCollection() {
    return this.arr;
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  private getItem(index: number): T {
    this.operations.at++;
    const item = this.arr.at(index);
    assertDefined(item, `Invalid index ${index} - item was undefined`);
    return item;
  }
}

function trackByIdentity<T>(index: number, item: T) {
  return item;
}

function trackByIndex<T>(index: number) {
  return index;
}

describe('list reconciliation', () => {
  describe('fast path', () => {
    it('should do nothing if 2 lists are the same', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, ['a', 'b', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([]);
    });

    it('should add items at the end', () => {
      const pc = new LoggingLiveCollection(['a', 'b']);
      reconcile(pc, ['a', 'b', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['create', 2, 'c'],
        ['attach', 2, 'c'],
      ]);
    });

    it('should swap items', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, ['c', 'b', 'a'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['c', 'b', 'a']);
      // TODO: think of expressing as swap
      expect(pc.getLogs()).toEqual([
        ['detach', 2, 'c'],
        ['detach', 0, 'a'],
        ['attach', 0, 'c'],
        ['attach', 2, 'a'],
      ]);
    });

    it('should should optimally swap adjacent items', () => {
      const pc = new LoggingLiveCollection(['a', 'b']);
      reconcile(pc, ['b', 'a'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['b', 'a']);
      expect(pc.getLogs()).toEqual([
        ['detach', 1, 'b'],
        ['attach', 0, 'b'],
      ]);
    });

    it('should detect moves to the front', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c', 'd']);
      reconcile(pc, ['a', 'd', 'b', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'd', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['detach', 3, 'd'],
        ['attach', 1, 'd'],
      ]);
    });

    it('should delete items in the middle', () => {
      const pc = new LoggingLiveCollection(['a', 'x', 'b', 'c']);
      reconcile(pc, ['a', 'b', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['detach', 1, 'x'],
        ['destroy', 'x'],
      ]);
    });

    it('should delete items from the beginning', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, ['c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['c']);
      expect(pc.getLogs()).toEqual([
        ['detach', 1, 'b'],
        ['destroy', 'b'],
        ['detach', 0, 'a'],
        ['destroy', 'a'],
      ]);
    });

    it('should delete items from the end', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, ['a'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a']);
      expect(pc.getLogs()).toEqual([
        ['detach', 2, 'c'],
        ['destroy', 'c'],
        ['detach', 1, 'b'],
        ['destroy', 'b'],
      ]);
    });

    it('should work with duplicated items', () => {
      const pc = new LoggingLiveCollection(['a', 'a', 'a']);
      reconcile(pc, ['a', 'a', 'a'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'a', 'a']);
      expect(pc.getLogs()).toEqual([]);
    });
  });

  describe('slow path', () => {
    it('should delete multiple items from the middle', () => {
      const pc = new LoggingLiveCollection(['a', 'x1', 'b', 'x2', 'c']);
      reconcile(pc, ['a', 'b', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['detach', 1, 'x1'],
        ['detach', 2, 'x2'],
        ['destroy', 'x2'],
        ['destroy', 'x1'],
      ]);
    });

    it('should add multiple items in the middle', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, ['a', 'n1', 'b', 'n2', 'c'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'n1', 'b', 'n2', 'c']);
      expect(pc.getLogs()).toEqual([
        ['create', 1, 'n1'],
        ['attach', 1, 'n1'],
        ['create', 3, 'n2'],
        ['attach', 3, 'n2'],
      ]);
    });

    it('should go back to the fast path when start / end is different', () => {
      const pc = new LoggingLiveCollection(['s1', 'a', 'b', 'c', 'e1']);
      reconcile(pc, ['s2', 'a', 'b', 'c', 'e2'], trackByIdentity);

      expect(pc.getCollection()).toEqual(['s2', 'a', 'b', 'c', 'e2']);
      expect(pc.getLogs()).toEqual([
        // item gets created at index 0 since we know it is not in the old array
        ['create', 0, 's2'],
        ['attach', 0, 's2'],
        // item at index 1 gets detached since it is not part of the new collection
        ['detach', 1, 's1'],
        // we are on the fast path again, skipping 'a', 'b', 'c'
        // item gets created at index 4 since we know it is not in the old array
        ['create', 4, 'e2'],
        ['attach', 4, 'e2'],
        // the rest gets detached / destroyed
        ['detach', 5, 'e1'],
        ['destroy', 'e1'],
        ['destroy', 's1'],
      ]);
    });

    it('should detect moves to the back', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c', 'd']);
      reconcile(pc, ['b', 'c', 'n1', 'n2', 'n3', 'a', 'd'], trackByIdentity);
      expect(pc.getCollection()).toEqual(['b', 'c', 'n1', 'n2', 'n3', 'a', 'd']);
      expect(pc.getLogs()).toEqual([
        ['detach', 0, 'a'],
        ['create', 2, 'n1'],
        ['attach', 2, 'n1'],
        ['create', 3, 'n2'],
        ['attach', 3, 'n2'],
        ['create', 4, 'n3'],
        ['attach', 4, 'n3'],
        ['attach', 5, 'a'],
      ]);
    });

    it('should create / reuse duplicated items as needed', () => {
      const trackByKey = (idx: number, item: {k: number}) => item.k;
      const pc = new LoggingLiveCollection<{k: number}, {k: number}>([
        {k: 1},
        {k: 1},
        {k: 2},
        {k: 3},
      ]);
      reconcile(pc, [{k: 2}, {k: 3}, {k: 1}, {k: 1}, {k: 1}, {k: 4}], trackByKey);

      expect(pc.getCollection()).toEqual([{k: 2}, {k: 3}, {k: 1}, {k: 1}, {k: 1}, {k: 4}]);
      expect(pc.getLogs()).toEqual([
        ['detach', 0, {k: 1}],
        ['detach', 0, {k: 1}],
        ['attach', 2, {k: 1}],
        ['attach', 3, {k: 1}],
        ['create', 4, {k: 1}],
        ['attach', 4, {k: 1}],
        ['create', 5, {k: 4}],
        ['attach', 5, {k: 4}],
      ]);
    });
  });

  describe('iterables', () => {
    it('should do nothing if 2 lists represented as iterables are the same', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, new Set(['a', 'b', 'c']), trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([]);
    });

    it('should add items at the end', () => {
      const pc = new LoggingLiveCollection(['a', 'b']);
      reconcile(pc, new Set(['a', 'b', 'c']), trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['create', 2, 'c'],
        ['attach', 2, 'c'],
      ]);
    });

    it('should add multiple items in the middle', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, new Set(['a', 'n1', 'b', 'n2', 'c']), trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'n1', 'b', 'n2', 'c']);
      expect(pc.getLogs()).toEqual([
        ['create', 1, 'n1'],
        ['attach', 1, 'n1'],
        ['create', 3, 'n2'],
        ['attach', 3, 'n2'],
      ]);
    });

    it('should delete items from the end', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);
      reconcile(pc, new Set(['a']), trackByIdentity);

      expect(pc.getCollection()).toEqual(['a']);
      expect(pc.getLogs()).toEqual([
        ['detach', 2, 'c'],
        ['destroy', 'c'],
        ['detach', 1, 'b'],
        ['destroy', 'b'],
      ]);
    });

    it('should detect (slow) moves to the front', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c', 'd']);
      reconcile(pc, new Set(['a', 'd', 'b', 'c']), trackByIdentity);

      expect(pc.getCollection()).toEqual(['a', 'd', 'b', 'c']);
      expect(pc.getLogs()).toEqual([
        ['detach', 1, 'b'],
        ['detach', 1, 'c'],
        ['attach', 2, 'b'],
        ['attach', 3, 'c'],
      ]);
    });

    it('should detect (fast) moves to the back', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c', 'd']);
      reconcile(pc, new Set(['b', 'c', 'a', 'd']), trackByIdentity);
      expect(pc.getCollection()).toEqual(['b', 'c', 'a', 'd']);
      expect(pc.getLogs()).toEqual([
        ['detach', 0, 'a'],
        ['attach', 2, 'a'],
      ]);
    });

    it('should allow switching collection types', () => {
      const pc = new LoggingLiveCollection(['a', 'b', 'c']);

      reconcile(pc, new Set(['a', 'b', 'c']), trackByIdentity);
      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([]);

      reconcile(pc, ['a', 'b', 'c'], trackByIdentity);
      expect(pc.getCollection()).toEqual(['a', 'b', 'c']);
      expect(pc.getLogs()).toEqual([]);
    });
  });

  describe('identity and index update', () => {
    interface KeyValueItem<K, V> {
      k: K;
      v: V;
    }

    interface RepeaterLikeItem<T> {
      index: number;
      implicit: T;
    }

    class RepeaterLikeItemFactory<T> implements ItemAdapter<RepeaterLikeItem<T>, T> {
      keySequence = 0;

      create(index: number, value: T): RepeaterLikeItem<T> {
        return {index: index, implicit: value};
      }

      update(item: RepeaterLikeItem<T>, index: number, value: T): void {
        item.index = index;
        item.implicit = value;
      }

      unwrap(item: RepeaterLikeItem<T>): T {
        return item.implicit;
      }
    }

    function trackByKey<K, V>(index: number, item: KeyValueItem<K, V>) {
      return item.k;
    }

    it('should update when tracking by index - fast path from the start', () => {
      const pc = new LoggingLiveCollection([], new RepeaterLikeItemFactory());

      reconcile(pc, ['a', 'b', 'c'], trackByIndex);
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: 'a'},
        {index: 1, implicit: 'b'},
        {index: 2, implicit: 'c'},
      ]);

      reconcile(pc, ['c', 'b', 'a'], trackByIndex);
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: 'c'},
        {index: 1, implicit: 'b'},
        {index: 2, implicit: 'a'},
      ]);
    });

    it('should update when tracking by key - fast path from the end', () => {
      const pc = new LoggingLiveCollection(
        [],
        new RepeaterLikeItemFactory<KeyValueItem<string, string>>(),
      );

      reconcile(pc, [{k: 'o', v: 'o'}], trackByKey);
      expect(pc.getCollection()).toEqual([{index: 0, implicit: {k: 'o', v: 'o'}}]);

      reconcile(
        pc,
        [
          {k: 'n', v: 'n'},
          {k: 'o', v: 'oo'},
        ],
        trackByKey,
      );
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: {k: 'n', v: 'n'}},
        // TODO: this scenario shows situation where the index is not correctly updated
        {index: 0, implicit: {k: 'o', v: 'oo'}},
      ]);
    });

    it('should update when swapping on the fast path', () => {
      const pc = new LoggingLiveCollection(
        [],
        new RepeaterLikeItemFactory<KeyValueItem<number, string>>(),
      );

      reconcile(
        pc,
        [
          {k: 0, v: 'a'},
          {k: 1, v: 'b'},
          {k: 2, v: 'c'},
        ],
        trackByKey as any,
      );
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: {k: 0, v: 'a'}},
        {index: 1, implicit: {k: 1, v: 'b'}},
        {index: 2, implicit: {k: 2, v: 'c'}},
      ]);

      reconcile(
        pc,
        [
          {k: 2, v: 'cc'},
          {k: 1, v: 'bb'},
          {k: 0, v: 'aa'},
        ],
        trackByKey as any,
      );
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: {k: 2, v: 'cc'}},
        {index: 1, implicit: {k: 1, v: 'bb'}},
        {index: 2, implicit: {k: 0, v: 'aa'}},
      ]);
    });

    it('should update when moving forward on the fast path', () => {
      const pc = new LoggingLiveCollection(
        [],
        new RepeaterLikeItemFactory<KeyValueItem<number, string>>(),
      );
      reconcile(
        pc,
        [
          {k: 0, v: 'a'},
          {k: 1, v: 'b'},
          {k: 2, v: 'c'},
          {k: 3, v: 'd'},
        ],
        trackByKey as any,
      );
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: {k: 0, v: 'a'}},
        {index: 1, implicit: {k: 1, v: 'b'}},
        {index: 2, implicit: {k: 2, v: 'c'}},
        {index: 3, implicit: {k: 3, v: 'd'}},
      ]);

      reconcile(
        pc,
        [
          {k: 0, v: 'aa'},
          {k: 3, v: 'dd'},
          {k: 1, v: 'bb'},
          {k: 2, v: 'cc'},
        ],
        trackByKey as any,
      );
      expect(pc.getCollection()).toEqual([
        {index: 0, implicit: {k: 0, v: 'aa'}},
        {index: 1, implicit: {k: 3, v: 'dd'}},
        {index: 2, implicit: {k: 1, v: 'bb'}},
        {index: 3, implicit: {k: 2, v: 'cc'}},
      ]);
    });
  });
});
