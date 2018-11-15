/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {DynamicValue} from './dynamic';
import {BuiltinFn, ResolvedValue, ResolvedValueArray} from './result';

export class ArraySliceBuiltinFn extends BuiltinFn {
  constructor(private node: ts.Node, private lhs: ResolvedValueArray) { super(); }

  evaluate(args: ResolvedValueArray): ResolvedValue {
    if (args.length === 0) {
      return this.lhs;
    } else {
      return DynamicValue.fromUnknown(this.node);
    }
  }
}
