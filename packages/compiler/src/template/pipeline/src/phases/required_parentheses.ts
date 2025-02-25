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

// TODO: create AST for parentheses when parsing, then we can remove the unnecessary ones instead of
// adding them out of thin air. This should simplify the parsing and give us valid spans for the
// parentheses.

/**
 * In some cases we need to add parentheses to expressions for them to be considered valid
 * JavaScript. This phase adds parentheses to cover such cases. Currently these cases are:
 *
 * 1. Unary operators in the base of an exponentiation expression. For example, `-2 ** 3` is not
 *    valid JavaScript, but `(-2) ** 3` is.
 */
export function requiredParentheses(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (
            expr instanceof o.BinaryOperatorExpr &&
            expr.operator === o.BinaryOperator.Exponentiation &&
            expr.lhs instanceof o.UnaryOperatorExpr
          ) {
            expr.lhs = new o.ParenthesizedExpr(expr.lhs);
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
