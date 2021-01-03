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
import {KnownFn, ResolvedValueArray} from './result';


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
