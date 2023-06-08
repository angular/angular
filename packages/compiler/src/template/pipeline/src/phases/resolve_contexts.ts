/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob, CompilationUnit, ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * Resolves `ir.ContextExpr` expressions (which represent embedded view or component contexts) to
 * either the `ctx` parameter to component functions (for the current view context) or to variables
 * that store those contexts (for contexts accessed via the `nextContext()` instruction).
 */
export function phaseResolveContexts(cpl: CompilationJob): void {
  for (const unit of cpl.units) {
    processLexicalScope(unit, unit.create);
    processLexicalScope(unit, unit.update);
  }
}

function processLexicalScope(view: CompilationUnit, ops: ir.OpList<ir.CreateOp|ir.UpdateOp>): void {
  // Track the expressions used to access all available contexts within the current view, by the
  // view `ir.XrefId`.
  const scope = new Map<ir.XrefId, o.Expression>();

  // The current view's context is accessible via the `ctx` parameter.
  scope.set(view.xref, o.variable('ctx'));

  for (const op of ops) {
    switch (op.kind) {
      case ir.OpKind.Variable:
        switch (op.variable.kind) {
          case ir.SemanticVariableKind.Context:
            if (op.variable.view === view.xref) {
              // This variable is for the same view as `ctx`. Ideally we'd use `ctx`, but we should
              // prefer the variable in non-root views because of the risk of closure-capturing
              // `ctx`.

              if (view === view.job.root) {
                // This is the root view, so it's safe to use `ctx` and we don't need to use this
                // variable.
                break;
              }
            }

            // This is a reference to a different context.
            scope.set(op.variable.view, new ir.ReadVariableExpr(op.xref));
        }
        break;
      case ir.OpKind.Listener:
        processLexicalScope(view, op.handlerOps);
        break;
    }
  }

  for (const op of ops) {
    ir.transformExpressionsInOp(op, expr => {
      if (expr instanceof ir.ContextExpr) {
        if (!scope.has(expr.view)) {
          throw new Error(
              `No context found for reference to view ${expr.view} from view ${view.xref}`);
        }
        return scope.get(expr.view)!;
      } else {
        return expr;
      }
    }, ir.VisitorContextFlag.None);
  }
}
