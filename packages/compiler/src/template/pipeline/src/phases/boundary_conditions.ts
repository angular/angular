/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * Resolves conditions for boundary operations, generating an expression that
 * determines which branch to render based on the boundary state.
 */
export function generateBoundaryConditions(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.Boundary) {
        const boundaryXref = op.target;

        // We generate an expression like: `bnd_0.error === null ? primarySlot : errorSlot`

        const boundaryStateExpr = new ir.BoundaryStateExpr(boundaryXref);
        const errorProp = new o.ReadPropExpr(boundaryStateExpr, 'error');
        const condition = new o.BinaryOperatorExpr(
          o.BinaryOperator.Identical,
          errorProp,
          o.NULL_EXPR,
        );

        const errorBranches = op.conditions;
        const fallbackBranch = errorBranches.find((c) => c.expr === null);
        let errorResultExpr: o.Expression = fallbackBranch
          ? new ir.SlotLiteralExpr(fallbackBranch.targetSlot)
          : o.literal(-1);

        // Iterate in reverse order over error branches WITH conditions
        const conditionalBranches = errorBranches.filter((c) => c.expr !== null);
        for (let i = conditionalBranches.length - 1; i >= 0; i--) {
          const branch = conditionalBranches[i];

          let conditionExpr = branch.expr!;

          // Find the corresponding BoundaryErrorCreateOp to check for context variables
          const errorCreateOp = Array.from(unit.create).find(
            (o): o is ir.BoundaryErrorCreateOp =>
              o.kind === ir.OpKind.BoundaryErrorCreate && o.xref === branch.target,
          );

          if (errorCreateOp !== undefined) {
            const errorVarNames = errorCreateOp.contextVariables
              .filter((v: any) => v.value === '$error')
              .map((v: any) => v.name);

            if (errorVarNames.length > 0) {
              conditionExpr = ir.transformExpressionsInExpression(
                conditionExpr,
                (expr) => {
                  if (expr instanceof ir.LexicalReadExpr && errorVarNames.includes(expr.name)) {
                    return errorProp;
                  }
                  return expr;
                },
                ir.VisitorContextFlag.None,
              );
            }
          }

          errorResultExpr = new o.ConditionalExpr(
            conditionExpr,
            new ir.SlotLiteralExpr(branch.targetSlot),
            errorResultExpr,
          );
        }

        op.processed = new o.ConditionalExpr(
          condition,
          new ir.SlotLiteralExpr(op.guarded.targetSlot),
          errorResultExpr,
        );
      }
    }
  }
}
