/**
 * This file contains declarations of global symbols we reference in our code
 */

/// <reference path="../typings/zone/zone.d.ts"/>
declare var assert: any;

// TODO: Replace with a real d.ts file
declare module '@reactivex/rxjs' {
  class Subject<T> {
    subscribe(a, b, c): any;
    next(a): any;
    error(a): any;
    complete(): any;
  }

  class Observable<T> {
    subscribe(a, b, c): any;
  }


  class Subscription<T> {
    isUnsubscribed: boolean;
    unsubscribe(): void;
  }
}


// FIXME: K must be string!
// FIXME: should have an index signature, `[k: string]: V;`
interface StringMap<K extends string, V> {}

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
  getAllAngularTestabilities: Function;
  setTimeout: Function;
  clearTimeout: Function;
  setInterval: Function;
  clearInterval: Function;
}
