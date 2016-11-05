/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isBlank, isPrimitive, isStrictStringMap} from './facade/lang';

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

export function sanitizeIdentifier(name: string): string {
  return name.replace(/\W/g, '_');
}

export function visitValue(value: any, visitor: ValueVisitor, context: any): any {
  if (Array.isArray(value)) {
    return visitor.visitArray(<any[]>value, context);
  }

  if (isStrictStringMap(value)) {
    return visitor.visitStringMap(<{[key: string]: any}>value, context);
  }

  if (isBlank(value) || isPrimitive(value)) {
    return visitor.visitPrimitive(value, context);
  }

  return visitor.visitOther(value, context);
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
    var result: {[key: string]: any} = {};
    Object.keys(map).forEach(key => { result[key] = visitValue(map[key], this, context); });
    return result;
  }
  visitPrimitive(value: any, context: any): any { return value; }
  visitOther(value: any, context: any): any { return value; }
}

export class SyncAsyncResult<T> {
  constructor(public syncResult: T, public asyncResult: Promise<T> = null) {
    if (!asyncResult) {
      this.asyncResult = Promise.resolve(syncResult);
    }
  }
}
