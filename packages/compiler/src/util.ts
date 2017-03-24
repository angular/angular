/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const MODULE_SUFFIX = '';

const CAMEL_CASE_REGEXP = /([A-Z])/g;
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;

export function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: any[]) => '-' + m[1].toLowerCase());
}

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

export function noUndefined<T>(val: T | undefined): T {
  return val === undefined ? null ! : val;
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
    Object.keys(map).forEach(key => { result[key] = visitValue(map[key], this, context); });
    return result;
  }
  visitPrimitive(value: any, context: any): any { return value; }
  visitOther(value: any, context: any): any { return value; }
}

export class SyncAsyncResult<T> {
  constructor(public syncResult: T|null, public asyncResult: Promise<T>|null = null) {
    if (!asyncResult) {
      this.asyncResult = Promise.resolve(syncResult);
    }
  }
}

export function syntaxError(msg: string): Error {
  const error = Error(msg);
  (error as any)[ERROR_SYNTAX_ERROR] = true;
  return error;
}

const ERROR_SYNTAX_ERROR = 'ngSyntaxError';

export function isSyntaxError(error: Error): boolean {
  return (error as any)[ERROR_SYNTAX_ERROR];
}

export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

const STRING_MAP_PROTO = Object.getPrototypeOf({});
function isStrictStringMap(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}

export function utf8Encode(str: string): string {
  let encoded = '';
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
      encoded += String.fromCharCode(codePoint);
    } else if (codePoint <= 0x7ff) {
      encoded += String.fromCharCode(((codePoint >> 6) & 0x1F) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0xffff) {
      encoded += String.fromCharCode(
          (codePoint >> 12) | 0xe0, ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0x1fffff) {
      encoded += String.fromCharCode(
          ((codePoint >> 18) & 0x07) | 0xf0, ((codePoint >> 12) & 0x3f) | 0x80,
          ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    }
  }

  return encoded;
}
