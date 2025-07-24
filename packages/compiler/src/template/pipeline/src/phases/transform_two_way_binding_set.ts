/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
        ir.transformExpressionsInOp(
          op,
          (expr) => {
            if (!(expr instanceof ir.TwoWayBindingSetExpr)) {
              return expr;
            }

            const {target, value} = expr;

            if (target instanceof o.ReadPropExpr || target instanceof o.ReadKeyExpr) {
              return ng.twoWayBindingSet(target, value).or(target.set(value));
            }

            // ASSUMPTION: here we're assuming that `ReadVariableExpr` will be a reference
            // to a local template variable. This appears to be the case at the time of writing.
            // If the expression is targeting a variable read, we only emit the `twoWayBindingSet`
            // since the fallback would be attempting to write into a constant. Invalid usages will be
            // flagged during template type checking.
            if (target instanceof ir.ReadVariableExpr) {
              return ng.twoWayBindingSet(target, value);
            }

            throw new Error(`Unsupported expression in two-way action binding.`);
          },
          ir.VisitorContextFlag.InChildOperation,
        );
      }
    }
  }
}
