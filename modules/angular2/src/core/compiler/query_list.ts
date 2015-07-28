import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {IQueryList} from './interface_query';

/**
 * Injectable Objects that contains a live list of child directives in the light Dom of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * In the future this class will implement an Observable interface.
 * For now it uses a plain list of observable callbacks.
 */
export class QueryList<T> implements IQueryList<T> {
  protected _results: List < T >= [];
  protected _callbacks: List < () => void >= [];
  protected _dirty: boolean = false;

  reset(newList: List<T>): void {
    this._results = newList;
    this._dirty = true;
  }

  add(obj: T): void {
    this._results.push(obj);
    this._dirty = true;
  }

  fireCallbacks(): void {
    if (this._dirty) {
      ListWrapper.forEach(this._callbacks, (c) => c());
      this._dirty = false;
    }
  }

  onChange(callback: () => void): void { this._callbacks.push(callback); }

  removeCallback(callback: () => void): void { ListWrapper.remove(this._callbacks, callback); }

  toString(): string { return this._results.toString(); }

  get length(): number { return this._results.length; }
  get first(): T { return ListWrapper.first(this._results); }
  get last(): T { return ListWrapper.last(this._results); }

  map<U>(fn: (item: T) => U): U[] { return this._results.map(fn); }

  [Symbol.iterator](): any { return this._results[Symbol.iterator](); }
}
