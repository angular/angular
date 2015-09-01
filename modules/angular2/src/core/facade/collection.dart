library facade.collection;

import 'dart:collection' show IterableBase, Iterator;
import 'dart:convert' show JsonEncoder;
export 'dart:core' show Map, List, Set;
import 'dart:math' show max, min;

var jsonEncoder = new JsonEncoder();

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
  static Map clone(Map m) => new Map.from(m);

  // in opposite to JS, Dart does not create a new map
  static Map createFromStringMap(Map m) => m;

  // in opposite to JS, Dart does not create a new map
  static Map toStringMap(Map m) => m;

  static Map createFromPairs(List pairs) => pairs.fold({}, (m, p) {
        m[p[0]] = p[1];
        return m;
      });
  static forEach(Map m, fn(v, k)) {
    m.forEach((k, v) => fn(v, k));
  }

  static get(Map map, key) => map[key];
  static int size(Map m) => m.length;
  static void delete(Map m, k) {
    m.remove(k);
  }

  static void clearValues(Map m) {
    for (var k in m.keys) {
      m[k] = null;
    }
  }

  static Iterable iterable(Map m) => new IterableMap(m);
  static List keys(Map m) => m.keys.toList();
  static List values(Map m) => m.values.toList();
}

class StringMapWrapper {
  static Map create() => {};
  static bool contains(Map map, key) => map.containsKey(key);
  static get(Map map, key) => map[key];
  static void set(Map map, key, value) {
    map[key] = value;
  }

  static void delete(Map m, k) {
    m.remove(k);
  }

  static void forEach(Map m, fn(v, k)) {
    m.forEach((k, v) => fn(v, k));
  }

  static Map merge(Map a, Map b) {
    var m = new Map.from(a);
    if (b != null) {
      b.forEach((k, v) => m[k] = v);
    }
    return m;
  }

  static List<String> keys(Map<String, dynamic> a) {
    return a.keys.toList();
  }

  static bool isEmpty(Map m) => m.isEmpty;
  static bool equals(Map m1, Map m2) {
    if (m1.length != m2.length) {
      return false;
    }
    for (var key in m1.keys) {
      if (m1[key] != m2[key]) {
        return false;
      }
    }
    return true;
  }
}

typedef bool Predicate<T>(T item);

class ListWrapper {
  static List clone(Iterable l) => new List.from(l);
  static List createFixedSize(int size) => new List(size);
  static List createGrowableSize(int size) =>
      new List.generate(size, (_) => null, growable: true);

  static bool contains(List m, k) => m.contains(k);
  static List map(list, fn(item)) => list.map(fn).toList();
  static List filter(List list, bool fn(item)) => list.where(fn).toList();
  static int indexOf(List list, value, [int startIndex = 0]) =>
      list.indexOf(value, startIndex);
  static int lastIndexOf(List list, value, [int startIndex = null]) =>
      list.lastIndexOf(value, startIndex == null ? list.length : startIndex);
  static find(List list, bool fn(item)) =>
      list.firstWhere(fn, orElse: () => null);
  static bool any(List list, bool fn(item)) => list.any(fn);
  static void forEach(Iterable list, fn(item)) {
    list.forEach(fn);
  }

  static void forEachWithIndex(List list, fn(item, index)) {
    for (var i = 0; i < list.length; ++i) {
      fn(list[i], i);
    }
  }

  static reduce(List list, fn(a, b), init) {
    return list.fold(init, fn);
  }

  static first(List list) => list.isEmpty ? null : list.first;
  static last(List list) => list.isEmpty ? null : list.last;
  static List reversed(List list) => list.reversed.toList();
  static List concat(List a, List b) {
    return new List()
      ..length = a.length + b.length
      ..setRange(0, a.length, a)
      ..setRange(a.length, a.length + b.length, b);
  }

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
    l.fillRange(_startOffset(l, start), _endOffset(l, end), value);
  }

  static bool equals(List a, List b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  static List slice(List l, [int from = 0, int to]) {
    return l.sublist(_startOffset(l, from), _endOffset(l, to));
  }

  static List splice(List l, int from, int length) {
    from = _startOffset(l, from);
    var to = from + length;
    var sub = l.sublist(from, to);
    l.removeRange(from, to);
    return sub;
  }

  static void sort(List l, [compareFn(a, b) = null]) {
    if (compareFn == null) {
      l.sort();
    } else {
      l.sort(compareFn);
    }
  }

  static String toJSON(List l) {
    return jsonEncoder.convert(l);
  }

  // JS splice, slice, fill functions can take start < 0 which indicates a position relative to
  // the end of the list
  static int _startOffset(List l, int start) {
    int len = l.length;
    return start = start < 0 ? max(len + start, 0) : min(start, len);
  }

  // JS splice, slice, fill functions can take end < 0 which indicates a position relative to
  // the end of the list
  static int _endOffset(List l, int end) {
    int len = l.length;
    if (end == null) return len;
    return end < 0 ? max(len + end, 0) : min(end, len);
  }


  static maximum(List l, fn(item)) {
    if (l.length == 0) {
      return null;
    }
    var solution = null;
    var maxValue = double.NEGATIVE_INFINITY;
    for (var index = 0; index < l.length; index++) {
      var candidate = l[index];
      if (candidate == null) {
        continue;
      }
      var candidateValue = fn(candidate);
      if (candidateValue > maxValue) {
        solution = candidate;
        maxValue = candidateValue;
      }
    }
    return solution;
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
  static void delete(Set m, k) {
    m.remove(k);
  }
}
