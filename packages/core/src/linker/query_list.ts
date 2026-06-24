/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable, Subject} from 'rxjs';

import {EventEmitter} from '../event_emitter';
import {Writable} from '../interface/type';
import {arrayEquals, flatten} from '../util/array_utils';

function symbolIterator<T>(this: QueryList<T>): Iterator<T> {
  // @ts-expect-error accessing a private member
  return this._results[Symbol.iterator]();
}

/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link ViewChildren}, {@link ContentChildren}, and {@link QueryList}
 * provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `@for(i of myList; track $index)`.
 *
 * Changes can be observed by subscribing to the `changes` `Observable`.
 * *
 * @usageNotes
 * ### Example
 * ```ts
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 */
export class QueryList<T> implements Iterable<T> {
  public readonly dirty = true;
  private _onDirty?: () => void = undefined;
  private _results: Array<T> = [];
  private _changesDetected: boolean = false;
  private _changes: Subject<QueryList<T>> | undefined = undefined;

  readonly length: number = 0;
  readonly first: T = undefined!;
  readonly last: T = undefined!;

  /**
   * Returns `Observable` of `QueryList` notifying the subscriber of changes.
   */
  get changes(): Observable<any> {
    return (this._changes ??= new Subject());
  }

  /**
   * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
   *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
   *     the same result)
   */
  constructor(private _emitDistinctChangesOnly: boolean = false) {}

  /**
   * Returns the QueryList entry at `index`.
   */
  get(index: number): T | undefined {
    return this._results[index];
  }

  /**
   * See
   * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   */
  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] {
    return this._results.map(fn);
  }

  /**
   * See
   * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   */
  filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S): S[];
  filter(predicate: (value: T, index: number, array: readonly T[]) => unknown): T[];
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    return this._results.filter(fn);
  }

  /**
   * See
   * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   */
  find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined {
    return this._results.find(fn);
  }

  /**
   * See
   * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
   */
  reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U {
    return this._results.reduce(fn, init);
  }

  /**
   * See
   * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
   */
  forEach(fn: (item: T, index: number, array: T[]) => void): void {
    this._results.forEach(fn);
  }

  /**
   * See
   * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   */
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean {
    return this._results.some(fn);
  }

  /**
   * Returns a copy of the internal results list as an Array.
   */
  toArray(): T[] {
    return this._results.slice();
  }

  toString(): string {
    return this._results.toString();
  }

  /**
   * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
   * on change detection, it will not notify of changes to the queries, unless a new change
   * occurs.
   *
   * @param resultsTree The query results to store
   * @param identityAccessor Optional function for extracting stable object identity from a value
   *    in the array. This function is executed for each element of the query result list while
   *    comparing current query list with the new one (provided as a first argument of the `reset`
   *    function) to detect if the lists are different. If the function is not provided, elements
   *    are compared as is (without any pre-processing).
   */
  reset(resultsTree: Array<T | any[]>, identityAccessor?: (value: T) => unknown): void {
    (this as {dirty: boolean}).dirty = false;
    const newResultFlat = flatten(resultsTree);
    if ((this._changesDetected = !arrayEquals(this._results, newResultFlat, identityAccessor))) {
      this._results = newResultFlat;
      (this as Writable<this>).length = newResultFlat.length;
      (this as Writable<this>).last = newResultFlat[this.length - 1];
      (this as Writable<this>).first = newResultFlat[0];
    }
  }

  /**
   * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
   */
  notifyOnChanges(): void {
    if (this._changes !== undefined && (this._changesDetected || !this._emitDistinctChangesOnly))
      this._changes.next(this);
  }

  /** @internal */
  onDirty(cb: () => void) {
    this._onDirty = cb;
  }

  /** internal */
  setDirty() {
    (this as {dirty: boolean}).dirty = true;
    this._onDirty?.();
  }

  /** internal */
  destroy(): void {
    if (this._changes !== undefined) {
      this._changes.complete();
      this._changes.unsubscribe();
    }
  }

  [Symbol.iterator]: () => Iterator<T> = /** @__PURE__*/ (() => symbolIterator)();
}
