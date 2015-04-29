import {isJsObject, global, isPresent} from 'angular2/src/facade/lang';

export var List = global.Array;
export var Map = global.Map;
export var Set = global.Set;
export var StringMap = global.Object;

// Safari and Internet Explorer do not support the iterable parameter to the
// Map constructor.  We work around that by manually adding the items.
var createMapFromPairs: {(pairs: List<any>): Map<any, any>} = (function() {
  try {
    if (new Map([1, 2]).size === 2) {
      return function createMapFromPairs(pairs: List<any>): Map<any, any> {
        return new Map(pairs);
      };
    }
  } catch (e) {
  }
  return function createMapAndPopulateFromPairs(pairs: List<any>): Map<any, any> {
    var map = new Map();
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      map.set(pair[0], pair[1]);
    }
    return map;
  }
})();
var createMapFromMap: {(m: Map<any, any>): Map<any, any>} = (function() {
  try {
    if (new Map(new Map())) {
      return function createMapFromMap(m: Map<any, any>): Map<any, any> { return new Map(m); };
    }
  } catch (e) {
  }
  return function createMapAndPopulateFromMap(m: Map<any, any>): Map<any, any> {
    var map = new Map();
    m.forEach((v, k) => { map.set(k, v); });
    return map;
  }
})();
var _clearValues: {(m: Map<any, any>)} = (function() {
  if ((<any>(new Map()).keys()).next) {
    return function _clearValues(m: Map<any, any>) {
      var keyIterator = m.keys();
      var k;
      while (!((k = (<any>keyIterator).next()).done)) {
        m.set(k.value, null);
      }
    };
  } else {
    return function _clearValuesWithForeEach(m: Map<any, any>) {
      m.forEach((v, k) => { m.set(k, null); });
    }
  }
})();

export class MapWrapper {
  static create(): Map<any, any> { return new Map(); }
  static clone<K, V>(m: Map<K, V>): Map<K, V> { return createMapFromMap(m); }
  static createFromStringMap(stringMap): Map<string, any> {
    var result = MapWrapper.create();
    for (var prop in stringMap) {
      MapWrapper.set(result, prop, stringMap[prop]);
    }
    return result;
  }
  static createFromPairs(pairs: List<any>): Map<any, any> { return createMapFromPairs(pairs); }
  static get<K, V>(m: Map<K, V>, k: K): V { return m.get(k); }
  static set<K, V>(m: Map<K, V>, k: K, v: V) { m.set(k, v); }
  static contains<K>(m: Map<K, any>, k: K) { return m.has(k); }
  static forEach<K, V>(m: Map<K, V>, fn: /*(V, K) => void*/ Function) { m.forEach(<any>fn); }
  static size(m: Map<any, any>) { return m.size; }
  static delete<K>(m: Map<K, any>, k: K) { m.delete(k); }
  static clear(m: Map<any, any>) { m.clear(); }
  static clearValues(m: Map<any, any>) { _clearValues(m); }
  static iterable(m) { return m; }
  static keys<K>(m: Map<K, any>): List<K> { return m.keys(); }
  static values<V>(m: Map<any, V>): List<V> { return m.values(); }
}

/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
  static create(): StringMap<any, any> {
    // Note: We are not using Object.create(null) here due to
    // performance!
    // http://jsperf.com/ng2-object-create-null
    return {};
  }
  static contains(map: StringMap<string, any>, key: string) { return map.hasOwnProperty(key); }
  static get<V>(map: StringMap<string, V>, key: string): V {
    return map.hasOwnProperty(key) ? map[key] : undefined;
  }
  static set<V>(map: StringMap<string, V>, key: string, value: V) { map[key] = value; }
  static keys(map: StringMap<string, any>): List<string> { return Object.keys(map); }
  static isEmpty(map: StringMap<string, any>) {
    for (var prop in map) {
      return false;
    }
    return true;
  }
  static delete (map: StringMap<string, any>, key: string) { delete map[key]; }
  static forEach<K, V>(map: StringMap<string, V>, callback: /*(V, K) => void*/ Function) {
    for (var prop in map) {
      if (map.hasOwnProperty(prop)) {
        callback(map[prop], prop);
      }
    }
  }

  static merge<V>(m1: StringMap<string, V>, m2: StringMap<string, V>): StringMap<string, V> {
    var m = {};

    for (var attr in m1) {
      if (m1.hasOwnProperty(attr)) {
        m[attr] = m1[attr];
      }
    }

    for (var attr in m2) {
      if (m2.hasOwnProperty(attr)) {
        m[attr] = m2[attr];
      }
    }

    return m;
  }

  static equals<V>(m1: StringMap<string, V>, m2: StringMap<string, V>): boolean {
    var k1 = Object.keys(m1);
    var k2 = Object.keys(m2);
    if (k1.length != k2.length) {
      return false;
    }
    var key;
    for (var i = 0; i < k1.length; i++) {
      key = k1[i];
      if (m1[key] !== m2[key]) {
        return false;
      }
    }
    return true;
  }
}

