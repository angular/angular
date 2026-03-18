/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilationJob, CompilationUnit} from '../compilation';
import * as ir from '../../ir';
import * as o from '../../../../output/output_ast';

/**
 * Finds arrow functions written by the user and converts them into pipeline-specific expressions.
 */
export function generateArrowFunctions(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      // Preserve arrow functions in listeners in place, because:
      // 1. They need to be able to access $event.
      // 2. We don't need to store them.
      if (
        op.kind !== ir.OpKind.Animation &&
        op.kind !== ir.OpKind.AnimationListener &&
        op.kind !== ir.OpKind.Listener &&
        op.kind !== ir.OpKind.TwoWayListener
      ) {
        addArrowFunctions(unit, op);
      }
    }

    for (const op of unit.update) {
      addArrowFunctions(unit, op);
    }
  }
}

function addArrowFunctions(unit: CompilationUnit, op: ir.CreateOp | ir.UpdateOp) {
  ir.transformExpressionsInOp(
    op,
    (expr, flags) => {
      if (
        !(expr instanceof o.ArrowFunctionExpr) ||
        flags & ir.VisitorContextFlag.InChildOperation // Keep nested arrow functions as is.
      ) {
        return expr;
      }

      if (Array.isArray(expr.body)) {
        // The expression syntax doesn't support multi-line arrow functions, but the output
        // AST does. We don't need to handle them here if the user isn't able to write one.
        throw new Error('AssertionError: unexpected multi-line arrow function');
      }

      const arrowFunction = new ir.ArrowFunctionExpr(expr.params, expr.body);
      unit.functions.add(arrowFunction);
      return arrowFunction;
    },
    ir.VisitorContextFlag.None,
  );
}
