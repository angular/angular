/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {DynamicValue} from './dynamic';
import {KnownFn, ResolvedValue, ResolvedValueArray} from './result';

export class ArraySliceBuiltinFn extends KnownFn {
  constructor(private lhs: ResolvedValueArray) {
    super();
  }

  evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
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

  evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
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

export class ObjectAssignBuiltinFn extends KnownFn {
  evaluate(node: ts.CallExpression, args: ResolvedValueArray): ResolvedValue {
    if (args.length === 0) {
      return DynamicValue.fromUnsupportedSyntax(node);
    }
    for (const arg of args) {
      if (arg instanceof DynamicValue) {
        return DynamicValue.fromDynamicInput(node, arg);
      } else if (!(arg instanceof Map)) {
        return DynamicValue.fromUnsupportedSyntax(node);
      }
    }
    const [target, ...sources] = args as Map<string, ResolvedValue>[];
    for (const source of sources) {
      source.forEach((value, key) => target.set(key, value));
    }
    return target;
  }
}
