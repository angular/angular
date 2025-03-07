/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * In most cases we can drop user added parentheses from expressions. However, in some cases
 * parentheses are needed for the expression to be considered valid JavaScript or for Typescript to
 * generate the correct output. This phases strips all parentheses except in the following
 * siturations where they are required:
 *
 * 1. Unary operators in the base of an exponentiation expression. For example, `-2 ** 3` is not
 *    valid JavaScript, but `(-2) ** 3` is.
 * 2. When mixing nullish coalescing (`??`) and logical and/or operators (`&&`, `||`), we need
 *    parentheses. For example, `a ?? b && c` is not valid JavaScript, but `a ?? (b && c)` is.
 * 3. Ternary expression used as an operand for nullish coalescing. Typescript generates incorrect
 *    code if the parentheses are missing. For example when `(a ? b : c) ?? d` is translated to
 *    typescript AST, the parentheses node is removed, and then the remaining AST is printed, it
 *    incorrectly prints `a ? b : c ?? d`. This is different from how it handles the same situation
 *    with `||` and `&&` where it prints the parentheses even if they are not present in the AST.
 *    Note: We may be able to remove this case if Typescript resolves the following issue:
 *    https://github.com/microsoft/TypeScript/issues/61369
 */
export function stripNonrequiredParentheses(job: CompilationJob): void {
  // Check which parentheses are required.
  const requiredParens = new Set<o.ParenthesizedExpr>();
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.visitExpressionsInOp(op, (expr) => {
        if (expr instanceof o.BinaryOperatorExpr) {
          switch (expr.operator) {
            case o.BinaryOperator.Exponentiation:
              checkExponentiationParens(expr, requiredParens);
              break;
            case o.BinaryOperator.NullishCoalesce:
              checkNullishCoalescingParens(expr, requiredParens);
              break;
          }
        }
      });
    }
  }

  // Remove any non-required parentheses.
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (expr instanceof o.ParenthesizedExpr) {
            return requiredParens.has(expr) ? expr : expr.expr;
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

function checkExponentiationParens(
  expr: o.BinaryOperatorExpr,
  requiredParens: Set<o.ParenthesizedExpr>,
) {
  if (expr.lhs instanceof o.ParenthesizedExpr && expr.lhs.expr instanceof o.UnaryOperatorExpr) {
    requiredParens.add(expr.lhs);
  }
}

function checkNullishCoalescingParens(
  expr: o.BinaryOperatorExpr,
  requiredParens: Set<o.ParenthesizedExpr>,
) {
  if (
    expr.lhs instanceof o.ParenthesizedExpr &&
    (isLogicalAndOr(expr.lhs.expr) || expr.lhs.expr instanceof o.ConditionalExpr)
  ) {
    requiredParens.add(expr.lhs);
  }
  if (
    expr.rhs instanceof o.ParenthesizedExpr &&
    (isLogicalAndOr(expr.rhs.expr) || expr.rhs.expr instanceof o.ConditionalExpr)
  ) {
    requiredParens.add(expr.rhs);
  }
}

function isLogicalAndOr(expr: o.Expression) {
  return (
    expr instanceof o.BinaryOperatorExpr &&
    (expr.operator === o.BinaryOperator.And || expr.operator === o.BinaryOperator.Or)
  );
}
