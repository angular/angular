/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilation, ViewCompilation} from '../compilation';

/**
 * Resolves lexical references in views (`ir.LexicalReadExpr`) to either a target variable or to
 * property reads on the top-level component context.
 *
 * Also matches `ir.RestoreViewExpr` expressions with the variables of their corresponding saved
 * views.
 */
export function phaseResolveNames(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    processLexicalScope(view, view.create, null);
    processLexicalScope(view, view.update, null);
  }
}

function processLexicalScope(
    view: ViewCompilation, ops: ir.OpList<ir.CreateOp>|ir.OpList<ir.UpdateOp>,
    savedView: SavedView|null): void {
  // Maps names defined in the lexical scope of this template to the `ir.XrefId`s of the variable
  // declarations which represent those values.
  //
  // Since variables are generated in each view for the entire lexical scope (including any
  // identifiers from parent templates) only local variables need be considered here.
  const scope = new Map<string, ir.XrefId>();

  // First, step through the operations list and:
  // 1) build up the `scope` mapping
  // 2) recurse into any listener functions
  for (const op of ops) {
    switch (op.kind) {
      case ir.OpKind.Variable:
        switch (op.variable.kind) {
          case ir.SemanticVariableKind.Identifier:
            // This variable represents some kind of identifier which can be used in the template.
            if (scope.has(op.variable.identifier)) {
              continue;
            }
            scope.set(op.variable.identifier, op.xref);
            break;
          case ir.SemanticVariableKind.SavedView:
            // This variable represents a snapshot of the current view context, and can be used to
            // restore that context within listener functions.
            savedView = {
              view: op.variable.view,
              variable: op.xref,
            };
            break;
        }
        break;
      case ir.OpKind.Listener:
        // Listener functions have separate variable declarations, so process them as a separate
        // lexical scope.
        processLexicalScope(view, op.handlerOps, savedView);
        break;
    }
  }

  // Next, use the `scope` mapping to match `ir.LexicalReadExpr` with defined names in the lexical
  // scope. Also, look for `ir.RestoreViewExpr`s and match them with the snapshotted view context
  // variable.
  for (const op of ops) {
    if (op.kind == ir.OpKind.Listener) {
      // Listeners were already processed above with their own scopes.
      continue;
    }
    ir.transformExpressionsInOp(op, (expr, flags) => {
      if (expr instanceof ir.LexicalReadExpr) {
        // `expr` is a read of a name within the lexical scope of this view.
        // Either that name is defined within the current view, or it represents a property from the
        // main component context.
        if (scope.has(expr.name)) {
          // This was a defined variable in the current scope.
          return new ir.ReadVariableExpr(scope.get(expr.name)!);
        } else {
          // Reading from the component context.
          return new o.ReadPropExpr(new ir.ContextExpr(view.tpl.root.xref), expr.name);
        }
      } else if (expr instanceof ir.RestoreViewExpr && typeof expr.view === 'number') {
        // `ir.RestoreViewExpr` happens in listener functions and restores a saved view from the
        // parent creation list. We expect to find that we captured the `savedView` previously, and
        // that it matches the expected view to be restored.
        if (savedView === null || savedView.view !== expr.view) {
          throw new Error(`AssertionError: no saved view ${expr.view} from view ${view.xref}`);
        }
        expr.view = new ir.ReadVariableExpr(savedView.variable);
        return expr;
      } else {
        return expr;
      }
    }, ir.VisitorContextFlag.None);
  }

  for (const op of ops) {
    ir.visitExpressionsInOp(op, expr => {
      if (expr instanceof ir.LexicalReadExpr) {
        throw new Error(
            `AssertionError: no lexical reads should remain, but found read of ${expr.name}`);
      }
    });
  }
}

/**
 * Information about a `SavedView` variable.
 */
interface SavedView {
  /**
   * The view `ir.XrefId` which was saved into this variable.
   */
  view: ir.XrefId;

  /**
   * The `ir.XrefId` of the variable into which the view was saved.
   */
  variable: ir.XrefId;
}
