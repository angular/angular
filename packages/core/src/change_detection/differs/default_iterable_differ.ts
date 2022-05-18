/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {isListLikeIterable, iterateListLike} from '../../util/iterable';
import {stringify} from '../../util/stringify';

import {IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, NgIterable, TrackByFunction} from './iterable_differs';


export class DefaultIterableDifferFactory implements IterableDifferFactory {
  constructor() {}
  supports(obj: Object|null|undefined): boolean {
    return isListLikeIterable(obj);
  }

  create<V>(trackByFn?: TrackByFunction<V>): DefaultIterableDiffer<V> {
    return new DefaultIterableDiffer<V>(trackByFn);
  }
}

const trackByIdentity = (index: number, item: any) => item;

/**
 * @deprecated v4.0.0 - Should not be part of public API.
 * @publicApi
 */
export class DefaultIterableDiffer<V> implements IterableDiffer<V>, IterableChanges<V> {
  private _length = 0;
  get length() {
    return this._length;
  }
  private _collection: V[]|Iterable<V>|null = null;
  get collection() {
    return this._collection;
  }
  /** The previous list of change records */
  private _previousItems = new _LinkedList<_IterableChangeRecord<V>>();
  /** The current list of change records */
  private _currentItems = new _LinkedList<_IterableChangeRecord<V>>();
  /** The list of records added to the collection, sorted by current index, ascending */
  private _addedItems = new _LinkedList<_IterableChangeRecord<V>>();
  /** The list of records removed from the collection, sorted by previous index, ascending */
  private _removedItems = new _LinkedList<_IterableChangeRecord<V>>();
  /** The list of records moved within the collection, sorted by current index, ascending */
  private _movedItems = new _LinkedList<_IterableChangeRecord<V>>();
  /** The list of records with object identity changes, sorted by current index, ascending */
  private _identityChanges = new _LinkedList<_IterableChangeRecord<V>>();
  /** Operations performed at each index, if any */
  private _operations: {[key: number]: _Operations|undefined} = {};
  /** Generates an identity for each item - may be different from object identity */
  private _trackByFn: TrackByFunction<V>;

  constructor(trackByFn?: TrackByFunction<V>) {
    this._trackByFn = trackByFn || trackByIdentity;
  }

