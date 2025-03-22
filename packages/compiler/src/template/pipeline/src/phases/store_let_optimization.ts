/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Removes any `storeLet` calls that aren't referenced outside of the current view.
 */
export function optimizeStoreLet(job: CompilationJob): void {
  const letUsedExternally = new Set<ir.XrefId>();
  const declareLetOps = new Map<ir.XrefId, ir.DeclareLetOp>();

  // Since `@let` declarations can be referenced in child views, both in
  // the creation block (via listeners) and in the update block, we have
  // to look through all the ops to find the references.
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      // Take advantage that we're already looking through all the ops and track some more info.
      if (op.kind === ir.OpKind.DeclareLet) {
        declareLetOps.set(op.xref, op);
      }

      ir.visitExpressionsInOp(op, (expr) => {
        if (expr instanceof ir.ContextLetReferenceExpr) {
          letUsedExternally.add(expr.target);
        }
      });
    }
  }

  for (const unit of job.units) {
    for (const op of unit.update) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          // If a @let isn't used in other views, we don't have to store its value.
          if (expr instanceof ir.StoreLetExpr && !letUsedExternally.has(expr.target)) {
            // Furthermore, if the @let isn't using pipes, we can also drop its declareLet op.
            // We need to keep the declareLet if there are pipes, because they can use DI which
            // requires the TNode created by declareLet.
            if (!hasPipe(expr)) {
              ir.OpList.remove<ir.CreateOp>(declareLetOps.get(expr.target)!);
            }
            return expr.value;
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

/** Determines if a `storeLet` expression contains a pipe. */
function hasPipe(root: ir.StoreLetExpr): boolean {
  let result = false;

  ir.transformExpressionsInExpression(
    root,
    (expr) => {
      if (expr instanceof ir.PipeBindingExpr || expr instanceof ir.PipeBindingVariadicExpr) {
        result = true;
      }
      return expr;
    },
    ir.VisitorContextFlag.None,
  );

  return result;
}
