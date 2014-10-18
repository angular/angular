export var List = window.Array;
export var Map = window.Map;
export var Set = window.Set;

export class MapWrapper {
  static create():Map { return new Map(); }
  static get(m, k) { return m.get(k); }
  static set(m, k, v) { m.set(k,v); }
  static contains(m, k) { return  m.has(k); }
  static forEach(m, fn) {
    m.forEach(fn);
  }
}


export class ListWrapper {
  static create():List { return new List(); }
  static createFixedSize(size):List { return new List(size); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static clone(array) {
    return Array.prototype.slice.call(array, 0);
  }
  static map(array, fn) {
    return array.map(fn);
  }
  static forEach(array, fn) {
    for(var p of array) {
      fn(p);
    }
  }
  static push(array, el) {
    array.push(el);
  }
  static first(array) {
    if (!array) return null;
    return array[0];
  }
  static last(array) {
    if (!array || array.length == 0) return null;
    return array[array.length - 1];
  }
  static reversed(array) {
    var a = ListWrapper.clone(array);
    return a.reverse();
  }
}

export class SetWrapper {
  static createFromList(lst:List) { return new Set(lst); }
  static has(s:Set, key):boolean { return s.has(key); }
}