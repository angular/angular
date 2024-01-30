/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import * as ng from '../instruction';
import type {CompilationJob} from '../compilation';

/**
 * Transforms a `TwoWayBindingSet` expression into an expression that either
 * sets a value through the `twoWayBindingSet` instruction or falls back to setting
 * the value directly. E.g. the expression `TwoWayBindingSet(target, value)` becomes:
 * `ng.twoWayBindingSet(target, value) || (target = value)`.
 */
export function transformTwoWayBindingSet(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.TwoWayListener) {
        ir.transformExpressionsInOp(op, (expr) => {
          if (expr instanceof ir.TwoWayBindingSetExpr) {
            if ((!(expr.target instanceof o.ReadPropExpr) &&
                 !(expr.target instanceof o.ReadKeyExpr))) {
              throw new Error('AssertionError: unresolved TwoWayBindingSet expression');
            }
            return ng.twoWayBindingSet(expr.target, expr.value).or(expr.target.set(expr.value));
          }
          return expr;
        }, ir.VisitorContextFlag.InChildOperation);
      }
    }
  }
}
