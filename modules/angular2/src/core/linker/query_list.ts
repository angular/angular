import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {getSymbolIterator} from 'angular2/src/facade/lang';
import {Observable, EventEmitter} from 'angular2/src/facade/async';


/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link QueryMetadata} and {@link ViewQueryMetadata} provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="#i of myList"`.
 *
 * Changes can be observed by subscribing to the changes `Observable`.
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
 * ```typescript
 * @Component({...})
 * class Container {
 *   constructor(@Query(Item) items: QueryList<Item>) {
 *     items.changes.subscribe(_ => console.log(items.length));
 *   }
 * }
 * ```
 */
export class QueryList<T> {
  private _results: Array<T> = [];
  private _emitter = new EventEmitter();

  get changes(): Observable<any> { return this._emitter; }
  get length(): number { return this._results.length; }
  get first(): T { return ListWrapper.first(this._results); }
  get last(): T { return ListWrapper.last(this._results); }

  /**
   * returns a new array with the passed in function applied to each element.
   */
  map<U>(fn: (item: T) => U): U[] { return this._results.map(fn); }

  /**
   * returns a filtered array.
   */
  filter(fn: (item: T) => boolean): T[] { return this._results.filter(fn); }

  /**
   * returns a reduced value.
   */
  reduce<U>(fn: (acc: U, item: T) => U, init: U): U { return this._results.reduce(fn, init); }

  /**
   * converts QueryList into an array
   */
  toArray(): T[] { return ListWrapper.clone(this._results); }

  [getSymbolIterator()](): any { return this._results[getSymbolIterator()](); }

  toString(): string { return this._results.toString(); }

  /**
   * @internal
   */
  reset(res: T[]): void { this._results = res; }

  /** @internal */
  notifyOnChanges(): void { this._emitter.emit(this); }
}
