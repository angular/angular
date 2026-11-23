/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Replaces references inside tracking functions that would break at runtime with placeholders.
 */
export function removeIllegalTrackReferences(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.RepeaterCreate) {
        op.track = ir.transformExpressionsInExpression(
          op.track,
          (expr) =>
            // Variables are not available in tracking expressions so the presence of a
            // `ReadVariableExpr` indicates an invalid usage. Note that this only holds
            // true if this op runs after variables have been resolved.
            expr instanceof ir.ReadVariableExpr ? new ir.InvalidExpr(expr.sourceSpan) : expr,
          ir.VisitorContextFlag.None,
        );
      }
    }
  }
}
