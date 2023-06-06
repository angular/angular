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


export function phaseNullishCoalescing(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    for (const op of view.ops()) {
      ir.transformExpressionsInOp(op, expr => {
        if (!(expr instanceof o.BinaryOperatorExpr) ||
            expr.operator !== o.BinaryOperator.NullishCoalesce) {
          return expr;
        }

        // TODO: We need to unconditionally emit a temporary variable to match
        // TemplateDefinitionBuilder. (We could also emit one conditionally when not in
        // compatibility mode.)
        return new o.ConditionalExpr(
            new o.BinaryOperatorExpr(
                o.BinaryOperator.And,
                new o.BinaryOperatorExpr(o.BinaryOperator.NotIdentical, expr.lhs, o.NULL_EXPR),
                new o.BinaryOperatorExpr(
                    o.BinaryOperator.NotIdentical, expr.lhs, new o.LiteralExpr(undefined))),
            expr.lhs,
            expr.rhs,
        );
      }, ir.VisitorContextFlag.None);
    }
  }
}
