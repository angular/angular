/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Removes any `storeLet` calls that aren't referenced outside of the current view.
 */
export function optimizeStoreLet(job: CompilationJob): void {
  const letUsedExternally = new Set<ir.XrefId>();

  // Since `@let` declarations can be referenced in child views, both in
  // the creation block (via listeners) and in the update block, we have
  // to look through all the ops to find the references.
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.visitExpressionsInOp(op, (expr) => {
        if (expr instanceof ir.ContextLetReferenceExpr) {
          letUsedExternally.add(expr.target);
        }
      });
    }
  }

  // TODO(crisbeto): potentially remove the unused calls completely, pending discussion.
  for (const unit of job.units) {
    for (const op of unit.update) {
      ir.transformExpressionsInOp(
        op,
        (expression) =>
          expression instanceof ir.StoreLetExpr && !letUsedExternally.has(expression.target)
            ? expression.value
            : expression,
        ir.VisitorContextFlag.None,
      );
    }
  }
}
