/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilation} from '../compilation';

export function phaseSaveRestoreView(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    if (view === cpl.root) {
      // Save/restore operations are not necessary for the root view.
      continue;
    }

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
  }
}
