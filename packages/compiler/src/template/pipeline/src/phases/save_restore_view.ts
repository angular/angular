/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilation, ViewCompilation} from '../compilation';

export function phaseSaveRestoreView(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    view.create.prepend([
      ir.createVariableOp<ir.CreateOp>(
          view.tpl.allocateXrefId(), {
            kind: ir.SemanticVariableKind.SavedView,
            name: null,
            view: view.xref,
          },
          new ir.GetCurrentViewExpr()),
    ]);

    for (const op of view.create) {
      if (op.kind !== ir.OpKind.Listener) {
        continue;
      }

      // Embedded views always need the save/restore view operation.
      let needsRestoreView = view !== cpl.root;

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

function addSaveRestoreViewOperationToListener(view: ViewCompilation, op: ir.ListenerOp) {
  op.handlerOps.prepend([
    ir.createVariableOp<ir.UpdateOp>(
        view.tpl.allocateXrefId(), {
          kind: ir.SemanticVariableKind.Context,
          name: null,
          view: view.xref,
        },
        new ir.RestoreViewExpr(view.xref)),
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
