export var List = window.Array;
export var Map = window.Map;
export class MapWrapper {
  static create():HashMap { return new HashMap(); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static contains(m, k) { return  m.containsKey(k); }
}


export class ListWrapper {
  static create():List { return new List(); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static clone(array) {
    return Array.prototype.slice.call(array, 0);
  }
  static push(l, e) { l.push(e); }
}

export class SetWrapper {
  static createFromList(lst:List) { return new Set(lst); }
  static has(s:Set, key):boolean { return s.has(key); }
}
