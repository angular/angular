/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Counts the number of variable slots used within each view, and stores that on the view itself, as
 * well as propagates it to the `ir.TemplateOp` for embedded views.
 */
export function phaseVarCounting(cpl: ComponentCompilation): void {
  // First, count the vars used in each view, and update the view-level counter.
  for (const [_, view] of cpl.views) {
    let varCount = 0;
    for (const op of view.ops()) {
      if (ir.hasConsumesVarsTrait(op)) {
        varCount += varsUsedByOp(op);
      }

      ir.visitExpressionsInOp(op, expr => {
        if (!ir.isIrExpression(expr)) {
          return;
        }

        // Some expressions require knowledge of the number of variable slots consumed.
        if (ir.hasUsesVarOffsetTrait(expr)) {
          expr.varOffset = varCount;
        }

        if (ir.hasConsumesVarsTrait(expr)) {
          varCount += varsUsedByIrExpression(expr);
        }
      });
    }

    view.vars = varCount;
  }

  // Add var counts for each view to the `ir.TemplateOp` which declares that view (if the view is an
  // embedded view).
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind !== ir.OpKind.Template) {
        continue;
      }

      const childView = cpl.views.get(op.xref)!;
      op.vars = childView.vars;
    }
  }
}

/**
 * Different operations that implement `ir.UsesVarsTrait` use different numbers of variables, so
 * count the variables used by any particular `op`.
 */
function varsUsedByOp(op: (ir.CreateOp|ir.UpdateOp)&ir.ConsumesVarsTrait): number {
  switch (op.kind) {
    case ir.OpKind.Property:
    case ir.OpKind.StyleProp:
    case ir.OpKind.StyleMap:
      // Property bindings use 1 variable slot.
      return 1;
    case ir.OpKind.InterpolateText:
      // `ir.InterpolateTextOp`s use a variable slot for each dynamic expression.
      return op.expressions.length;
    case ir.OpKind.InterpolateProperty:
    case ir.OpKind.InterpolateStyleProp:
    case ir.OpKind.InterpolateStyleMap:
      // `ir.InterpolatePropertyOp`s use a variable slot for each dynamic expression, plus one for
      // the result.
      return 1 + op.expressions.length;
    default:
      throw new Error(`Unhandled op: ${ir.OpKind[op.kind]}`);
  }
}

export function varsUsedByIrExpression(expr: ir.Expression&ir.ConsumesVarsTrait): number {
  switch (expr.kind) {
    case ir.ExpressionKind.PureFunctionExpr:
      return 1 + expr.args.length;
    case ir.ExpressionKind.PipeBinding:
      return 1 + expr.args.length;
    case ir.ExpressionKind.PipeBindingVariadic:
      return 1 + expr.numArgs;
    default:
      throw new Error(
          `AssertionError: unhandled ConsumesVarsTrait expression ${expr.constructor.name}`);
  }
}
