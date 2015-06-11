/**
 * This file contains declarations of global symbols we reference in our code
 */

/// <reference path="typings/zone/zone.d.ts"/>
/// <reference path="traceur-runtime.d.ts" />
declare var assert: any;
declare type int = number;

interface List<T> extends Array<T> {}

interface StringMap<K, V> extends Object {}

interface BrowserNodeGlobal {
  Object: typeof Object;
  Array: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: typeof Date;
  RegExp: typeof RegExp;
  JSON: typeof JSON;
  Math: typeof Math;
  assert(condition): void;
  Reflect: any;
  zone: Zone;
  getAngularTestability: Function;
  setTimeout: Function;
  clearTimeout: Function;
  setInterval: Function;
  clearInterval: Function;
}

declare var global: any;
