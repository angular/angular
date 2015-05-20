// Extend the ES5 standard library with some ES6 features we polyfill at runtime
// by loading traceur-runtime.js

// These are mostly copied from lib.es6.d.ts

interface String {
  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * position. Otherwise returns false.
   */
  startsWith(searchString: string, position?: number): boolean;
}

interface NumberConstructor {
  /**
   * Returns true if the value passed is an integer, false otherwise.
   * @param number A numeric value.
   */
  isInteger(number: number): boolean;
}

interface Array<T> {
  /**
   * Returns the this object after filling the section identified by start and end with value
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(value: T, start?: number, end?: number): T[];
}

// Copied from lib.dom.d.ts and modified
interface Map<K, V> {
  clear(): void;
  delete (key: K): boolean;
  forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
  keys(): List<K>;
  values(): List<V>;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, value: V): Map<K, V>;
  size: number;
}
declare var Map: {
  new<K, V>(): Map<K, V>;
  // alexeagle: PATCHED
  new<K, V>(m: Map<K, V>): Map<K, V>;
  new<K, V>(l: List<any>): Map<K, V>;
  prototype: Map<any, any>;
};

interface Set<T> {
  add(value: T): Set<T>;
  clear(): void;
  delete (value: T): boolean;
  forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
  has(value: T): boolean;
  size: number;
}
declare var Set: {
  new<T>(): Set<T>;
  // alexeagle PATCHED
  new<T>(s: Set<T>): Set<T>;
  new<T>(l: List<T>): Set<T>;
  prototype: Set<any>;
};

interface SymbolConstructor {
  /**
   * A method that returns the default iterator for an object.Called by the semantics of the
   * for-of statement.
   */
  iterator: symbol;
}
declare var Symbol: SymbolConstructor;
