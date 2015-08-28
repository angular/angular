/// <reference path="../../../globals.d.ts" />

// TODO(jteplitz602): Load WorkerGlobalScope from lib.webworker.d.ts file #3492
declare var WorkerGlobalScope;
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
};

// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global: BrowserNodeGlobal = globalScope;

export {_global as global};

export var Type = Function;

/**
 * Runtime representation of a type.
 *
 * In JavaScript a Type is a constructor function.
 */
export interface Type extends Function { new (...args): any; }

export function getTypeNameForDebugging(type: Type): string {
  return type['name'];
}

export class BaseException extends Error {
  stack;
  constructor(public message?: string, private _originalException?, private _originalStack?,
              private _context?) {
    super(message);
    this.stack = (<any>new Error(message)).stack;
  }

  get originalException(): any { return this._originalException; }

  get originalStack(): any { return this._originalStack; }

  get context(): any { return this._context; }

  toString(): string { return this.message; }
}

export function makeTypeError(message?: string): Error {
  return new TypeError(message);
}

export var Math = _global.Math;
export var Date = _global.Date;

var assertionsEnabled_ = typeof _global['assert'] !== 'undefined';
export function assertionsEnabled(): boolean {
  return assertionsEnabled_;
}

// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
  if (assertionsEnabled_) {
    _global['assert'].call(condition);
  }
};

// This function is needed only to properly support Dart's const expressions
// see https://github.com/angular/ts2dart/pull/151 for more info
export function CONST_EXPR<T>(expr: T): T {
  return expr;
}

export function CONST(): ClassDecorator {
  return (target) => target;
}

export function ABSTRACT(): ClassDecorator {
  return (t) => t;
}

export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank(obj: any): boolean {
  return obj === undefined || obj === null;
}

export function isString(obj: any): boolean {
  return typeof obj === "string";
}

export function isFunction(obj: any): boolean {
  return typeof obj === "function";
}

export function isType(obj: any): boolean {
  return isFunction(obj);
}

export function isStringMap(obj: any): boolean {
  return typeof obj === 'object' && obj !== null;
}

export function isPromise(obj: any): boolean {
  return obj instanceof (<any>_global).Promise;
}

export function isArray(obj: any): boolean {
  return Array.isArray(obj);
}

export function isNumber(obj): boolean {
  return typeof obj === 'number';
}

export function isDate(obj): boolean {
  return obj instanceof Date && !isNaN(obj.valueOf());
}

export function stringify(token): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token === undefined || token === null) {
    return '' + token;
  }

  if (token.name) {
    return token.name;
  }

  var res = token.toString();
  var newLineIndex = res.indexOf("\n");
  return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}

// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized

export function serializeEnum(val): number {
  return val;
}

export function deserializeEnum(val, values: Map<number, any>): any {
  return val;
}

export class StringWrapper {
  static fromCharCode(code: number): string { return String.fromCharCode(code); }

  static charCodeAt(s: string, index: number): number { return s.charCodeAt(index); }

  static split(s: string, regExp: RegExp): string[] { return s.split(regExp); }

  static equals(s: string, s2: string): boolean { return s === s2; }

  static replace(s: string, from: string, replace: string): string {
    return s.replace(from, replace);
  }

  static replaceAll(s: string, from: RegExp, replace: string): string {
    return s.replace(from, replace);
  }

  static toUpperCase(s: string): string { return s.toUpperCase(); }

  static toLowerCase(s: string): string { return s.toLowerCase(); }

  static startsWith(s: string, start: string): boolean { return s.startsWith(start); }

  static substring(s: string, start: number, end: number = null): string {
    return s.substring(start, end === null ? undefined : end);
  }

  static replaceAllMapped(s: string, from: RegExp, cb: Function): string {
    return s.replace(from, function(...matches) {
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
  constructor(public parts = []) {}

  add(part: string): void { this.parts.push(part); }

  toString(): string { return this.parts.join(""); }
}

export class NumberParseError extends BaseException {
  name: string;

  constructor(public message: string) { super(); }

  toString(): string { return this.message; }
}


export class NumberWrapper {
  static toFixed(n: number, fractionDigits: number): string { return n.toFixed(fractionDigits); }

  static equal(a: number, b: number): boolean { return a === b; }

  static parseIntAutoRadix(text: string): number {
    var result: number = parseInt(text);
    if (isNaN(result)) {
      throw new NumberParseError("Invalid integer literal when parsing " + text);
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
    throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
                               radix);
  }

  // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
  static parseFloat(text: string): number { return parseFloat(text); }

  static get NaN(): number { return NaN; }

  static isNaN(value: any): boolean { return isNaN(value); }

  static isInteger(value: any): boolean { return Number.isInteger(value); }
}

export var RegExp = _global.RegExp;

export class RegExpWrapper {
  static create(regExpStr: string, flags: string = ''): RegExp {
    flags = flags.replace(/g/g, '');
    return new _global.RegExp(regExpStr, flags + 'g');
  }
  static firstMatch(regExp: RegExp, input: string): string[] {
    // Reset multimatch regex state
    regExp.lastIndex = 0;
    return regExp.exec(input);
  }
  static test(regExp: RegExp, input: string): boolean {
    regExp.lastIndex = 0;
    return regExp.test(input);
  }
  static matcher(regExp: RegExp, input: string): {
    re: RegExp;
    input: string
  }
  {
    // Reset regex state for the case
    // someone did not loop over all matches
    // last time.
    regExp.lastIndex = 0;
    return {re: regExp, input: input};
  }
}

export class RegExpMatcherWrapper {
  static next(matcher: {
    re: RegExp;
    input: string
  }): string[] {
    return matcher.re.exec(matcher.input);
  }
}

export class FunctionWrapper {
  static apply(fn: Function, posArgs: any): any { return fn.apply(null, posArgs); }
}

// JS has NaN !== NaN
export function looseIdentical(a, b): boolean {
  return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
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
  return o !== null && (typeof o === "function" || typeof o === "object");
}

export function print(obj: Error | Object) {
  if (obj instanceof BaseException) {
    console.log(obj.stack);
  } else {
    console.log(obj);
  }
}

// Can't be all uppercase as our transpiler would think it is a special directive...
export class Json {
  static parse(s: string): Object { return _global.JSON.parse(s); }
  static stringify(data: Object): string {
    // Dart doesn't take 3 arguments
    return _global.JSON.stringify(data, null, 2);
  }
}

export class DateWrapper {
  static create(year: number, month: number = 1, day: number = 1, hour: number = 0,
                minutes: number = 0, seconds: number = 0, milliseconds: number = 0): Date {
    return new Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
  }
  static fromMillis(ms: number): Date { return new Date(ms); }
  static toMillis(date: Date): number { return date.getTime(); }
  static now(): Date { return new Date(); }
  static toJson(date: Date): string { return date.toJSON(); }
}

export function setValueOnPath(global: any, path: string, value: any) {
  var parts = path.split('.');
  var obj: any = global;
  while (parts.length > 1) {
    var name = parts.shift();
    if (obj.hasOwnProperty(name)) {
      obj = obj[name];
    } else {
      obj = obj[name] = {};
    }
  }
  obj[parts.shift()] = value;
}
