/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface BrowserNodeGlobal {
  Object: typeof Object;
  Array: typeof Array;
  Map: typeof Map;
  Set: typeof Set;
  Date: DateConstructor;
  RegExp: RegExpConstructor;
  JSON: typeof JSON;
  Math: any;  // typeof Math;
  assert(condition: any): void;
  Reflect: any;
  getAngularTestability: Function;
  getAllAngularTestabilities: Function;
  getAllAngularRootElements: Function;
  frameworkStabilizers: Array<Function>;
  setTimeout: Function;
  clearTimeout: Function;
  setInterval: Function;
  clearInterval: Function;
  encodeURI: Function;
}

// TODO(jteplitz602): Load WorkerGlobalScope from lib.webworker.d.ts file #3492
declare var WorkerGlobalScope: any /** TODO #9100 */;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
declare var global: any /** TODO #9100 */;

var globalScope: BrowserNodeGlobal;
if (typeof window === 'undefined') {
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
    globalScope = <any>self;
  } else {
    globalScope = <any>global;
  }
} else {
  globalScope = <any>window;
}

export function scheduleMicroTask(fn: Function) {
  Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}

// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global: BrowserNodeGlobal = globalScope;

export {_global as global};


export function getTypeNameForDebugging(type: any): string {
  return type['name'] || typeof type;
}

// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
  // TODO: to be fixed properly via #2830, noop for now
};

export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank(obj: any): boolean {
  return obj === undefined || obj === null;
}

export function isBoolean(obj: any): boolean {
  return typeof obj === 'boolean';
}

export function isNumber(obj: any): boolean {
  return typeof obj === 'number';
}

export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

export function isFunction(obj: any): boolean {
  return typeof obj === 'function';
}

export function isType(obj: any): boolean {
  return isFunction(obj);
}

export function isStringMap(obj: any): obj is Object {
  return typeof obj === 'object' && obj !== null;
}

const STRING_MAP_PROTO = Object.getPrototypeOf({});
export function isStrictStringMap(obj: any): boolean {
  return isStringMap(obj) && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}

export function isArray(obj: any): boolean {
  return Array.isArray(obj);
}

export function isDate(obj: any): obj is Date {
  return obj instanceof Date && !isNaN(obj.valueOf());
}

export function noop() {}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token === undefined || token === null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return token.overriddenName;
  }
  if (token.name) {
    return token.name;
  }

  const res = token.toString();
  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

export class StringWrapper {
  static fromCharCode(code: number): string { return String.fromCharCode(code); }

  static charCodeAt(s: string, index: number): number { return s.charCodeAt(index); }

  static split(s: string, regExp: RegExp): string[] { return s.split(regExp); }

  static equals(s: string, s2: string): boolean { return s === s2; }

  static stripLeft(s: string, charVal: string): string {
    if (s && s.length) {
      var pos = 0;
      for (var i = 0; i < s.length; i++) {
        if (s[i] != charVal) break;
        pos++;
      }
      s = s.substring(pos);
    }
    return s;
  }

  static stripRight(s: string, charVal: string): string {
    if (s && s.length) {
      var pos = s.length;
      for (var i = s.length - 1; i >= 0; i--) {
        if (s[i] != charVal) break;
        pos--;
      }
      s = s.substring(0, pos);
    }
    return s;
  }

  static replace(s: string, from: string, replace: string): string {
    return s.replace(from, replace);
  }

  static replaceAll(s: string, from: RegExp, replace: string): string {
    return s.replace(from, replace);
  }

  static slice<T>(s: string, from: number = 0, to: number = null): string {
    return s.slice(from, to === null ? undefined : to);
  }

  static replaceAllMapped(s: string, from: RegExp, cb: (m: string[]) => string): string {
    return s.replace(from, function(...matches: any[]) {
      // Remove offset & string from the result array
      matches.splice(-2, 2);
      // The callback receives match, p1, ..., pn
      return cb(matches);
    });
  }

  static contains(s: string, substr: string): boolean { return s.indexOf(substr) != -1; }

  static compare(a: string, b: string): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }
}

export class StringJoiner {
  constructor(public parts: string[] = []) {}

  add(part: string): void { this.parts.push(part); }

