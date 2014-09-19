library facade.collection;

import 'dart:collection' show HashMap;
export 'dart:collection' show Map;
export 'dart:core' show List;

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
}
