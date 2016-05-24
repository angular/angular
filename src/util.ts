export function shallowEqual(a: {[x:string]:any}, b: {[x:string]:any}): boolean {
  var k1 = Object.keys(a);
  var k2 = Object.keys(b);
  if (k1.length != k2.length) {
    return false;
  }
  var key;
  for (var i = 0; i < k1.length; i++) {
    key = k1[i];
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export function flatten<T>(a: T[][]): T[] {
  const target = [];
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < a[i].length; ++j) {
      target.push(a[i][j]);
    }
  }
  return target;
}

export function first<T>(a: T[]): T | null {
  return a.length > 0 ? a[0] : null;
}

export function merge<V>(m1: {[key: string]: V}, m2: {[key: string]: V}): {[key: string]: V} {
  var m: {[key: string]: V} = {};

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

export function forEach<K, V>(map: {[key: string]: V}, callback: /*(V, K) => void*/ Function): void {
  for (var prop in map) {
    if (map.hasOwnProperty(prop)) {
      callback(map[prop], prop);
    }
  }
}