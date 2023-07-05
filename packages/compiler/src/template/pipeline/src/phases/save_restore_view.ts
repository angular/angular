/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

export function phaseSaveRestoreView(job: ComponentCompilationJob): void {
  for (const view of job.views.values()) {
    view.create.prepend([
      ir.createVariableOp<ir.CreateOp>(
          view.job.allocateXrefId(), {
            kind: ir.SemanticVariableKind.SavedView,
            name: null,
            view: view.xref,
          },
          new ir.GetCurrentViewExpr(), /* isConstant */ true),

    ]);

    for (const op of view.create) {
      if (op.kind !== ir.OpKind.Listener) {
        continue;
      }

      // Embedded views always need the save/restore view operation.
      let needsRestoreView = view !== job.root;

      if (!needsRestoreView) {
        for (const handlerOp of op.handlerOps) {
          ir.visitExpressionsInOp(handlerOp, expr => {
            if (expr instanceof ir.ReferenceExpr) {
              // Listeners that reference() a local ref need the save/restore view operation.
              needsRestoreView = true;
            }
          });
        }
      }

      if (needsRestoreView) {
        addSaveRestoreViewOperationToListener(view, op);
      }
    }
  }
}

function addSaveRestoreViewOperationToListener(unit: ViewCompilationUnit, op: ir.ListenerOp) {
  op.handlerOps.prepend([
    ir.createVariableOp<ir.UpdateOp>(
        unit.job.allocateXrefId(), {
          kind: ir.SemanticVariableKind.Context,
          name: null,
          view: unit.xref,
        },
        new ir.RestoreViewExpr(unit.xref), /* isConstant */ true),
  ]);

  // The "restore view" operation in listeners requires a call to `resetView` to reset the
  // context prior to returning from the listener operation. Find any `return` statements in
  // the listener body and wrap them in a call to reset the view.
  for (const handlerOp of op.handlerOps) {
    if (handlerOp.kind === ir.OpKind.Statement &&
        handlerOp.statement instanceof o.ReturnStatement) {
      handlerOp.statement.value = new ir.ResetViewExpr(handlerOp.statement.value);
    }
  }
}
