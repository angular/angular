/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {DynamicValue} from './dynamic';
import {ResolvedValueArray} from './result';

export function evaluateTsSpreadHelper(
    node: ts.Node, args: ResolvedValueArray): ResolvedValueArray {
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
