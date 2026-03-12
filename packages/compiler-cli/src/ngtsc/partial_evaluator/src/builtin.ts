/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DynamicValue} from './dynamic';
import {EnumValue, KnownFn, ResolvedValue, ResolvedValueArray} from './result';

export class ArraySliceBuiltinFn extends KnownFn {
  constructor(private lhs: ResolvedValueArray) {
    super();
  }

  override evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
    if (args.length === 0) {
      return this.lhs;
    } else {
      return DynamicValue.fromUnknown(node);
    }
  }
}

export class ArrayConcatBuiltinFn extends KnownFn {
  constructor(private lhs: ResolvedValueArray) {
    super();
  }

  override evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
    const result: ResolvedValueArray = [...this.lhs];
    for (const arg of args) {
      if (arg instanceof DynamicValue) {
        result.push(DynamicValue.fromDynamicInput(node, arg));
      } else if (Array.isArray(arg)) {
        result.push(...arg);
      } else {
        result.push(arg);
      }
    }
    return result;
  }
}

export class StringConcatBuiltinFn extends KnownFn {
  constructor(private lhs: string) {
    super();
  }

  override evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
    let result = this.lhs;
    for (const arg of args) {
      const resolved = arg instanceof EnumValue ? arg.resolved : arg;

      if (
        typeof resolved === 'string' ||
        typeof resolved === 'number' ||
        typeof resolved === 'boolean' ||
        resolved == null
      ) {
        // Cast to `any`, because `concat` will convert
        // anything to a string, but TS only allows strings.
        result = result.concat(resolved as any);
      } else {
        return DynamicValue.fromUnknown(node);
      }
    }
    return result;
  }
}
