/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob, CompilationUnit} from '../compilation';

/**
 * Resolves lexical references in views (`ir.LexicalReadExpr`) to either a target variable or to
 * property reads on the top-level component context.
 *
 * Also matches `ir.RestoreViewExpr` expressions with the variables of their corresponding saved
 * views.
 */
export function resolveNames(job: CompilationJob): void {
  for (const unit of job.units) {
    processLexicalScope(unit, unit.create, null);
    processLexicalScope(unit, unit.update, null);
  }
}

function processLexicalScope(
  unit: CompilationUnit,
  ops: ir.OpList<ir.CreateOp> | ir.OpList<ir.UpdateOp>,
  savedView: SavedView | null,
): void {
  // Maps names defined in the lexical scope of this template to the `ir.XrefId`s of the variable
  // declarations which represent those values.
  //
  // Since variables are generated in each view for the entire lexical scope (including any
  // identifiers from parent templates) only local variables need be considered here.
  const scope = new Map<string, ir.XrefId>();

  // Symbols defined within the current scope. They take precedence over ones defined outside.
  const localDefinitions = new Map<string, ir.XrefId>();

  // First, step through the operations list and:
  // 1) build up the `scope` mapping
  // 2) recurse into any listener functions
  for (const op of ops) {
    switch (op.kind) {
      case ir.OpKind.Variable:
        switch (op.variable.kind) {
          case ir.SemanticVariableKind.Identifier:
            if (op.variable.local) {
              if (localDefinitions.has(op.variable.identifier)) {
                continue;
              }
              localDefinitions.set(op.variable.identifier, op.xref);
            } else if (scope.has(op.variable.identifier)) {
              continue;
            }
            scope.set(op.variable.identifier, op.xref);
            break;
          case ir.SemanticVariableKind.Alias:
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
      case ir.OpKind.TwoWayListener:
        // Listener functions have separate variable declarations, so process them as a separate
        // lexical scope.
        processLexicalScope(unit, op.handlerOps, savedView);
        break;
      case ir.OpKind.RepeaterCreate:
        if (op.trackByOps !== null) {
          processLexicalScope(unit, op.trackByOps, savedView);
        }
        break;
    }
  }

  // Next, use the `scope` mapping to match `ir.LexicalReadExpr` with defined names in the lexical
  // scope. Also, look for `ir.RestoreViewExpr`s and match them with the snapshotted view context
  // variable.
  for (const op of ops) {
    if (op.kind == ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
      // Listeners were already processed above with their own scopes.
      continue;
    }
    ir.transformExpressionsInOp(
      op,
      (expr) => {
        if (expr instanceof ir.LexicalReadExpr) {
          // `expr` is a read of a name within the lexical scope of this view.
          // Either that name is defined within the current view, or it represents a property from the
          // main component context.
          if (localDefinitions.has(expr.name)) {
            return new ir.ReadVariableExpr(localDefinitions.get(expr.name)!);
          } else if (scope.has(expr.name)) {
            // This was a defined variable in the current scope.
            return new ir.ReadVariableExpr(scope.get(expr.name)!);
          } else {
            // Reading from the component context.
            return new o.ReadPropExpr(new ir.ContextExpr(unit.job.root.xref), expr.name);
          }
        } else if (expr instanceof ir.RestoreViewExpr && typeof expr.view === 'number') {
          // `ir.RestoreViewExpr` happens in listener functions and restores a saved view from the
          // parent creation list. We expect to find that we captured the `savedView` previously, and
          // that it matches the expected view to be restored.
          if (savedView === null || savedView.view !== expr.view) {
            throw new Error(`AssertionError: no saved view ${expr.view} from view ${unit.xref}`);
          }
          expr.view = new ir.ReadVariableExpr(savedView.variable);
          return expr;
        } else {
          return expr;
        }
      },
      ir.VisitorContextFlag.None,
    );
  }

  for (const op of ops) {
    ir.visitExpressionsInOp(op, (expr) => {
      if (expr instanceof ir.LexicalReadExpr) {
        throw new Error(
          `AssertionError: no lexical reads should remain, but found read of ${expr.name}`,
        );
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
