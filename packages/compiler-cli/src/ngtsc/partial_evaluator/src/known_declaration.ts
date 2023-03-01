/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KnownDeclaration} from '../../reflection/src/host';

import {ObjectAssignBuiltinFn} from './builtin';
import {ResolvedValue} from './result';
import {AssignHelperFn, ReadHelperFn, SpreadArrayHelperFn, SpreadHelperFn} from './ts_helpers';

/** Resolved value for the JavaScript global `Object` declaration. */
export const jsGlobalObjectValue = new Map([['assign', new ObjectAssignBuiltinFn()]]);

/** Resolved value for the `__assign()` TypeScript helper declaration. */
const assignTsHelperFn = new AssignHelperFn();

/** Resolved value for the `__spread()` and `__spreadArrays()` TypeScript helper declarations. */
const spreadTsHelperFn = new SpreadHelperFn();

/** Resolved value for the `__spreadArray()` TypeScript helper declarations. */
const spreadArrayTsHelperFn = new SpreadArrayHelperFn();

/** Resolved value for the `__read()` TypeScript helper declarations. */
const readTsHelperFn = new ReadHelperFn();

/**
 * Resolves the specified known declaration to a resolved value. For example,
 * the known JavaScript global `Object` will resolve to a `Map` that provides the
 * `assign` method with a built-in function. This enables evaluation of `Object.assign`.
 */
export function resolveKnownDeclaration(decl: KnownDeclaration): ResolvedValue {
  switch (decl) {
    case KnownDeclaration.JsGlobalObject:
      return jsGlobalObjectValue;
    case KnownDeclaration.TsHelperAssign:
      return assignTsHelperFn;
    case KnownDeclaration.TsHelperSpread:
    case KnownDeclaration.TsHelperSpreadArrays:
      return spreadTsHelperFn;
    case KnownDeclaration.TsHelperSpreadArray:
      return spreadArrayTsHelperFn;
    case KnownDeclaration.TsHelperRead:
      return readTsHelperFn;
    default:
      throw new Error(`Cannot resolve known declaration. Received: ${KnownDeclaration[decl]}.`);
  }
}
