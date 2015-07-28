library angular2.src.core.compiler.query_list;

import 'dart:collection';
import './interface_query.dart';

/**
 * Injectable Objects that contains a live list of child directives in the light Dom of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * In the future this class will implement an Observable interface.
 * For now it uses a plain list of observable callbacks.
 */
class QueryList<T> extends Object with IterableMixin<T>
    implements IQueryList<T> {
  List<T> _results = [];
  List _callbacks = [];
  bool _dirty = false;

  Iterator<T> get iterator => _results.iterator;

  void reset(List<T> newList) {
    _results = newList;
    _dirty = true;
  }

  void add(T obj) {
    _results.add(obj);
    _dirty = true;
  }

  // TODO(rado): hook up with change detection after #995.
  void fireCallbacks() {
    if (_dirty) {
      _callbacks.forEach((c) => c());
      _dirty = false;
    }
  }

  void onChange(callback) {
    _callbacks.add(callback);
  }

  void removeCallback(callback) {
    _callbacks.remove(callback);
  }

  int get length => _results.length;
  T get first => _results.first;
  T get last => _results.last;

  List map(fn(T)) {
    // Note: we need to return a list instead of iterable to match JS.
    return this._results.map(fn).toList();
  }
}
