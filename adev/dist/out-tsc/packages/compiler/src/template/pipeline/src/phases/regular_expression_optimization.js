/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {GenericKeyFn} from '../../../../constant_pool';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
/** Optimizes regular expressions used in expressions. */
export function optimizeRegularExpressions(job) {
  for (const view of job.units) {
    for (const op of view.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (
            expr instanceof o.RegularExpressionLiteral &&
            // We can't optimize global regexes, because they're stateful.
            (expr.flags === null || !expr.flags.includes('g'))
          ) {
            return job.pool.getSharedConstant(new RegularExpressionConstant(), expr);
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
class RegularExpressionConstant extends GenericKeyFn {
  toSharedConstantDeclaration(declName, keyExpr) {
    return new o.DeclareVarStmt(declName, keyExpr, undefined, o.StmtModifier.Final);
  }
}
//# sourceMappingURL=regular_expression_optimization.js.map
