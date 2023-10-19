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

export function phaseRepeaterDerivedVars(job: CompilationJob): void {
  const repeaters = new Map<ir.XrefId, ir.RepeaterCreateOp>();

  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (op.kind === ir.OpKind.RepeaterCreate) {
        repeaters.set(op.xref, op);
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(op, expr => {
        if (!(expr instanceof ir.DerivedRepeaterVarExpr)) {
          return expr;
        }
        const repeaterOp = repeaters.get(expr.xref)!;

        switch (expr.identity) {
          case ir.DerivedRepeaterVarIdentity.First:
            return new o.BinaryOperatorExpr(
                o.BinaryOperator.Identical, new ir.LexicalReadExpr(repeaterOp.varNames.$index),
                o.literal(0));
          case ir.DerivedRepeaterVarIdentity.Last:
            return new o.BinaryOperatorExpr(
                o.BinaryOperator.Identical, new ir.LexicalReadExpr(repeaterOp.varNames.$index),
                new o.BinaryOperatorExpr(
                    o.BinaryOperator.Minus, new ir.LexicalReadExpr(repeaterOp.varNames.$count),
                    o.literal(1)));
          case ir.DerivedRepeaterVarIdentity.Even:
            return new o.BinaryOperatorExpr(
                o.BinaryOperator.Identical,
                new o.BinaryOperatorExpr(
                    o.BinaryOperator.Modulo, new ir.LexicalReadExpr(repeaterOp.varNames.$index),
                    o.literal(2)),
                o.literal(0));
          case ir.DerivedRepeaterVarIdentity.Odd:
            return new o.BinaryOperatorExpr(
                o.BinaryOperator.NotIdentical,
                new o.BinaryOperatorExpr(
                    o.BinaryOperator.Modulo, new ir.LexicalReadExpr(repeaterOp.varNames.$index),
                    o.literal(2)),
                o.literal(0));
        }
      }, ir.VisitorContextFlag.None);
    }
  }
}
