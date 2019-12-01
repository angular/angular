/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TsHelperFnKind} from '../../reflection';

import {DynamicValue} from './dynamic';
import {TsHelperFn, ResolvedValue, ResolvedValueArray} from './result';

export class SpreadTsHelperFn extends TsHelperFn {
  constructor(private node: ts.Node) { super(); }

  evaluate(args: ResolvedValueArray): ResolvedValue {
    const result: ResolvedValueArray = [];

    for (const arg of args) {
      if (arg instanceof DynamicValue) {
        result.push(DynamicValue.fromDynamicInput(this.node, arg));
      } else if (Array.isArray(arg)) {
        result.push(...arg);
      } else {
        result.push(arg);
      }
    }

    return result;
  }
}

export class SpreadArraysTsHelperFn extends SpreadTsHelperFn {
}

export function getTsHelperFn(kind: TsHelperFnKind, node: ts.Node): TsHelperFn {
  switch (kind) {
    case TsHelperFnKind.Spread:
      return new SpreadTsHelperFn(node);
    case TsHelperFnKind.SpreadArrays:
      return new SpreadArraysTsHelperFn(node);
    default:
      throw new Error(`Unknown TypeScript helper kind: ${kind}`);
  }
}
