/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Collapse the various conditions of conditional ops into a single test expression.
 */
export function phaseConditionals(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (op.kind !== ir.OpKind.Conditional) {
        continue;
      }

      let test: o.Expression;

      // Any case with a `null` condition is `default`. If one exists, default to it instead.
      const defaultCase = op.conditions.findIndex((cond) => cond.expr === null);
      if (defaultCase >= 0) {
        const xref = op.conditions.splice(defaultCase, 1)[0].target;
        test = new ir.SlotLiteralExpr(xref);
      } else {
        // By default, a switch evaluates to `-1`, causing no template to be displayed.
        test = o.literal(-1);
      }

      // Switch expressions assign their main test to a temporary, to avoid re-executing it.
      let tmp = op.test == null ? null : new ir.AssignTemporaryExpr(op.test, job.allocateXrefId());

      // For each remaining condition, test whether the temporary satifies the check. (If no temp is
      // present, just check each expression directly.)
      for (let i = op.conditions.length - 1; i >= 0; i--) {
        let conditionalCase = op.conditions[i];
        if (conditionalCase.expr === null) {
          continue;
        }
        if (tmp !== null) {
          const useTmp = i === 0 ? tmp : new ir.ReadTemporaryExpr(tmp.xref);
          conditionalCase.expr =
              new o.BinaryOperatorExpr(o.BinaryOperator.Identical, useTmp, conditionalCase.expr);
        } else if (conditionalCase.alias !== null) {
          const caseExpressionTemporaryXref = job.allocateXrefId();
          conditionalCase.expr =
              new ir.AssignTemporaryExpr(conditionalCase.expr, caseExpressionTemporaryXref);
          op.contextValue = new ir.ReadTemporaryExpr(caseExpressionTemporaryXref);
        }
        test = new o.ConditionalExpr(
            conditionalCase.expr, new ir.SlotLiteralExpr(conditionalCase.target), test);
      }

      // Save the resulting aggregate Joost-expression.
      op.processed = test;
    }
  }
}
