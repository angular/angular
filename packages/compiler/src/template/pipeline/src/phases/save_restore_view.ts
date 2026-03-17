/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * When inside of a listener, we may need access to one or more enclosing views. Therefore, each
 * view should save the current view, and each listener must have the ability to restore the
 * appropriate view. We eagerly generate all save view variables; they will be optimized away later.
 */
export function saveAndRestoreView(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const expr of unit.functions) {
      if (needsRestoreView(job, unit, expr.ops)) {
        // We don't need to capture the view in a variable for arrow
        // functions, it will be passed in to its factory.
        addSaveRestoreViewOperation(unit, expr.ops, o.variable(expr.currentViewName));
      }
    }

    unit.create.prepend([
      ir.createVariableOp<ir.CreateOp>(
        unit.job.allocateXrefId(),
        {
          kind: ir.SemanticVariableKind.SavedView,
          name: null,
          view: unit.xref,
        },
        new ir.GetCurrentViewExpr(),
        ir.VariableFlags.None,
      ),
    ]);

    for (const op of unit.create) {
      if (
        op.kind === ir.OpKind.Listener ||
        op.kind === ir.OpKind.TwoWayListener ||
        op.kind === ir.OpKind.Animation ||
        op.kind === ir.OpKind.AnimationListener
      ) {
        if (needsRestoreView(job, unit, op.handlerOps)) {
          addSaveRestoreViewOperation(unit, op.handlerOps, unit.xref);
        }
      }
    }
  }
}

function needsRestoreView(
  job: ComponentCompilationJob,
  unit: ViewCompilationUnit,
  opList: ir.OpList<ir.CreateOp | ir.UpdateOp>,
): boolean {
  // Embedded views always need the save/restore view operation.
  let result = unit !== job.root;

  if (!result) {
    for (const innerOp of opList) {
      ir.visitExpressionsInOp(innerOp, (expr) => {
        if (expr instanceof ir.ReferenceExpr || expr instanceof ir.ContextLetReferenceExpr) {
          result = true;
        }
      });
    }
  }

  return result;
}

function addSaveRestoreViewOperation(
  unit: ViewCompilationUnit,
  opList: ir.OpList<ir.UpdateOp>,
  restoreViewTarget: ir.XrefId | o.Expression,
) {
  opList.prepend([
    ir.createVariableOp<ir.UpdateOp>(
      unit.job.allocateXrefId(),
      {
        kind: ir.SemanticVariableKind.Context,
        name: null,
        view: unit.xref,
      },
      new ir.RestoreViewExpr(restoreViewTarget),
      ir.VariableFlags.None,
    ),
  ]);

  // The "restore view" operation requires a call to `resetView` to reset the
  // context prior to returning from the operation. Find any `return` statements in
  // the body and wrap them in a call to reset the view.
  for (const handlerOp of opList) {
    if (
      handlerOp.kind === ir.OpKind.Statement &&
      handlerOp.statement instanceof o.ReturnStatement
    ) {
      handlerOp.statement.value = new ir.ResetViewExpr(handlerOp.statement.value);
    }
  }
}
