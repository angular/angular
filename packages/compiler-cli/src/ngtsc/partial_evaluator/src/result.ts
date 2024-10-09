/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {Reference} from '../../imports';
import {Declaration} from '../../reflection';

import {DynamicValue} from './dynamic';
import {SyntheticValue} from './synthetic';

/**
 * A value resulting from static resolution.
 *
 * This could be a primitive, collection type, reference to a `ts.Node` that declares a
 * non-primitive value, or a special `DynamicValue` type which indicates the value was not
 * available statically.
 */
export type ResolvedValue =
  | number
  | boolean
  | string
  | null
  | undefined
  | Reference
  | EnumValue
  | ResolvedValueArray
  | ResolvedValueMap
  | ResolvedModule
  | KnownFn
  | SyntheticValue<unknown>
  | DynamicValue<unknown>;

/**
 * An array of `ResolvedValue`s.
 *
 * This is a reified type to allow the circular reference of `ResolvedValue` -> `ResolvedValueArray`
 * -> `ResolvedValue`.
 */
export interface ResolvedValueArray extends Array<ResolvedValue> {}

/**
 * A map of strings to `ResolvedValue`s.
 *
 * This is a reified type to allow the circular reference of `ResolvedValue` -> `ResolvedValueMap`
 * -> `ResolvedValue`.
 */
export interface ResolvedValueMap extends Map<string, ResolvedValue> {}

/**
 * A collection of publicly exported declarations from a module. Each declaration is evaluated
 * lazily upon request.
 */
export class ResolvedModule {
  constructor(
    private exports: Map<string, Declaration>,
    private evaluate: (decl: Declaration) => ResolvedValue,
  ) {}

  getExport(name: string): ResolvedValue {
    if (!this.exports.has(name)) {
      return undefined;
    }

    return this.evaluate(this.exports.get(name)!);
  }

  getExports(): ResolvedValueMap {
    const map = new Map<string, ResolvedValue>();
    this.exports.forEach((decl, name) => {
      map.set(name, this.evaluate(decl));
    });
    return map;
  }
}

/**
 * A value member of an enumeration.
 *
 * Contains a `Reference` to the enumeration itself, and the name of the referenced member.
 */
export class EnumValue {
  constructor(
    readonly enumRef: Reference<ts.Declaration>,
    readonly name: string,
    readonly resolved: ResolvedValue,
  ) {}
}

/**
 * An implementation of a known function that can be statically evaluated.
 * It could be a built-in function or method (such as `Array.prototype.slice`) or a TypeScript
 * helper (such as `__spread`).
 */
export abstract class KnownFn {
  abstract evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue;
}
