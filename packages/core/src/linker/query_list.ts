/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

import {EventEmitter} from '../event_emitter';
import {flatten} from '../util/array_utils';
import {getSymbolIterator} from '../util/symbol';

function symbolIterator<T>(this: QueryList<T>): Iterator<T> {
  return ((this as any as {_results: Array<T>})._results as any)[getSymbolIterator()]();
}

/**
 * A read-only list of items returned by view and content queries, such as
 * `ViewChildren` and `ContentChildren`.
 * Any time a child element is added to, removed from, or moved within the
 * view or content hierarchy, Angular updates the
 * read-only `QueryList` object, and the `changes` observable of the
 * query list emits a new value.
 * Track changes in the view or content hierarchy by subscribing to the `changes` observable.
 *
 * `QueryList` implements its own iterable interface, which means that it can be used in both
 * ES6 JavaScript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="let i of myList"`.
 *
 * The following component definition saves the results of a view query as an instance of this class.
 *
 * ```typescript
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 */
export class QueryList<T> implements Iterable<T> {
  /**
   * True when the list has changed since the previous change-detection cycle.
   */
  public readonly dirty = true;
  private _results: Array<T> = [];
  /**
   * An observable that emits an event value for each change in the view or content hierarchy.
   */
  public readonly changes: Observable<any> = new EventEmitter();
  /**
   * The number of change events emitted in the most recent change-detection cycle.
   */
  readonly length: number = 0;
  // TODO(issue/24571): remove '!'.
  /**
   * True if the current iteration index is the first in the set.
   */
  readonly first!: T;
  // TODO(issue/24571): remove '!'.
  /**
   * True if the current iteration index is the last in the set.
   */
  readonly last!: T;

  constructor() {
    // This function should be declared on the prototype, but doing so there will cause the class
    // declaration to have side-effects and become not tree-shakable. For this reason we do it in
    // the constructor.
    // [getSymbolIterator()](): Iterator<T> { ... }
    const symbol = getSymbolIterator();
    const proto = QueryList.prototype as any;
    if (!proto[symbol]) proto[symbol] = symbolIterator;
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
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    return this._results.filter(fn);
  }

  /**
   * See
   * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   */
  find(fn: (item: T, index: number, array: T[]) => boolean): T|undefined {
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
   */
  reset(resultsTree: Array<T|any[]>): void {
    this._results = flatten(resultsTree);
    (this as {dirty: boolean}).dirty = false;
    (this as {length: number}).length = this._results.length;
    (this as {last: T}).last = this._results[this.length - 1];
    (this as {first: T}).first = this._results[0];
  }

  /**
   * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
   */
  notifyOnChanges(): void {
    (this.changes as EventEmitter<any>).emit(this);
  }

  /** internal */
  setDirty() {
    (this as {dirty: boolean}).dirty = true;
  }

  /** internal */
  destroy(): void {
    (this.changes as EventEmitter<any>).complete();
    (this.changes as EventEmitter<any>).unsubscribe();
  }

  // The implementation of `Symbol.iterator` should be declared here, but this would cause
  // tree-shaking issues with `QueryList. So instead, it's added in the constructor (see comments
  // there) and this declaration is left here to ensure that TypeScript considers QueryList to
  // implement the Iterable interface. This is required for template type-checking of NgFor loops
  // over QueryLists to work correctly, since QueryList must be assignable to NgIterable.
  [Symbol.iterator]!: () => Iterator<T>;
}
