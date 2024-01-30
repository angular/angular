/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import * as ng from '../instruction';
import type {CompilationJob} from '../compilation';

/**
 * Transforms a `TwoWayBindingSet` expression into an expression that either
 * sets a value through the `twoWayBindingSet` instruction or falls back to setting
 * the value directly. E.g. the expression `TwoWayBindingSet(target, value)` becomes:
 * `ng.twoWayBindingSet(target, value) || (target = value)`.
 */
export function transformTwoWayBindingSet(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.TwoWayListener) {
        ir.transformExpressionsInOp(op, (expr) => {
          if (expr instanceof ir.TwoWayBindingSetExpr) {
            return wrapAction(expr.target, expr.value);
          }
          return expr;
        }, ir.VisitorContextFlag.InChildOperation);
      }
    }
  }
}

function wrapSetOperation(target: o.ReadPropExpr|o.ReadKeyExpr, value: o.Expression): o.Expression {
  return ng.twoWayBindingSet(target, value).or(target.set(value));
}

function isReadExpression(value: unknown): value is o.ReadPropExpr|o.ReadKeyExpr {
  return value instanceof o.ReadPropExpr || value instanceof o.ReadKeyExpr;
}

function wrapAction(target: o.Expression, value: o.Expression): o.Expression {
  // The only officially supported expressions inside of a two-way binding are read expressions.
  if (isReadExpression(target)) {
    return wrapSetOperation(target, value);
  }

  // However, historically the expression parser was handling two-way events by appending `=$event`
  // to the raw string before attempting to parse it. This has led to bugs over the years (see
  // #37809) and to unintentionally supporting unassignable events in the two-way binding. The
  // logic below aims to emulate the old behavior while still supporting the new output format
  // which uses `twoWayBindingSet`. Note that the generated code doesn't necessarily make sense
  // based on what the user wrote, for example the event binding for `[(value)]="a ? b : c"`
  // would produce `ctx.a ? ctx.b : ctx.c = $event`. We aim to reproduce what the parser used
  // to generate before #54154.
  if (target instanceof o.BinaryOperatorExpr && isReadExpression(target.rhs)) {
    // `a && b` -> `ctx.a && twoWayBindingSet(ctx.b, $event) || (ctx.b = $event)`
    return new o.BinaryOperatorExpr(
        target.operator, target.lhs, wrapSetOperation(target.rhs, value));
  }

  // Note: this also supports nullish coalescing expressions which
  // would've been downleveled to ternary expressions by this point.
  if (target instanceof o.ConditionalExpr && isReadExpression(target.falseCase)) {
    // `a ? b : c` -> `ctx.a ? ctx.b : twoWayBindingSet(ctx.c, $event) || (ctx.c = $event)`
    return new o.ConditionalExpr(
        target.condition, target.trueCase, wrapSetOperation(target.falseCase, value));
  }

  // `!!a` -> `twoWayBindingSet(ctx.a, $event) || (ctx.a = $event)`
  // Note: previously we'd actually produce `!!(ctx.a = $event)`, but the wrapping
  // node doesn't affect the result so we don't need to carry it over.
  if (target instanceof o.NotExpr) {
    let expr = target.condition;

    while (true) {
      if (expr instanceof o.NotExpr) {
        expr = expr.condition;
      } else {
        if (isReadExpression(expr)) {
          return wrapSetOperation(expr, value);
        }
        break;
      }
    }
  }

  throw new Error(`Unsupported expression in two-way action binding.`);
}
