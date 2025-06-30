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
        op.kind !== ir.OpKind.Listener &&
        op.kind !== ir.OpKind.TwoWayListener &&
        op.kind !== ir.OpKind.Animation &&
        op.kind !== ir.OpKind.AnimationListener
      ) {
        continue;
      }

      // Embedded views always need the save/restore view operation.
      let needsRestoreView = unit !== job.root;

      if (!needsRestoreView) {
        for (const handlerOp of op.handlerOps) {
          ir.visitExpressionsInOp(handlerOp, (expr) => {
            if (expr instanceof ir.ReferenceExpr || expr instanceof ir.ContextLetReferenceExpr) {
              // Listeners that reference() a local ref need the save/restore view operation.
              needsRestoreView = true;
            }
          });
        }
      }

      if (needsRestoreView) {
        addSaveRestoreViewOperationToListener(unit, op);
      }
    }
  }
}

function addSaveRestoreViewOperationToListener(
  unit: ViewCompilationUnit,
  op: ir.ListenerOp | ir.TwoWayListenerOp | ir.AnimationOp | ir.AnimationListenerOp,
) {
  op.handlerOps.prepend([
    ir.createVariableOp<ir.UpdateOp>(
      unit.job.allocateXrefId(),
      {
        kind: ir.SemanticVariableKind.Context,
        name: null,
        view: unit.xref,
      },
      new ir.RestoreViewExpr(unit.xref),
      ir.VariableFlags.None,
    ),
  ]);

  // The "restore view" operation in listeners requires a call to `resetView` to reset the
  // context prior to returning from the listener operation. Find any `return` statements in
  // the listener body and wrap them in a call to reset the view.
  for (const handlerOp of op.handlerOps) {
    if (
      handlerOp.kind === ir.OpKind.Statement &&
      handlerOp.statement instanceof o.ReturnStatement
    ) {
      handlerOp.statement.value = new ir.ResetViewExpr(handlerOp.statement.value);
    }
  }
}
