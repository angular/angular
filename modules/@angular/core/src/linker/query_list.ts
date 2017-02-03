/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Observable} from '../facade/async';
import {ListWrapper} from '../facade/collection';

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
export class QueryList<T> extends Array<T> {
  private _dirty = true;
  private _emitter = new EventEmitter();

  get changes(): Observable<any> { return this._emitter; }
  get first(): T { return this[0]; }
  get last(): T { return this[this.length - 1]; }

  toArray(): T[] { return this.slice(); }

  reset(res: Array<T|any[]>): void {
    this.length = 0;
    this.push(...ListWrapper.flatten(res));
    this._dirty = false;
  }

  notifyOnChanges(): void { this._emitter.emit(this); }

  /** internal */
  setDirty() { this._dirty = true; }

  /** internal */
  get dirty() { return this._dirty; }
}
