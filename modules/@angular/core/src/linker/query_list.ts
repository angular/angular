/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Observable} from '../facade/async';
import {ListWrapper} from '../facade/collection';
import {getSymbolIterator} from '../facade/lang';

/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link Query} and {@link ViewQueryMetadata} provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="let i of myList"`.
 *
 * Changes can be observed by subscribing to the changes `Observable`.
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
 * ```typescript
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 * @stable
 */
export class QueryList<T>/* implements Iterable<T> */ {
  private _dirty = true;
  private _results: Array<T> = [];
  private _emitter = new EventEmitter();

  get changes(): Observable<any> { return this._emitter; }
  get length(): number { return this._results.length; }
  get first(): T { return this._results[0]; }
  get last(): T { return this._results[this.length - 1]; }

  /**
   * See
   * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   */
  map<U>(fn: (item: T, index: number, array: T[]) => U): U[] { return this._results.map(fn); }

  /**
   * See
   * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   */
  filter(fn: (item: T, index: number, array: T[]) => boolean): T[] {
    return this._results.filter(fn);
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
  forEach(fn: (item: T, index: number, array: T[]) => void): void { this._results.forEach(fn); }

  /**
   * See
   * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   */
  some(fn: (value: T, index: number, array: T[]) => boolean): boolean {
    return this._results.some(fn);
  }

  toArray(): T[] { return this._results.slice(); }

  [getSymbolIterator()](): Iterator<T> { return (this._results as any)[getSymbolIterator()](); }

  toString(): string { return this._results.toString(); }

  reset(res: Array<T|any[]>): void {
    this._results = ListWrapper.flatten(res);
    this._dirty = false;
  }

  notifyOnChanges(): void { this._emitter.emit(this); }

  /** internal */
  setDirty() { this._dirty = true; }

  /** internal */
  get dirty() { return this._dirty; }
}
