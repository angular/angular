library facade.collection;

import 'dart:collection' show HashMap, IterableBase, Iterator;
export 'dart:core' show Map, List, Set;
import 'dart:math' show max, min;

class MapIterator extends Iterator<List> {
  final Iterator _iterator;
  final Map _map;

  MapIterator(Map map)
      : _map = map,
        _iterator = map.keys.iterator;

  bool moveNext() => _iterator.moveNext();

  List get current {
    return _iterator.current != null
        ? [_iterator.current, _map[_iterator.current]]
        : null;
  }
}

class IterableMap extends IterableBase<List> {
  final Map _map;

  IterableMap(Map map) : _map = map;

  Iterator<List> get iterator => new MapIterator(_map);
}

class MapWrapper {
  static HashMap create() => new HashMap();
  static HashMap clone(Map m) => new HashMap.from(m);
  static HashMap createFromStringMap(HashMap m) => m;
  static HashMap createFromPairs(List pairs) => pairs.fold({}, (m, p) {
    m[p[0]] = p[1];
    return m;
  });
  static get(Map m, k) => m[k];
  static void set(Map m, k, v) {
    m[k] = v;
  }
  static contains(Map m, k) => m.containsKey(k);
  static forEach(Map m, fn(v, k)) {
    m.forEach((k, v) => fn(v, k));
  }
  static int size(Map m) => m.length;
  static void delete(Map m, k) {
    m.remove(k);
  }
  static void clear(Map m) {
    m.clear();
  }
  static Iterable iterable(Map m) => new IterableMap(m);
  static Iterable keys(Map m) => m.keys;
  static Iterable values(Map m) => m.values;
}

class StringMapWrapper {
  static HashMap create() => new HashMap();
  static bool contains(Map map, key) => map.containsKey(key);
  static get(Map map, key) => map[key];
  static void set(Map map, key, value) {
    map[key] = value;
  }
  static void forEach(Map m, fn(v, k)) {
    m.forEach((k, v) => fn(v, k));
  }
  static HashMap merge(Map a, Map b) {
    var m = new HashMap.from(a);
    b.forEach((k, v) => m[k] = v);
    return m;
  }
  static bool isEmpty(Map m) => m.isEmpty;
}

class ListWrapper {
  static List clone(Iterable l) => new List.from(l);
  static List create() => new List();
  static List createFixedSize(int size) => new List(size);
  static get(List m, int k) => m[k];
  static void set(List m, int k, v) {
    m[k] = v;
  }
  static bool contains(List m, k) => m.contains(k);
  static List map(list, fn(item)) => list.map(fn).toList();
  static List filter(List list, bool fn(item)) => list.where(fn).toList();
  static find(List list, bool fn(item)) =>
      list.firstWhere(fn, orElse: () => null);
  static bool any(List list, bool fn(item)) => list.any(fn);
  static void forEach(Iterable list, fn(item)) {
    list.forEach(fn);
  }
  static reduce(List list, fn(a, b), init) {
    return list.fold(init, fn);
  }
  static first(List list) => list.isEmpty ? null : list.first;
  static last(List list) => list.isEmpty ? null : list.last;
  static List reversed(List list) => list.reversed.toList();
  static void push(List l, e) {
    l.add(e);
  }
  static List concat(List a, List b) {
    return []..addAll(a)..addAll(b);
  }
  static bool isList(l) => l is List;
  static void insert(List l, int index, value) {
    l.insert(index, value);
  }
  static removeAt(List l, int index) => l.removeAt(index);
  static void removeAll(List list, List items) {
    for (var i = 0; i < items.length; ++i) {
      list.remove(items[i]);
    }
  }
  static removeLast(List list) => list.removeLast();
  static bool remove(List list, item) => list.remove(item);
  static void clear(List l) {
    l.clear();
  }
  static String join(List l, String s) => l.join(s);
  static bool isEmpty(Iterable list) => list.isEmpty;
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
  static bool equals(List a, List b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
  static List slice(List l, int from, int to) {
    return l.sublist(from, to);
  }
  static void sort(List l, compareFn(a,b)) {
    l.sort(compareFn);
  }
}

bool isListLikeIterable(obj) => obj is Iterable;

void iterateListLike(iter, fn(item)) {
  assert(iter is Iterable);
  for (var item in iter) {
    fn(item);
  }
}

class SetWrapper {
  static Set createFromList(List l) => new Set.from(l);
  static bool has(Set s, key) => s.contains(key);
}
