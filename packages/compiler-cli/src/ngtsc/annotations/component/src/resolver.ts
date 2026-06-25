/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ForeignFunctionResolver} from '../../../partial_evaluator';

/**
 * A resolver that intercepts any call expression inside `foreignImports` and resolves it
 * directly to its first argument (assuming it is an adapter wrapping the foreign component).
 */
export const foreignComponentResolver: ForeignFunctionResolver = (
  _,
  callExpr,
  resolve,
  unresolvable,
) => {
  const arg = callExpr.arguments[0];
  return arg ? resolve(arg) : unresolvable;
};