export class ListWrapper {
  static create(): List<any> { return new List(); }
  static createFixedSize(size): List<any> { return new List(size); }
  static get(m, k) { return m[k]; }
  static set(m, k, v) { m[k] = v; }
  static clone(array: List<any>) { return array.slice(0); }
  static map(array, fn) { return array.map(fn); }
  static forEach(array: List<any>, fn: Function) {
    for (var i = 0; i < array.length; i++) {
      fn(array[i]);
    }
  }
  static push(array, el) { array.push(el); }
  static first(array) {
    if (!array) return null;
    return array[0];
  }
  static last(array) {
    if (!array || array.length == 0) return null;
    return array[array.length - 1];
  }
  static find(list: List<any>, pred: Function) {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i])) return list[i];
    }
    return null;
  }
  static indexOf(array: List<any>, value, startIndex = 0) {
    return array.indexOf(value, startIndex);
  }
  static reduce<T, E>(list: List<T>,
                      fn: (accumValue: E, currentValue: T, currentIndex: number, array: T[]) => E,
                      init: E) {
    return list.reduce(fn, init);
  }
  static filter(array, pred: Function) { return array.filter(pred); }
  static any(list: List<any>, pred: Function) {
    for (var i = 0; i < list.length; ++i) {
      if (pred(list[i])) return true;
    }
    return false;
  }
  static contains(list: List<any>, el) { return list.indexOf(el) !== -1; }
  static reversed(array) {
    var a = ListWrapper.clone(array);
    return a.reverse();
  }
  static concat(a, b) { return a.concat(b); }
  static isList(list) { return Array.isArray(list); }
  static insert(list, index: int, value) { list.splice(index, 0, value); }
  static removeAt(list, index: int) {
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
  static removeLast<T>(list: List<T>): T { return list.pop(); }
  static remove(list, el): boolean {
    var index = list.indexOf(el);
    if (index > -1) {
      list.splice(index, 1);
      return true;
    }
    return false;
  }
  static clear(list) { list.splice(0, list.length); }
  static join(list, s) { return list.join(s); }
  static isEmpty(list) { return list.length == 0; }
  static fill(list: List<any>, value, start: int = 0, end: int = null) {
    list.fill(value, start, end === null ? undefined : end);
  }
  static equals(a: List<any>, b: List<any>): boolean {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  static slice<T>(l: List<T>, from: int = 0, to: int = null): List<T> {
    return l.slice(from, to === null ? undefined : to);
  }
  static splice<T>(l: List<T>, from: int, length: int): List<T> { return l.splice(from, length); }
  static sort<T>(l: List<T>, compareFn?: (a: T, b: T) => number) {
    if (isPresent(compareFn)) {
      l.sort(compareFn);
    } else {
      l.sort();
    }
  }
  static toString<T>(l: List<T>): string { return l.toString(); }
}

export function isListLikeIterable(obj): boolean {
  if (!isJsObject(obj)) return false;
  return ListWrapper.isList(obj) ||
         (!(obj instanceof Map) &&  // JS Map are iterables but return entries as [k, v]
          Symbol.iterator in obj);  // JS Iterable have a Symbol.iterator prop
}

export function iterateListLike(obj, fn: Function) {
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


// Safari and Internet Explorer do not support the iterable parameter to the
// Set constructor.  We work around that by manually adding the items.
var createSetFromList: {(lst: List<any>): Set<any>} = (function() {
  var test = new Set([1, 2, 3]);
  if (test.size === 3) {
    return function createSetFromList(lst: List<any>): Set<any> { return new Set(lst); };
  } else {
    return function createSetAndPopulateFromList(lst: List<any>): Set<any> {
      var res = new Set(lst);
      if (res.size !== lst.length) {
        for (var i = 0; i < lst.length; i++) {
          res.add(lst[i]);
        }
      }
      return res;
    };
  }
})();
export class SetWrapper {
  static createFromList<T>(lst: List<T>): Set<T> { return createSetFromList(lst); }
  static has<T>(s: Set<T>, key: T): boolean { return s.has(key); }
}