  forEachItem(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._currentItems.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  forEachOperation(
      fn:
          (record: IterableChangeRecord<V>, previousIndex: number|null,
           currentIndex: number|null) => void) {
    /**
     * Used to track how far items have shifted within the original iterable as
     * a result of previous operations. The offset applies to indices >= the current index.
     */
    let totalOffset: number = 0;
    let currItemNode: _Node<_IterableChangeRecord<V>>|null = this._currentItems.head;
    let prevItemNode: _Node<_IterableChangeRecord<V>>|null = this._previousItems.head;
    let index: number = 0;

    while (currItemNode !== null || prevItemNode !== null) {
      const currOps = this._operations[index];
      if (currOps !== undefined) {
        // Adjust for previous moves to / from this index
        if (currOps.moveTo !== null && currOps.moveTo < index) totalOffset--;
        if (currOps.moveFrom !== null && currOps.moveFrom < index) totalOffset++;

        // Check if a new item needs to be added to this index
        if (currOps.add) {
          // Guaranteed to be a current item here since there is an add
          fn(currItemNode!.value, null, index);
          totalOffset++;
        }
        // Check if a previous item needs to be removed from this index
        if (currOps.remove) {
          // Guaranteed to be a previous item here since there is a removal
          fn(prevItemNode!.value, index + totalOffset, null);
          totalOffset--;
        }

        // Only perform moves such that items come from / go to indices greater than current
        // This ensures items to the left of the current index have no offset

        // Check if a previous item needs to be moved to this index
        if (currOps.moveFrom !== null && currOps.moveFrom > index) {
          // Adjust moveFrom to where the item actually is
          // Only need to adjust for operations that have already happened, up to that index
          let adjustedMoveFrom: number = currOps.moveFrom + totalOffset;
          for (let i = index + 1; i <= currOps.moveFrom; i++) {
            const nextOps = this._operations[i];
            if (nextOps === undefined) continue;
            if (nextOps.moveTo !== null && nextOps.moveTo < index) adjustedMoveFrom--;
            if (nextOps.moveFrom !== null && nextOps.moveFrom < index) adjustedMoveFrom++;
          }
          // No-op if the item is already at the correct index
          if (adjustedMoveFrom !== index) {
            // Guaranteed to be a current item here since there is a move to here
            fn(currItemNode!.value, adjustedMoveFrom, index);
          }
          totalOffset++;
        }

        // Check if a previous item needs to be moved from this index
        if (currOps.moveTo !== null && currOps.moveTo > index) {
          const adjustedMoveFromIndex: number = index + totalOffset;
          // Adjust the moveToIndex such that the item will end up at the correct index
          // Only need to adjust for operations that haven't happened yet, between here and there
          let adjustedMoveToIndex: number = currOps.moveTo;
          for (let i = index + 1; i < currOps.moveTo; i++) {
            const nextOps = this._operations[i];
            if (nextOps === undefined) continue;
            if (nextOps.add) adjustedMoveToIndex--;
            if (nextOps.remove) adjustedMoveToIndex++;
            if (nextOps.moveTo !== null && nextOps.moveTo > index) adjustedMoveToIndex++;
            if (nextOps.moveFrom !== null && nextOps.moveFrom > index) adjustedMoveToIndex--;
          }
          // No-op if the item is already at the correct index
          if (adjustedMoveFromIndex !== adjustedMoveToIndex) {
            // Guaranteed to be a previous item here since there is a move from here
            fn(prevItemNode!.value, adjustedMoveFromIndex, adjustedMoveToIndex);
          }
          totalOffset--;
        }
      }

      index++;
      if (currItemNode !== null) currItemNode = currItemNode.next;
      if (prevItemNode !== null) prevItemNode = prevItemNode.next;
    }
  }

  forEachPreviousItem(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._previousItems.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  forEachAddedItem(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._addedItems.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  forEachMovedItem(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._movedItems.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  forEachRemovedItem(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._removedItems.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  forEachIdentityChange(fn: (record: _IterableChangeRecord<V>) => void) {
    let node: _Node<_IterableChangeRecord<V>>|null;
    for (node = this._identityChanges.head; node !== null; node = node.next) {
      fn(node.value);
    }
  }

  diff(collection: NgIterable<V>|null|undefined): DefaultIterableDiffer<V>|null {
    if (collection == null) collection = [];
    if (!isListLikeIterable(collection)) {
      const errorMessage = (typeof ngDevMode === 'undefined' || ngDevMode) ?
          `Error trying to diff '${stringify(collection)}'. Only arrays and iterables are allowed` :
          '';
      throw new RuntimeError(RuntimeErrorCode.INVALID_DIFFER_INPUT, errorMessage);
    }

    if (this.check(collection)) {
      return this;
    } else {
      return null;
    }
  }

  onDestroy() {}

  check(collection: NgIterable<V>): boolean {
    this._reset();

    /** Stores identity changes of unmoved items so they can be sorted with moved items later */
    const identityChanges = new _Queue<_IterableChangeRecord<V>>();
    /** Stores changed nodes, could contain additions or moves */
    const changedNodes = new _Queue<_Node<_IterableChangeRecord<V>>>();
    /** Stores old records from changed nodes, mapped by trackById, could be deleted or moved */
    const oldRecords = new _QueueMap<any, _IterableChangeRecord<V>>();
    /**
     * Keys that were enqueued to oldRecords, mapped by previous index
     * This allows both iterating by index and deleting keys by index, which is needed later
     */
    const oldRecordKeys = new Map<number, any>();

    let node: _Node<_IterableChangeRecord<V>>|null = this._currentItems.head;
    let index = 0;

    iterateListLike(collection, (item: V) => {
      if (node !== null && index !== 0) node = node.next;
      const itemTrackBy: any = this._trackByFn(index, item);
      // Add items to the tail if we've reached the end of current items
      if (node === null) {
        const newRecord = new _IterableChangeRecord(item, itemTrackBy, index);
        node = this._currentItems.addLast(newRecord);
        changedNodes.enqueue(node);
      }
      // Mismatch between new collection and current items
      else if (!Object.is(node.value.trackById, itemTrackBy)) {
        // Mark that this record is no longer here, not sure if it's a move or remove yet
        oldRecords.enqueue(node.value.trackById, node.value);
        oldRecordKeys.set(index, node.value.trackById);
        // Insert a new record for now, not sure if it's an add or move yet
        node.value = new _IterableChangeRecord<V>(item, itemTrackBy, index);
        changedNodes.enqueue(node);
      }
      // trackById matches, but object identity has changed
      else if (!Object.is(node.value.item, item)) {
        node.value.item = item;
        identityChanges.enqueue(node.value);
      }
      index++;
    });

    const newLength = index;

    // Process any remaining nodes if the current list is longer than the new collection
    if (node !== null && newLength < this._length) {
      let oldNode: _Node<_IterableChangeRecord<V>>|null;
      // If new collection is empty, remove everything including the head
      if (newLength === 0) {
        this._currentItems.clear();
        oldNode = node;
      }
      // Otherwise everything after current node is removed
      else {
        this._currentItems.tail = node;
        oldNode = node.next;
        node.next = null;
      }
      while (oldNode !== null) {
        // Mark that this record is no longer here, not sure if it's a move or remove yet
        oldRecords.enqueue(oldNode.value.trackById, oldNode.value);
        oldRecordKeys.set(index++, oldNode.value.trackById);
        oldNode = oldNode.next;
      }
    }

    this._length = newLength;
    this._collection = collection;
    this._findOperations(changedNodes, oldRecords, oldRecordKeys, identityChanges);
    return this._isDirty();
  }

  /**
   * Finds add, remove, and move operations, populating the appropriate instance properties.
   * If an item has been both added and removed, it is considered to be moved.
   *
   * @param changedNodes Nodes that contain records they did not previously,
   *     these could be additions or moves. Node records must have non-null current index.
   * @param oldRecords Items that no longer exist at their previous node, mapped to their
   *     trackByIds, these could be removals or moves. Records must have non-null previous index.
   * @param oldRecordKeys The trackByIds that were added to removalsMap, mapped by index that the
   *     item was removed from. Keys must have been added in order of previous index, ascending.
   * @param identityChanges Unmoved records that have the same trackById, but different object
   *     identities. Must be in order of current index, ascending.
   */
  private _findOperations(
      changedNodes: _Queue<_Node<_IterableChangeRecord<V>>>,
      oldRecords: _QueueMap<any, _IterableChangeRecord<V>>, oldRecordKeys: Map<number, any>,
      identityChanges: _Queue<_IterableChangeRecord<V>>): void {
    // Dequeue changedNodes and look for matching old records
    let changedNode: _Node<_IterableChangeRecord<V>>|null = changedNodes.dequeue();
    let nextIdChange: _IterableChangeRecord<V>|null = identityChanges.dequeue();
    while (changedNode !== null) {
      const trackById = changedNode.value.trackById;
      const currentIndex = changedNode.value.currentIndex!;
      const oldRecord: _IterableChangeRecord<V>|null = oldRecords.dequeue(trackById);
      // Found a matching old record - consider it to have been moved here
      if (oldRecord !== null) {
        const previousIndex: number = oldRecord.previousIndex!;
        oldRecordKeys.delete(previousIndex);
        // Check for identity change
        if (!Object.is(changedNode.value.item, oldRecord.item)) {
          // Dequeue any identity changes with smaller index before adding this one
          while (nextIdChange !== null && nextIdChange.currentIndex! < currentIndex) {
            this._identityChanges.addLast(nextIdChange);
            nextIdChange = identityChanges.dequeue();
          }
          oldRecord.item = changedNode.value.item;
          this._identityChanges.addLast(oldRecord);
        }
        oldRecord.currentIndex = currentIndex;
        changedNode.value = oldRecord;
        this._movedItems.addLast(oldRecord);
        this._updateOperations(currentIndex, {moveFrom: previousIndex});
        this._updateOperations(previousIndex, {moveTo: currentIndex});
      }
      // No match, consider this a new item
      else {
        this._addedItems.addLast(changedNode.value);
        this._updateOperations(currentIndex, {add: true});
      }
      changedNode = changedNodes.dequeue();
    }

    // Dequeue leftovers in oldRecords - these are all removed items
    // oldRecordKeys are in order of index, so iterating through them yields a sorted list
    const remIndexIterator: IterableIterator<number> = oldRecordKeys.keys();
    let nextRemIndex: IteratorResult<number, any> = remIndexIterator.next();
    while (nextRemIndex.done !== true) {
      const remKey: any = oldRecordKeys.get(nextRemIndex.value);
      const removed: _IterableChangeRecord<V> = oldRecords.dequeue(remKey)!;
      removed.currentIndex = null;
      this._removedItems.addLast(removed);
      this._updateOperations(removed.previousIndex!, {remove: true});
      nextRemIndex = remIndexIterator.next();
    }

    // Dequeue leftover identity changes
    while (nextIdChange !== null) {
      this._identityChanges.addLast(nextIdChange);
      nextIdChange = identityChanges.dequeue();
    }
  }

  /** Initializes operations if necessary and updates the object's properties */
  private _updateOperations(index: number, newOps: {
    add?: boolean,
    remove?: boolean,
    moveTo?: number,
    moveFrom?: number,
  }) {
    if (this._operations[index] === undefined) this._operations[index] = new _Operations();
    const ops = this._operations[index]!;
    if (newOps.add !== undefined) ops.add = newOps.add;
    if (newOps.remove !== undefined) ops.remove = newOps.remove;
    if (newOps.moveFrom !== undefined) ops.moveFrom = newOps.moveFrom;
    if (newOps.moveTo !== undefined) ops.moveTo = newOps.moveTo;
  }

  /** If there are any additions, moves, removals, or identity changes. */
  private _isDirty(): boolean {
    return (
        !this._addedItems.isEmpty() || !this._movedItems.isEmpty() ||
        !this._removedItems.isEmpty() || !this._identityChanges.isEmpty());
  }

  /**
   * Clear all change tracking instance properties, set previous indices to current indices,
   * populate previous items list
   */
  private _reset(): void {
    if (this._isDirty()) {
      this._addedItems.clear();
      this._removedItems.clear();
      this._movedItems.clear();
      this._identityChanges.clear();
      this._previousItems.clear();
      this._operations = {};

      for (let node = this._currentItems.head; node != null; node = node.next) {
        node.value.previousIndex = node.value.currentIndex;
        this._previousItems.addLast(node.value);
      }
    }
  }
}

/** Record of an item's identity and indices */
class _IterableChangeRecord<V> implements IterableChangeRecord<V> {
  previousIndex: number|null = null;
  constructor(public item: V, public trackById: any, public currentIndex: number|null) {}
}

/** Represents operations that occur at an index */
class _Operations {
  add: boolean = false;
  remove: boolean = false;
  moveTo: number|null = null;
  moveFrom: number|null = null;
}


/** Singly linked node */
class _Node<T> {
  next: _Node<T>|null = null;
  constructor(public value: T) {}
}

/** Singly linked list */
class _LinkedList<T> {
  head: _Node<T>|null = null;
  tail: _Node<T>|null = null;

  addLast(value: T): _Node<T> {
    const node = new _Node(value);
    if (this.tail === null) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    return node;
  }

  clear(): void {
    this.head = this.tail = null;
  }

  isEmpty(): boolean {
    return this.head === null;
  }
}

/** First-in first-out queue */
class _Queue<T> {
  private _head: _Node<T>|null = null;
  private _tail: _Node<T>|null = null;

  enqueue(item: T): void {
    if (this._tail === null) {
      this._head = this._tail = new _Node<T>(item);
    } else {
      const node = new _Node<T>(item);
      this._tail.next = node;
      this._tail = node;
    }
  }

  dequeue(): T|null {
    if (this._head === null) return null;
    const item: T = this._head.value;
    this._head = this._head.next;
    if (this._head === null) this._tail = null;
    return item;
  }

  isEmpty(): boolean {
    return this._head === null;
  }
}

/** Stores duplicate values in a Map by adding them to a queue */
class _QueueMap<K, T> {
  private _map = new Map<K, _Queue<T>>();

  enqueue(key: K, item: T): void {
    let queue: _Queue<T>|undefined = this._map.get(key);
    if (queue === undefined) {
      queue = new _Queue<T>();
      this._map.set(key, queue);
    }
    queue.enqueue(item);
  }

  dequeue(key: K): T|null {
    const queue: _Queue<T>|undefined = this._map.get(key);
    if (queue === undefined) return null;
    const item: T|null = queue.dequeue();
    if (queue.isEmpty()) this._map.delete(key);
    return item;
  }
}
