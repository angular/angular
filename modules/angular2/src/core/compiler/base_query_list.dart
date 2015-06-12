library angular2.src.core.compiler.base_query_list;

import 'dart:collection';

/**
 * Injectable Objects that contains a live list of child directives in the light Dom of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * In the future this class will implement an Observable interface.
 * For now it uses a plain list of observable callbacks.
 */
class BaseQueryList<T> extends Object with IterableMixin<T> {
  List<T> _results = [];
  List _callbacks = [];
  bool _dirty = false;

  Iterator<T> get iterator => _results.iterator;

  reset(newList) {
    _results = newList;
    _dirty = true;
  }

  add(obj) {
    _results.add(obj);
    _dirty = true;
  }

  // TODO(rado): hook up with change detection after #995.
  fireCallbacks() {
    if (_dirty) {
      _callbacks.forEach((c) => c());
      _dirty = false;
    }
  }

  onChange(callback) {
    _callbacks.add(callback);
  }

  removeCallback(callback) {
    _callbacks.remove(callback);
  }

  get length => _results.length;
  get first => _results.first;
  get last => _results.last;
}
