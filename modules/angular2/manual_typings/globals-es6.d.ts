/**
 * Declarations angular depends on for compilation to ES6.
 * This file is also used to propagate our transitive typings
 * to users.
 */

/// <reference path="../typings/zone/zone.d.ts"/>
/// <reference path="../typings/hammerjs/hammerjs.d.ts"/>
/// <reference path="../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../typings/angular-protractor/angular-protractor.d.ts"/>
declare var assert: any;

interface BrowserNodeGlobal {
  Object: typeof Object;
  Array: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: typeof Date;
  RegExp: typeof RegExp;
  JSON: typeof JSON;
  Math: typeof Math;
  assert(condition: any): void;
  Reflect: any;
  zone: Zone;
  getAngularTestability: Function;
  getAllAngularTestabilities: Function;
  angularDevMode: boolean;
  setTimeout: Function;
  clearTimeout: Function;
  setInterval: Function;
  clearInterval: Function;
}
