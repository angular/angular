/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseError} from './facade/errors';
import {isPrimitive, isStrictStringMap} from './facade/lang';
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

export function visitValue(
    value: any, visitor: ValueVisitor, context: any,
    visited: WeakMap<any, any> = new WeakMap()): any {
  if (Array.isArray(value)) {
    return visitor.visitArray(<any[]>value, context, visited);
  }

  if (isStrictStringMap(value)) {
    return visitor.visitStringMap(<{[key: string]: any}>value, context, visited);
  }

  if (value == null || isPrimitive(value)) {
    return visitor.visitPrimitive(value, context, visited);
  }

  return visitor.visitOther(value, context, visited);
}

export interface ValueVisitor {
  visitArray(arr: any[], context: any, visited: WeakMap<any, any>): any;
  visitStringMap(map: {[key: string]: any}, context: any, visited: WeakMap<any, any>): any;
  visitPrimitive(value: any, context: any, visited: WeakMap<any, any>): any;
  visitOther(value: any, context: any, visited: WeakMap<any, any>): any;
}

export class ValueTransformer implements ValueVisitor {
  visitArray(arr: any[], context: any, visited: WeakMap<any, any> = new WeakMap()): any {
    if (visited.has(arr)) {
      return visited.get(arr);
    }
    const result: any[] = [];
    visited.set(arr, result);
    for (const value of arr) {
      result.push(visitValue(value, this, context, visited));
    }
    return result;
  }
  visitStringMap(
      map: {[key: string]: any}, context: any, visited: WeakMap<any, any> = new WeakMap()): any {
    if (visited.has(map)) {
      return visited.get(map);
    }
    const result: {[key: string]: any} = {};
    visited.set(map, result);
    Object.keys(map).forEach(
        key => { result[key] = visitValue(map[key], this, context, visited); });
    return result;
  }
  visitPrimitive(value: any, context: any, visited: WeakMap<any, any> = new WeakMap()): any {
    return value;
  }
  visitOther(value: any, context: any, visited: WeakMap<any, any> = new WeakMap()): any {
    return value;
  }
}

export class SyncAsyncResult<T> {
  constructor(public syncResult: T, public asyncResult: Promise<T> = null) {
    if (!asyncResult) {
      this.asyncResult = Promise.resolve(syncResult);
    }
  }
}

export class SyntaxError extends BaseError {}
