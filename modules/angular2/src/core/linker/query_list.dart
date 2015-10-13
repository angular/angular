library angular2.src.core.compiler.query_list;

import 'dart:collection';
import 'package:angular2/src/core/facade/async.dart';

/**
 * See query_list.ts
 */
class QueryList<T> extends Object
    with IterableMixin<T> {
  List<T> _results = [];
  EventEmitter _emitter = new EventEmitter();

  Iterator<T> get iterator => _results.iterator;

  Stream<Iterable<T>> get changes => _emitter;

  int get length => _results.length;
  T get first => _results.first;
  T get last => _results.last;
  String toString() {
    return _results.toString();
  }

  /** @internal */
  void reset(List<T> newList) {
    _results = newList;
  }

  /** @internal */
  void notifyOnChanges() {
    _emitter.add(this);
  }
}
