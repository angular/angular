library angular2.src.core.compiler.query_list;

import 'dart:collection';

/**
 * See query_list.ts
 */
class QueryList<T> extends Object
    with IterableMixin<T> {
  List<T> _results = [];
  List _callbacks = [];
  bool _dirty = false;

  Iterator<T> get iterator => _results.iterator;

  /** @private */
  void reset(List<T> newList) {
    _results = newList;
    _dirty = true;
  }

  void add(T obj) {
    _results.add(obj);
    _dirty = true;
  }

  void onChange(callback) {
    _callbacks.add(callback);
  }

  void removeCallback(callback) {
    _callbacks.remove(callback);
  }

  void removeAllCallbacks() {
    this._callbacks = [];
  }

  int get length => _results.length;
  T get first => _results.first;
  T get last => _results.last;
  String toString() {
    return _results.toString();
  }

  List map(fn(T)) {
    // Note: we need to return a list instead of iterable to match JS.
    return this._results.map(fn).toList();
  }

  /** @private */
  void fireCallbacks() {
    if (_dirty) {
      _callbacks.forEach((c) => c());
      _dirty = false;
    }
  }
}
