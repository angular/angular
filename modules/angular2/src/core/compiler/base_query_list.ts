import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

/**
 * Injectable Objects that contains a live list of child directives in the light Dom of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * In the future this class will implement an Observable interface.
 * For now it uses a plain list of observable callbacks.
 *
 * @exportedAs angular2/view
 */
export class BaseQueryList<T> {
  protected _results: List<T> = [];
  protected _callbacks = [];
  protected _dirty = false;

  [Symbol.iterator]() { return this._results[Symbol.iterator](); }

  reset(newList) {
    this._results = newList;
    this._dirty = true;
  }

  add(obj) {
    ListWrapper.push(this._results, obj);
    this._dirty = true;
  }

  fireCallbacks() {
    if (this._dirty) {
      ListWrapper.forEach(this._callbacks, (c) => c());
      this._dirty = false;
    }
  }

  onChange(callback) { ListWrapper.push(this._callbacks, callback); }

  removeCallback(callback) { ListWrapper.remove(this._callbacks, callback); }

  get length() { return this._results.length; }

  get first() { return ListWrapper.first(this._results); }

  get last() { return ListWrapper.last(this._results); }
}
