import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';
import {getSymbolIterator} from 'angular2/src/core/facade/lang';


/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link QueryMetadata} and {@link ViewQueryMetadata} provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ng-for="#i of myList"`.
 *
 * Changes can be observed by attaching callbacks.
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
 * ```typescript
 * @Component({...})
 * class Container {
 *   constructor(@Query(Item) items: QueryList<Item>) {
 *     items.onChange(() => console.log(items.length));
 *   }
 * }
 * ```
 */
export class QueryList<T> {
  protected _results: Array < T >= [];
  protected _callbacks: Array < () => void >= [];
  protected _dirty: boolean = false;

  /** @private */
  reset(newList: T[]): void {
    this._results = newList;
    this._dirty = true;
  }

  /** @private */
  add(obj: T): void {
    this._results.push(obj);
    this._dirty = true;
  }

  /**
   * registers a callback that is called upon each change.
   */
  onChange(callback: () => void): void { this._callbacks.push(callback); }

  /**
   * removes a given callback.
   */
  removeCallback(callback: () => void): void { ListWrapper.remove(this._callbacks, callback); }

  /**
   * removes all callback that have been attached.
   */
  removeAllCallbacks(): void { this._callbacks = []; }

  toString(): string { return this._results.toString(); }

  get length(): number { return this._results.length; }
  get first(): T { return ListWrapper.first(this._results); }
  get last(): T { return ListWrapper.last(this._results); }

  /**
   * returns a new list with the passsed in function applied to each element.
   */
  map<U>(fn: (item: T) => U): U[] { return this._results.map(fn); }

  [getSymbolIterator()](): any { return this._results[getSymbolIterator()](); }

  /** @private */
  fireCallbacks(): void {
    if (this._dirty) {
      ListWrapper.forEach(this._callbacks, (c) => c());
      this._dirty = false;
    }
  }
}
