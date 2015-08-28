// This file is used for TypeScript compilation to ES5 only.
// Since this file is not included in the compilation to ES6, it is an error
// to <reference> this file from other sources.
// Instead it is referenced by the rootFilePaths option to the compiler.

// We also want the following typings to be available only when compiling to
// ES5, because they are redundant with lib.es6.d.ts.
/// <reference path="../angular2/typings/es6-promise/es6-promise.d.ts"/>

// es6-promise.d.ts chose a different name for this interface than TS lib.es6.d.ts
// Generic Type Alises are in TS 1.6 (https://github.com/Microsoft/TypeScript/pull/3397)
// So we cannot write:
// declare type PromiseLike = Thenable;
// Until then we use a workaround:
interface PromiseLike<T> extends Thenable<T> {}

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
  keys(): Array<K>;
  values(): Array<V>;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, value: V): Map<K, V>;
  size: number;
}
declare var Map: {
  new (): Map<any, any>;
  new<K, V>(): Map<K, V>;
  // alexeagle: PATCHED
  new<K, V>(m: Map<K, V>): Map<any, any>;
  new<K, V>(l: Array<any>): Map<any, any>;
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
  new (): Set<any>;
  new<T>(): Set<T>;
  // alexeagle PATCHED
  new<T>(s: Set<T>): Set<T>;
  new<T>(l: Array<T>): Set<T>;
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
