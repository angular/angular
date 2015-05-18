/**
 * This file contains declarations of global symbols we reference in our code
 */

/// <reference path="typings/hammerjs/hammerjs"/>
/// <reference path="typings/zone/zone.d.ts"/>

declare var assert: any;
declare var global: Window;
type int = number;

interface List<T> extends Array<T> {}

interface StringMap<K,V> extends Object {}

interface Window {
  Object: typeof Object;
  Array: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: typeof Date;
  RegExp: typeof RegExp;
  JSON: typeof JSON;
  Math: typeof Math;
  assert: typeof assert;
  gc(): void;
  Reflect: any;
  zone: Zone;
  Hammer: HammerStatic;
}
