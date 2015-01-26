library facade.collection;

import 'dart:collection' show HashMap, IterableBase, Iterator;
export 'dart:core' show Map, List, Set;
import 'dart:math' show max, min;

class MapIterator extends Iterator<List> {
  Iterator _iterator;
  Map _map;

  MapIterator(Map map) {
    this._map = map;
    this._iterator = map.keys.iterator;
  }
  bool moveNext() {
    return this._iterator.moveNext();
  }
  List get current {
    return this._iterator.current != null ?
      [this._iterator.current, this._map[this._iterator.current]] :
      null;
  }
}

class IterableMap extends IterableBase<List> {
  Map _map;

  IterableMap(Map map) {
    this._map = map;
  }
  Iterator<List> get iterator => new MapIterator(this._map);
}

class MapWrapper {
  static HashMap create() => new HashMap();
  static HashMap clone(Map m) => new HashMap.from(m);
  static HashMap createFromStringMap(m) => m;
  static HashMap createFromPairs(List pairs) {
    return pairs.fold({}, (m, p){
      m[p[0]] = p[1];
      return m;
    });
  }
  static get(m, k) => m[k];
  static void set(m, k, v){ m[k] = v; }
  static contains(m, k) => m.containsKey(k);
  static forEach(m, fn) {
    m.forEach((k,v) => fn(v,k));
  }
  static int size(m) {return m.length;}
  static void delete(m, k) { m.remove(k); }
  static void clear(m) { m.clear(); }
  static Iterable iterable(m) { return new IterableMap(m); }
  static Iterable keys(m) { return m.keys; }
  static Iterable values(m) { return m.values; }
}

// TODO: how to export StringMap=Map as a type?
class StringMapWrapper {
  static HashMap create() => new HashMap();
  static get(map, key) {
    return map[key];
  }
  static set(map, key, value) {
    map[key] = value;
  }
  static forEach(m, fn) {
    m.forEach((k,v) => fn(v,k));
  }
  static isEmpty(m) {
    return m.isEmpty;
  }
}

class ListWrapper {
  static List clone(List l) => new List.from(l);
  static List create() => new List();
  static List createFixedSize(int size) => new List(size);
  static get(m, k) => m[k];
  static void set(m, k, v) { m[k] = v; }
  static contains(List m, k) => m.contains(k);
  static map(list, fn) => list.map(fn).toList();
  static filter(List list, fn) => list.where(fn).toList();
  static find(List list, fn) => list.firstWhere(fn, orElse:() => null);
  static any(List list, fn) => list.any(fn);
  static forEach(list, Function fn) {
    list.forEach(fn);
  }
  static reduce(List list, Function fn, init) {
    return list.fold(init, fn);
  }
  static first(List list) => list.isEmpty ? null : list.first;
  static last(List list) => list.isEmpty ? null : list.last;
  static List reversed(List list) => list.reversed.toList();
  static void push(List l, e) { l.add(e); }
  static List concat(List a, List b) {a.addAll(b); return a;}
  static bool isList(l) => l is List;
  static void insert(List l, int index, value) { l.insert(index, value); }
  static void removeAt(List l, int index) { l.removeAt(index); }
  static void removeAll(List list, List items) {
    for (var i = 0; i < items.length; ++i) {
      list.remove(items[i]);
    }
  }
  static bool remove(List list, item) => list.remove(item);
  static void clear(List l) { l.clear(); }
  static String join(List l, String s) => l.join(s);
  static bool isEmpty(list) => list.isEmpty;
  static void fill(List l, value, [int start = 0, int end]) {
    // JS semantics
    // see https://github.com/google/traceur-compiler/blob/81880cd3f17bac7de90a4cd0339e9f1a9f61d24c/src/runtime/polyfills/Array.js#L94
    int len = l.length;
    start = start < 0 ? max(len + start, 0) : min(start, len);
    if (end == null) {
      end = len;
    } else {
      end = end < 0 ? max(len + end, 0) : min(end, len);
    }
    l.fillRange(start, end, value);
  }
  static bool equals(List a, List b){
    if(a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
}

bool isListLikeIterable(obj) => obj is Iterable;

void iterateListLike(iter, Function fn) {
  assert(iter is Iterable);
  for (var item in iter) {
    fn (item);
  }
}

class SetWrapper {
  static Set createFromList(List l) { return new Set.from(l); }
  static bool has(Set s, key) { return s.contains(key); }
}
