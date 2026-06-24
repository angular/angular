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
 * Resolves `ir.ContextExpr` expressions (which represent embedded view or component contexts) to
 * either the `ctx` parameter to component functions (for the current view context) or to variables
 * that store those contexts (for contexts accessed via the `nextContext()` instruction).
 */
export function resolveContexts(job: CompilationJob): void {
  for (const unit of job.units) {
    processLexicalScope(unit, unit.create);
    processLexicalScope(unit, unit.update);
  }
}

function processLexicalScope(
  view: CompilationUnit,
  ops: ir.OpList<ir.CreateOp | ir.UpdateOp>,
): void {
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
            scope.set(op.variable.view, new ir.ReadVariableExpr(op.xref));
            break;
        }
        break;
      case ir.OpKind.Animation:
      case ir.OpKind.AnimationListener:
      case ir.OpKind.Listener:
      case ir.OpKind.TwoWayListener:
        processLexicalScope(view, op.handlerOps);
        break;
      case ir.OpKind.RepeaterCreate:
        if (op.trackByOps !== null) {
          processLexicalScope(view, op.trackByOps);
        }
        break;
    }
  }

  if (view === view.job.root) {
    // Prefer `ctx` of the root view to any variables which happen to contain the root context.
    scope.set(view.xref, o.variable('ctx'));
  }

  for (const op of ops) {
    ir.transformExpressionsInOp(
      op,
      (expr) => {
        if (expr instanceof ir.ContextExpr) {
          if (!scope.has(expr.view)) {
            throw new Error(
              `No context found for reference to view ${expr.view} from view ${view.xref}`,
            );
          }
          return scope.get(expr.view)!;
        } else {
          return expr;
        }
      },
      ir.VisitorContextFlag.None,
    );
  }
}
