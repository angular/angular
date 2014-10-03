library facade.collection;

import 'dart:collection' show HashMap;
export 'dart:core' show Map, List, Set;

class MapWrapper {
  static HashMap create() => new HashMap();
  static get(m, k) => m[k];
  static void set(m, k, v){ m[k] = v; }
  static contains(m, k) => m.containsKey(k);
  static forEach(m, fn) {
    m.forEach(fn);
  }
}

class ListWrapper {
  static List clone(List l) => new List.from(l);
  static List create() => new List();
  static List createFixedSize(int size) => new List(size);
  static get(m, k) => m[k];
  static void set(m, k, v) { m[k] = v; }
  static contains(m, k) => m.containsKey(k);
  static map(list, fn) => list.map(fn).toList();
  static forEach(list, fn) {
    list.forEach(fn);
  }
  static first(List list) {
    return list.first;
  }
  static last(List list) {
    return list.last;
  }
  static reversed(List list) {
    return list.reversed;
  }
  static void push(List l, e) { l.add(e); }
}

class SetWrapper {
  static Set createFromList(List l) { return new Set.from(l); }
  static bool has(Set s, key) { return s.contains(key); }
}
