/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob, ComponentCompilationJob} from '../compilation';

/**
 * Pipes that accept more than 4 arguments are variadic, and are handled with a different runtime
 * instruction.
 */
export function createVariadicPipes(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (!(expr instanceof ir.PipeBindingExpr)) {
            return expr;
          }

          // Pipes are variadic if they have more than 4 arguments.
          if (expr.args.length <= 4) {
            return expr;
          }

          return new ir.PipeBindingVariadicExpr(
            expr.target,
            expr.targetSlot,
            expr.name,
            o.literalArr(expr.args),
            expr.args.length,
          );
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
