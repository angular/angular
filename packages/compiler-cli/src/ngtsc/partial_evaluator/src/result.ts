/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';


/**
 * A value resulting from static resolution.
 *
 * This could be a primitive, collection type, reference to a `ts.Node` that declares a
 * non-primitive value, or a special `DynamicValue` type which indicates the value was not
 * available statically.
 */
export type ResolvedValue = number | boolean | string | null | undefined | Reference | EnumValue |
    ResolvedValueArray | ResolvedValueMap | BuiltinFn | DynamicValue;

/**
 * Represents a value which cannot be determined statically.
 *
 * Use `isDynamicValue` to determine whether a `ResolvedValue` is a `DynamicValue`.
 */
export class DynamicValue {
  /**
   * This is needed so the "is DynamicValue" assertion of `isDynamicValue` actually has meaning.
   *
   * Otherwise, "is DynamicValue" is akin to "is {}" which doesn't trigger narrowing.
   */
  private _isDynamic = true;
}

/**
 * An internal flyweight for `DynamicValue`. Eventually the dynamic value will carry information
 * on the location of the node that could not be statically computed.
 */
export const DYNAMIC_VALUE: DynamicValue = new DynamicValue();

/**
 * Used to test whether a `ResolvedValue` is a `DynamicValue`.
 */
export function isDynamicValue(value: any): value is DynamicValue {
  return value === DYNAMIC_VALUE;
}

/**
 * An array of `ResolvedValue`s.
 *
 * This is a reified type to allow the circular reference of `ResolvedValue` -> `ResolvedValueArray`
 * ->
 * `ResolvedValue`.
 */
export interface ResolvedValueArray extends Array<ResolvedValue> {}

/**
 * A map of strings to `ResolvedValue`s.
 *
 * This is a reified type to allow the circular reference of `ResolvedValue` -> `ResolvedValueMap` ->
 * `ResolvedValue`.
 */ export interface ResolvedValueMap extends Map<string, ResolvedValue> {}

/**
 * A value member of an enumeration.
 *
 * Contains a `Reference` to the enumeration itself, and the name of the referenced member.
 */
export class EnumValue {
  constructor(
      readonly enumRef: Reference<ts.EnumDeclaration>, readonly name: string,
      readonly resolved: ResolvedValue) {}
}

/**
 * An implementation of a builtin function, such as `Array.prototype.slice`.
 */
export abstract class BuiltinFn { abstract evaluate(args: ResolvedValueArray): ResolvedValue; }