  toString(): string { return this.parts.join(''); }
}


export class NumberWrapper {
  static toFixed(n: number, fractionDigits: number): string { return n.toFixed(fractionDigits); }

  static equal(a: number, b: number): boolean { return a === b; }

  static parseIntAutoRadix(text: string): number {
    var result: number = parseInt(text);
    if (isNaN(result)) {
      throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
  }

  static parseInt(text: string, radix: number): number {
    if (radix == 10) {
      if (/^(\-|\+)?[0-9]+$/.test(text)) {
        return parseInt(text, radix);
      }
    } else if (radix == 16) {
      if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
        return parseInt(text, radix);
      }
    } else {
      var result: number = parseInt(text, radix);
      if (!isNaN(result)) {
        return result;
      }
    }
    throw new Error('Invalid integer literal when parsing ' + text + ' in base ' + radix);
  }

  static get NaN(): number { return NaN; }

  static isNumeric(value: any): boolean { return !isNaN(value - parseFloat(value)); }

  static isNaN(value: any): boolean { return isNaN(value); }

  static isInteger(value: any): boolean { return Number.isInteger(value); }
}

export var RegExp = _global.RegExp;

export class FunctionWrapper {
  static apply(fn: Function, posArgs: any): any { return fn.apply(null, posArgs); }

  static bind(fn: Function, scope: any): Function { return fn.bind(scope); }
}

// JS has NaN !== NaN
export function looseIdentical(a: any, b: any): boolean {
  return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
}

// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
export function getMapKey<T>(value: T): T {
  return value;
}

export function normalizeBlank(obj: Object): any {
  return isBlank(obj) ? null : obj;
}

export function normalizeBool(obj: boolean): boolean {
  return isBlank(obj) ? false : obj;
}

export function isJsObject(o: any): boolean {
  return o !== null && (typeof o === 'function' || typeof o === 'object');
}

export function print(obj: Error | Object) {
  console.log(obj);
}

export function warn(obj: Error | Object) {
  console.warn(obj);
}

// Can't be all uppercase as our transpiler would think it is a special directive...
export class Json {
  static parse(s: string): Object { return _global.JSON.parse(s); }
  static stringify(data: Object): string {
    // Dart doesn't take 3 arguments
    return _global.JSON.stringify(data, null, 2);
  }
}

export function setValueOnPath(global: any, path: string, value: any) {
  var parts = path.split('.');
  var obj: any = global;
  while (parts.length > 1) {
    var name = parts.shift();
    if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
      obj = obj[name];
    } else {
      obj = obj[name] = {};
    }
  }
  if (obj === undefined || obj === null) {
    obj = {};
  }
  obj[parts.shift()] = value;
}

// When Symbol.iterator doesn't exist, retrieves the key used in es6-shim
declare var Symbol: any;
var _symbolIterator: any = null;
export function getSymbolIterator(): string|symbol {
  if (isBlank(_symbolIterator)) {
    if (isPresent((<any>globalScope).Symbol) && isPresent(Symbol.iterator)) {
      _symbolIterator = Symbol.iterator;
    } else {
      // es6-shim specific logic
      var keys = Object.getOwnPropertyNames(Map.prototype);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (key !== 'entries' && key !== 'size' &&
            (Map as any).prototype[key] === Map.prototype['entries']) {
          _symbolIterator = key;
        }
      }
    }
  }
  return _symbolIterator;
}

export function evalExpression(
    sourceUrl: string, expr: string, declarations: string, vars: {[key: string]: any}): any {
  var fnBody = `${declarations}\nreturn ${expr}\n//# sourceURL=${sourceUrl}`;
  var fnArgNames: string[] = [];
  var fnArgValues: any[] = [];
  for (var argName in vars) {
    fnArgNames.push(argName);
    fnArgValues.push(vars[argName]);
  }
  return new Function(...fnArgNames.concat(fnBody))(...fnArgValues);
}

export function isPrimitive(obj: any): boolean {
  return !isJsObject(obj);
}

export function hasConstructor(value: Object, type: any): boolean {
  return value.constructor === type;
}

export function escape(s: string): string {
  return _global.encodeURI(s);
}

export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}
