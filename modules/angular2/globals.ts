/**
 * This file contains declarations of global symbols we reference in our code
 */

declare var assert: any;
declare var global: Window;
type int = number;

interface List<T> extends Array<T> {
}

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
  NaN: typeof NaN;
  gc(): void;
}
