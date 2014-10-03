library facade.collection;

import 'dart:collection' show HashMap;
export 'dart:core' show Map, List, Set;

class MapWrapper {
  static HashMap create() => new HashMap();
  static get(m, k) => m[k];
  static void set(m, k, v){ m[k] = v; }
  static contains(m, k) => m.containsKey(k);
}

class ListWrapper {
  static List clone(List l) => new List.from(l);
  static List create() => new List();
  static get(m, k) => m[k];
  static void set(m, k, v) { m[k] = v; }
  static contains(m, k) => m.containsKey(k);
  static void push(List l, e) { l.add(e); }
}

class SetWrapper {
  static Set createFromList(List l) { return new Set.from(l); }
  static bool has(Set s, key) { return s.contains(key); }
}
