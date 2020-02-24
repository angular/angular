/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TsHelperFn} from '../../reflection';

import {ObjectAssignBuiltinFn} from './builtin';
import {DynamicValue} from './dynamic';
import {ResolvedValue, ResolvedValueArray} from './result';


/**
 * Instance of the `Object.assign` builtin function. Used for evaluating
 * the "__assign" TypeScript helper.
 */
const objectAssignBuiltinFn = new ObjectAssignBuiltinFn();

export function evaluateTsHelperInline(
    helper: TsHelperFn, node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
  switch (helper) {
    case TsHelperFn.Assign:
      // Use the same implementation we use for `Object.assign`. Semantically these
      // functions are the same, so they can also share the same evaluation code.
      return objectAssignBuiltinFn.evaluate(node, args);
    case TsHelperFn.Spread:
    case TsHelperFn.SpreadArrays:
      return evaluateTsSpreadHelper(node, args);
    default:
      throw new Error(`Cannot evaluate TypeScript helper function: ${TsHelperFn[helper]}`);
  }
}

function evaluateTsSpreadHelper(node: ts.Node, args: ResolvedValueArray): ResolvedValueArray {
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
