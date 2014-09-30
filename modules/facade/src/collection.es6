export var List = window.Array;
export var Map = window.Map;
export var Set = window.Set;

export class MapWrapper {
  static create():HashMap { return new HashMap(); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static contains(m, k) { return  m[k] != undefined; }
  static forEach(m, fn) {
    for(var k in m) {
      fn(k, m[k]);
    }
  }
}


export class ListWrapper {
  static create():List { return new List(); }
  static createFixedSize(size):List { return new List(); }
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
  static last(array) {
    if (!array || array.length == 0) return null;
    return array[array.length - 1];
  }
}

export class SetWrapper {
  static createFromList(lst:List) { return new Set(lst); }
  static has(s:Set, key):boolean { return s.has(key); }
}