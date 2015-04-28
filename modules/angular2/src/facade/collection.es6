import {int, isJsObject, global} from 'angular2/src/facade/lang';

export var List = global.Array;
export var Map = global.Map;
export var Set = global.Set;
export var StringMap = global.Object;

export class MapWrapper {
  static create():Map { return new Map(); }
  static clone(m:Map):Map { return new Map(m); }
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
  static clearValues(m) {
    var keyIterator = m.keys();
    var k;
    while (!((k = keyIterator.next()).done)) {
      m.set(k.value, null);
    }
  }
  static iterable(m) { return m; }
  static keys(m) { return m.keys(); }
  static values(m) { return m.values(); }
}

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
  static contains(map, key) {
    return map.hasOwnProperty(key);
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
  static delete(map, key) { delete map[key]; }
  static forEach(map, callback) {
    for (var prop in map) {
      if (map.hasOwnProperty(prop)) {
        callback(map[prop], prop);
      }
    }
  }

  static merge(m1, m2) {
    var m = {};

    for (var attr in m1) {
      if (m1.hasOwnProperty(attr)){
        m[attr] = m1[attr];
      }
    }

    for (var attr in m2) {
      if (m2.hasOwnProperty(attr)){
        m[attr] = m2[attr];
      }
    }

    return m;
  }
}

export class ListWrapper {
  static create():List { return new List(); }
  static createFixedSize(size):List { return new List(size); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static clone(array:List) {
    return array.slice(0);
  }
  static map(array, fn) {
    return array.map(fn);
  }
  static forEach(array:List, fn:Function) {
    for (var i = 0; i < array.length; i++) {
      fn(array[i]);
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
  static indexOf(array, value, startIndex = -1) {
    return array.indexOf(value, startIndex);
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
    var res = list[index];
    list.splice(index, 1);
    return res;
  }
  static removeAll(list, items) {
    for (var i = 0; i < items.length; ++i) {
      var index = list.indexOf(items[i]);
      list.splice(index, 1);
    }
  }
  static removeLast(list:List) {
    return list.pop();
  }
  static remove(list, el): boolean {
    var index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }
  static clear(list) {
    list.splice(0, list.length);
  }
  static join(list, s) {
    return list.join(s);
  }
  static isEmpty(list) {
    return list.length == 0;
  }
  static fill(list:List, value, start:int = 0, end:int = null) {
    list.fill(value, start, end === null ? undefined : end);
  }
  static equals(a:List, b:List):boolean {
    if(a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  static slice(l:List, from:int = 0, to:int = null):List {
    return l.slice(from, to === null ? undefined : to);
  }
  static splice(l:List, from:int, length:int):List {
    return l.splice(from, length);
  }
  static sort(l:List, compareFn:Function) {
    l.sort(compareFn);
  }
}

export function isListLikeIterable(obj):boolean {
  if (!isJsObject(obj)) return false;
  return ListWrapper.isList(obj) ||
         (!(obj instanceof Map) &&  // JS Map are iterables but return entries as [k, v]
         Symbol.iterator in obj);   // JS Iterable have a Symbol.iterator prop
}

export function iterateListLike(obj, fn:Function) {
  if (ListWrapper.isList(obj)) {
    for (var i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    var iterator = obj[Symbol.iterator]();
    var item;
    while (!((item = iterator.next()).done)) {
      fn(item.value);
    }
  }
}

export class SetWrapper {
  static createFromList(lst:List) { return new Set(lst); }
  static has(s:Set, key):boolean { return s.has(key); }
}
