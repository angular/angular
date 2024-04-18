/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Nullish coalescing expressions such as `a ?? b` have different semantics in Angular templates as
 * compared to JavaScript. In particular, they default to `null` instead of `undefined`. Therefore,
 * we replace them with ternary expressions, assigning temporaries as needed to avoid re-evaluating
 * the same sub-expression multiple times.
 */
export function generateNullishCoalesceExpressions(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (
            !(expr instanceof o.BinaryOperatorExpr) ||
            expr.operator !== o.BinaryOperator.NullishCoalesce
          ) {
            return expr;
          }

          const assignment = new ir.AssignTemporaryExpr(expr.lhs.clone(), job.allocateXrefId());
          const read = new ir.ReadTemporaryExpr(assignment.xref);

          // TODO: When not in compatibility mode for TemplateDefinitionBuilder, we can just emit
          // `t != null` instead of including an undefined check as well.
          return new o.ConditionalExpr(
            new o.BinaryOperatorExpr(
              o.BinaryOperator.And,
              new o.BinaryOperatorExpr(o.BinaryOperator.NotIdentical, assignment, o.NULL_EXPR),
              new o.BinaryOperatorExpr(
                o.BinaryOperator.NotIdentical,
                read,
                new o.LiteralExpr(undefined),
              ),
            ),
            read.clone(),
            expr.rhs,
          );
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
