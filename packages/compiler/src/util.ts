/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from './constant_pool';

import * as o from './output/output_ast';
import {ParseError} from './parse_util';

const DASH_CASE_REGEXP = /-+([a-z0-9])/g;

export function dashCaseToCamelCase(input: string): string {
  return input.replace(DASH_CASE_REGEXP, (...m: any[]) => m[1].toUpperCase());
}

export function splitAtColon(input: string, defaultValues: string[]): string[] {
  return _splitAt(input, ':', defaultValues);
}

export function splitAtPeriod(input: string, defaultValues: string[]): string[] {
  return _splitAt(input, '.', defaultValues);
}

function _splitAt(input: string, character: string, defaultValues: string[]): string[] {
  const characterIndex = input.indexOf(character);
  if (characterIndex == -1) return defaultValues;
  return [input.slice(0, characterIndex).trim(), input.slice(characterIndex + 1).trim()];
}

export function visitValue(value: any, visitor: ValueVisitor, context: any): any {
  if (Array.isArray(value)) {
    return visitor.visitArray(<any[]>value, context);
  }

  if (isStrictStringMap(value)) {
    return visitor.visitStringMap(<{[key: string]: any}>value, context);
  }

  if (value == null || typeof value == 'string' || typeof value == 'number' ||
      typeof value == 'boolean') {
    return visitor.visitPrimitive(value, context);
  }

  return visitor.visitOther(value, context);
}

export function isDefined(val: any): boolean {
  return val !== null && val !== undefined;
}

export function noUndefined<T>(val: T|undefined): T {
  return val === undefined ? null! : val;
}

export interface ValueVisitor {
  visitArray(arr: any[], context: any): any;
  visitStringMap(map: {[key: string]: any}, context: any): any;
  visitPrimitive(value: any, context: any): any;
  visitOther(value: any, context: any): any;
}

export class ValueTransformer implements ValueVisitor {
  visitArray(arr: any[], context: any): any {
    return arr.map(value => visitValue(value, this, context));
  }
  visitStringMap(map: {[key: string]: any}, context: any): any {
    const result: {[key: string]: any} = {};
    Object.keys(map).forEach(key => {
      result[key] = visitValue(map[key], this, context);
    });
    return result;
  }
  visitPrimitive(value: any, context: any): any {
    return value;
  }
  visitOther(value: any, context: any): any {
    return value;
  }
}

export type SyncAsync<T> = T|Promise<T>;

export const SyncAsync = {
  assertSync: <T>(value: SyncAsync<T>): T => {
    if (isPromise(value)) {
      throw new Error(`Illegal state: value cannot be a promise`);
    }
    return value;
  },
  then: <T, R>(value: SyncAsync<T>, cb: (value: T) => R | Promise<R>| SyncAsync<R>):
      SyncAsync<R> => {
        return isPromise(value) ? value.then(cb) : cb(value);
      },
  all: <T>(syncAsyncValues: SyncAsync<T>[]): SyncAsync<T[]> => {
    return syncAsyncValues.some(isPromise) ? Promise.all(syncAsyncValues) : syncAsyncValues as T[];
  }
};

export function error(msg: string): never {
  throw new Error(`Internal Error: ${msg}`);
}

export function syntaxError(msg: string, parseErrors?: ParseError[]): Error {
  const error = Error(msg);
  (error as any)[ERROR_SYNTAX_ERROR] = true;
  if (parseErrors) (error as any)[ERROR_PARSE_ERRORS] = parseErrors;
  return error;
}

const ERROR_SYNTAX_ERROR = 'ngSyntaxError';
const ERROR_PARSE_ERRORS = 'ngParseErrors';

export function isSyntaxError(error: Error): boolean {
  return (error as any)[ERROR_SYNTAX_ERROR];
}

export function getParseErrors(error: Error): ParseError[] {
  return (error as any)[ERROR_PARSE_ERRORS] || [];
}

// Escape characters that have a special meaning in Regular Expressions
export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

const STRING_MAP_PROTO = Object.getPrototypeOf({});
function isStrictStringMap(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}

export type Byte = number;

export function utf8Encode(str: string): Byte[] {
  let encoded: Byte[] = [];
  for (let index = 0; index < str.length; index++) {
    let codePoint = str.charCodeAt(index);

    // decode surrogate
    // see https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && str.length > (index + 1)) {
      const low = str.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        index++;
        codePoint = ((codePoint - 0xd800) << 10) + low - 0xdc00 + 0x10000;
      }
    }

    if (codePoint <= 0x7f) {
      encoded.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      encoded.push(((codePoint >> 6) & 0x1F) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0xffff) {
      encoded.push(
          (codePoint >> 12) | 0xe0, ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0x1fffff) {
      encoded.push(
          ((codePoint >> 18) & 0x07) | 0xf0, ((codePoint >> 12) & 0x3f) | 0x80,
          ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    }
  }

  return encoded;
}

export interface OutputContext {
  genFilePath: string;
  statements: o.Statement[];
  constantPool: ConstantPool;
  importExpr(reference: any, typeParams?: o.Type[]|null, useSummaries?: boolean): o.Expression;
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (Array.isArray(token)) {
    return '[' + token.map(stringify).join(', ') + ']';
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  if (!token.toString) {
    return 'object';
  }

  // WARNING: do not try to `JSON.stringify(token)` here
  // see https://github.com/angular/angular/issues/23440
  const res = token.toString();

  if (res == null) {
    return '' + res;
  }

  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

/**
 * Lazily retrieves the reference value from a forwardRef.
 */
export function resolveForwardRef(type: any): any {
  if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__')) {
    return type();
  } else {
    return type;
  }
}

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

export class Version {
  public readonly major: string;
  public readonly minor: string;
  public readonly patch: string;

  constructor(public full: string) {
    const splits = full.split('.');
    this.major = splits[0];
    this.minor = splits[1];
    this.patch = splits.slice(2).join('.');
  }
}

export interface Console {
  log(message: string): void;
  warn(message: string): void;
}


declare var WorkerGlobalScope: any;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
declare var global: any;
const __window = typeof window !== 'undefined' && window;
const __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
const __global = typeof global !== 'undefined' && global;

// Check __global first, because in Node tests both __global and __window may be defined and _global
// should be __global in that case.
const _global: {[name: string]: any} = __global || __window || __self;
export {_global as global};

export function newArray<T = any>(size: number): T[];
export function newArray<T>(size: number, value: T): T[];
export function newArray<T>(size: number, value?: T): T[] {
  const list: T[] = [];
  for (let i = 0; i < size; i++) {
    list.push(value!);
  }
  return list;
}

/**
 * Partitions a given array into 2 arrays, based on a boolean value returned by the condition
 * function.
 *
 * @param arr Input array that should be partitioned
 * @param conditionFn Condition function that is called for each item in a given array and returns a
 * boolean value.
 */
export function partitionArray<T, F = T>(
    arr: (T|F)[], conditionFn: (value: T|F) => boolean): [T[], F[]] {
  const truthy: T[] = [];
  const falsy: F[] = [];
  for (const item of arr) {
    (conditionFn(item) ? truthy : falsy).push(item as any);
  }
  return [truthy, falsy];
}
