/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {R3Reference} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

export function wrapReference<TExpression>(wrapped: o.WrappedNodeExpr<TExpression>): R3Reference {
  return {value: wrapped, type: wrapped};
}
