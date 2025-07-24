/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Any variable inside a listener with the name `$event` will be transformed into a output lexical
 * read immediately, and does not participate in any of the normal logic for handling variables.
 */
export function resolveDollarEvent(job: CompilationJob): void {
  for (const unit of job.units) {
    transformDollarEvent(unit.create);
    transformDollarEvent(unit.update);
  }
}

function transformDollarEvent(ops: ir.OpList<ir.CreateOp> | ir.OpList<ir.UpdateOp>): void {
  for (const op of ops) {
    if (
      op.kind === ir.OpKind.Listener ||
      op.kind === ir.OpKind.TwoWayListener ||
      op.kind === ir.OpKind.AnimationListener
    ) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (expr instanceof ir.LexicalReadExpr && expr.name === '$event') {
            // Two-way listeners always consume `$event` so they omit this field.
            if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.AnimationListener) {
              op.consumesDollarEvent = true;
            }
            return new o.ReadVarExpr(expr.name);
          }
          return expr;
        },
        ir.VisitorContextFlag.InChildOperation,
      );
    }
  }
}
