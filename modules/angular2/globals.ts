/// <reference path="traceur-runtime.d.ts" />
/// <reference path="typings/jasmine/jasmine.d.ts" />
/// <reference path="typings/hammerjs/hammerjs.d.ts" />
/// <reference path="typings/zone/zone.d.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />

/**
 * This file contains declarations of global symbols we reference in our code
 */

declare var assert: any;
declare var module: any;
declare var $traceurRuntime: any;
declare var global: Window;
declare var $: any;
declare var angular: any;
declare var _resolve: any;
declare var require: any;
declare var browser: any;
declare var benchpressRunner: any;

type int = number;
type Type = {new (...args: any[]): any};
interface List<T> extends Array<T> {}
type TemplateElement = HTMLTemplateElement;
type StyleElement = HTMLStyleElement;
type SetterFn = Function;
type GetterFn = Function;
type MethodFn = Function;

type _globalRegExp = RegExp;


interface HTMLElement {
  createShadowRoot(): HTMLElement;
}

interface HTMLTemplateElement extends HTMLElement {
  content: DocumentFragment;
}

interface Window {
  Object: typeof Object;
  Array: typeof Array;
  List: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: typeof Date;
  RegExp: typeof RegExp;
  JSON: typeof JSON;
  Math: typeof Math;
  assert: typeof assert;
  NaN: typeof NaN;
  setTimeout: typeof setTimeout;
  Promise: typeof Promise;
  zone: Zone;
  Hammer: HammerStatic;
  DocumentFragment: DocumentFragment;
  Node: Node;
  NodeList: NodeList;
  Text: Text;
  HTMLElement: HTMLElement;
  HTMLTemplateElement: TemplateElement;
  HTMLStyleElement: StyleElement;
  gc(): void;
}
