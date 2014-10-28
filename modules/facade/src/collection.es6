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
  static size(m) {return m.size;}
}

// TODO: cannot export StringMap as a type as Dart does not support
// renaming types...
export class StringMapWrapper {
  // Note: We are not using Object.create(null) here due to
  // performance!
  static create():Object { return { }; }
  static get(map, key) {
    return map.hasOwnProperty(key) ? map[key] : undefined;
  }
  static set(map, key, value) {
    map[key] = value;
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
  static find(list:List, pred:Function) {
    for (var i = 0 ; i < list.length; ++i) {
      if (pred(list[i])) return list[i];
    }
    return null;
  }
  static filter(array, pred:Function) {
    return array.filter(pred);
  }
  static any(list:List, pred:Function) {
    for (var i = 0 ; i < list.length; ++i) {
      if (pred(list[i])) return true;
    }
    return false;
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