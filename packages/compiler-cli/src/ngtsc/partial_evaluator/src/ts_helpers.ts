/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ObjectAssignBuiltinFn} from './builtin';
import {DynamicValue} from './dynamic';
import {KnownFn, ResolvedValue, ResolvedValueArray} from './result';


// Use the same implementation we use for `Object.assign()`. Semantically these functions are the
// same, so they can also share the same evaluation code.
export class AssignHelperFn extends ObjectAssignBuiltinFn {}

// Used for both `__spread()` and `__spreadArrays()` TypeScript helper functions.
export class SpreadHelperFn extends KnownFn {
  evaluate(node: ts.Node, args: ResolvedValueArray): ResolvedValueArray {
    const result: ResolvedValueArray = [];

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

// Used for `__spreadArray` TypeScript helper function.
export class SpreadArrayHelperFn extends KnownFn {
  evaluate(node: ts.Node, args: ResolvedValueArray): ResolvedValue {
    if (args.length !== 2) {
      return DynamicValue.fromUnknown(node);
    }

    const [to, from] = args;
    if (to instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, to);
    } else if (from instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, from);
    }

    if (!Array.isArray(to)) {
      return DynamicValue.fromInvalidExpressionType(node, to);
    } else if (!Array.isArray(from)) {
      return DynamicValue.fromInvalidExpressionType(node, from);
    }

    return to.concat(from);
  }
}

// Used for `__read` TypeScript helper function.
export class ReadHelperFn extends KnownFn {
  evaluate(node: ts.Node, args: ResolvedValueArray): ResolvedValue {
    if (args.length !== 1) {
      // The `__read` helper accepts a second argument `n` but that case is not supported.
      return DynamicValue.fromUnknown(node);
    }

    const [value] = args;
    if (value instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, value);
    }

    if (!Array.isArray(value)) {
      return DynamicValue.fromInvalidExpressionType(node, value);
    }

    return value;
  }
}
