import {int, isJsObject} from 'facade/lang';

export var List = window.Array;
export var Map = window.Map;
export var Set = window.Set;

export class MapWrapper {
  static create():Map { return new Map(); }
  static createFromStringMap(stringMap):Map {
    var result = MapWrapper.create();
    for (var prop in stringMap) {
      MapWrapper.set(result, prop, stringMap[prop]);
    }
    return result;
  }
  static createFromPairs(pairs:List):Map {return new Map(pairs);}
  static get(m, k) { return m.get(k); }
  static set(m, k, v) { m.set(k,v); }
  static contains(m, k) { return  m.has(k); }
  static forEach(m, fn) {
    m.forEach(fn);
  }
  static size(m) {return m.size;}
  static delete(m, k) { m.delete(k); }
  static clear(m) { m.clear(); }
  static iterable(m) { return m; }
}

// TODO: cannot export StringMap as a type as Dart does not support renaming types...
/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
  static create():Object {
    // Note: We are not using Object.create(null) here due to
    // performance!
    // http://jsperf.com/ng2-object-create-null
    return { };
  }
  static get(map, key) {
    return map.hasOwnProperty(key) ? map[key] : undefined;
  }
  static set(map, key, value) {
    map[key] = value;
  }
  static isEmpty(map) {
    for (var prop in map) {
      return false;
    }
    return true;
  }
  static forEach(map, callback) {
    for (var prop in map) {
      if (map.hasOwnProperty(prop)) {
        callback(map[prop], prop);
      }
    }
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
  static reduce(list:List, fn:Function, init) {
    return list.reduce(fn, init);
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
  static contains(list:List, el) {
    return list.indexOf(el) !== -1;
  }
  static reversed(array) {
    var a = ListWrapper.clone(array);
    return a.reverse();
  }
  static concat(a, b) {return a.concat(b);}
  static isList(list) {
    return Array.isArray(list);
  }
  static insert(list, index:int, value) {
    list.splice(index, 0, value);
  }
  static removeAt(list, index:int) {
    list.splice(index, 1);
  }
  static clear(list) {
    list.splice(0, list.length);
  }
}

export function isListLikeIterable(obj):boolean {
  if (!isJsObject(obj)) return false;
  return ListWrapper.isList(obj) ||
         (!(obj instanceof Map) &&  // JS Map are iterables but return entries as [k, v]
         Symbol.iterator in obj);   // JS Iterable have a Symbol.iterator prop
}

export function iterateListLike(obj, fn:Function) {
  for (var item of obj) {
    fn(item);
  }
}

export class SetWrapper {
  static createFromList(lst:List) { return new Set(lst); }
  static has(s:Set, key):boolean { return s.has(key); }
}
