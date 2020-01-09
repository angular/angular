/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BuiltinDeclaration} from '../../reflection/src/host';

import {ObjectAssignBuiltinFn} from './builtin';
import {ResolvedValue} from './result';

/** Resolved value for the JavaScript global `Object` declaration .*/
export const jsGlobalObjectValue = new Map([['assign', new ObjectAssignBuiltinFn()]]);

/**
 * Resolves the specified builtin declaration to a resolved value. For example,
 * the known JavaScript global `Object` will resolve to a `Map` that provides the
 * `assign` method with a builtin function. This enables evaluation of `Object.assign`.
 */
export function resolveBuiltinDeclaration(builtinDecl: BuiltinDeclaration): ResolvedValue {
  switch (builtinDecl) {
    case BuiltinDeclaration.JsGlobalObject:
      return jsGlobalObjectValue;
    default:
      throw new Error(
          `Cannot resolve unknown builtin declaration ${BuiltinDeclaration[builtinDecl]}`);
  }
}
