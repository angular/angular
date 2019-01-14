/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BuiltinFn, DYNAMIC_VALUE, ResolvedValue, ResolvedValueArray} from './result';

export class ArraySliceBuiltinFn extends BuiltinFn {
  constructor(private lhs: ResolvedValueArray) { super(); }

  evaluate(args: ResolvedValueArray): ResolvedValue {
    if (args.length === 0) {
      return this.lhs;
    } else {
      return DYNAMIC_VALUE;
    }
  }
}
