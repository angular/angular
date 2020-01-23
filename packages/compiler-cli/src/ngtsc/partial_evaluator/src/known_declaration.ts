/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownDeclaration} from '../../reflection/src/host';

import {ObjectAssignBuiltinFn} from './builtin';
import {ResolvedValue} from './result';

/** Resolved value for the JavaScript global `Object` declaration .*/
export const jsGlobalObjectValue = new Map([['assign', new ObjectAssignBuiltinFn()]]);

/**
 * Resolves the specified known declaration to a resolved value. For example,
 * the known JavaScript global `Object` will resolve to a `Map` that provides the
 * `assign` method with a builtin function. This enables evaluation of `Object.assign`.
 */
export function resolveKnownDeclaration(decl: KnownDeclaration): ResolvedValue {
  switch (decl) {
    case KnownDeclaration.JsGlobalObject:
      return jsGlobalObjectValue;
    default:
      throw new Error(`Cannot resolve known declaration. Received: ${KnownDeclaration[decl]}.`);
  }
}
