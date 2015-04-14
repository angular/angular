import {List, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Directive} from 'angular2/src/core/annotations/annotations';

/**
 * Injectable Objects that contains a live list of child directives in the light Dom of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * In the future this class will implement an Observable interface.
 * For now it uses a plain list of observable callbacks.
 *
 * @exportedAs angular2/view
 */
export class BaseQueryList {
  _results: List<Directive>;
  _callbacks;
  _dirty;

  constructor() {
    this._results = [];
    this._callbacks = [];
    this._dirty = false;
  }

  [Symbol.iterator]() {
    return this._results[Symbol.iterator]();
  }

  reset(newList) {
    this._results = newList;
    this._dirty = true;
  }

  add(obj) {
    ListWrapper.push(this._results, obj);
    this._dirty = true;
  }

  // TODO(rado): hook up with change detection after #995.
  fireCallbacks() {
    if (this._dirty) {
      ListWrapper.forEach(this._callbacks, (c) => c());
      this._dirty = false;
    }
  }

  onChange(callback) {
    ListWrapper.push(this._callbacks, callback);
  }

  removeCallback(callback) {
    ListWrapper.remove(this._callbacks, callback);
  }
}
