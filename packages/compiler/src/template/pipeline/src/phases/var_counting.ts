/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob, ComponentCompilationJob} from '../compilation';

/**
 * Counts the number of variable slots used within each view, and stores that on the view itself, as
 * well as propagates it to the `ir.TemplateOp` for embedded views.
 */
export function countVariables(job: CompilationJob): void {
  // First, count the vars used in each view, and update the view-level counter.
  for (const unit of job.units) {
    let varCount = 0;

    // Count variables on top-level ops first. Don't explore nested expressions just yet.
    for (const op of unit.ops()) {
      if (ir.hasConsumesVarsTrait(op)) {
        varCount += varsUsedByOp(op);
      }
    }

    // Count variables on expressions inside ops. We do this later because some of these expressions
    // might be conditional (e.g. `pipeBinding` inside of a ternary), and we don't want to interfere
    // with indices for top-level binding slots (e.g. `property`).
    for (const op of unit.ops()) {
      ir.visitExpressionsInOp(op, (expr) => {
        if (!ir.isIrExpression(expr)) {
          return;
        }

        // TemplateDefinitionBuilder assigns variable offsets for everything but pure functions
        // first, and then assigns offsets to pure functions lazily. We emulate that behavior by
        // assigning offsets in two passes instead of one, only in compatibility mode.
        if (
          job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
          expr instanceof ir.PureFunctionExpr
        ) {
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

    // Compatibility mode pass for pure function offsets (as explained above).
    if (job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
      for (const op of unit.ops()) {
        ir.visitExpressionsInOp(op, (expr) => {
          if (!ir.isIrExpression(expr) || !(expr instanceof ir.PureFunctionExpr)) {
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
    }

    unit.vars = varCount;
  }

  if (job instanceof ComponentCompilationJob) {
    // Add var counts for each view to the `ir.TemplateOp` which declares that view (if the view is
    // an embedded view).
    for (const unit of job.units) {
      for (const op of unit.create) {
        if (
          op.kind !== ir.OpKind.Template &&
          op.kind !== ir.OpKind.RepeaterCreate &&
          op.kind !== ir.OpKind.ConditionalCreate &&
          op.kind !== ir.OpKind.ConditionalBranchCreate
        ) {
          continue;
        }

        const childView = job.views.get(op.xref)!;
        op.vars = childView.vars;

        // TODO: currently we handle the vars for the RepeaterCreate empty template in the reify
        // phase. We should handle that here instead.
      }
    }
  }
}

/**
 * Different operations that implement `ir.UsesVarsTrait` use different numbers of variables, so
 * count the variables used by any particular `op`.
 */
function varsUsedByOp(op: (ir.CreateOp | ir.UpdateOp) & ir.ConsumesVarsTrait): number {
  let slots: number;
  switch (op.kind) {
    case ir.OpKind.Property:
    case ir.OpKind.DomProperty:
    case ir.OpKind.Attribute:
      // All of these bindings use 1 variable slot, plus 1 slot for every interpolated expression,
      // if any.
      slots = 1;
      if (op.expression instanceof ir.Interpolation && !isSingletonInterpolation(op.expression)) {
        slots += op.expression.expressions.length;
      }
      return slots;
    case ir.OpKind.TwoWayProperty:
      // Two-way properties can only have expressions so they only need one variable slot.
      return 1;
    case ir.OpKind.StyleProp:
    case ir.OpKind.ClassProp:
    case ir.OpKind.StyleMap:
    case ir.OpKind.ClassMap:
      // Style & class bindings use 2 variable slots, plus 1 slot for every interpolated expression,
      // if any.
      slots = 2;
      if (op.expression instanceof ir.Interpolation) {
        slots += op.expression.expressions.length;
      }
      return slots;
    case ir.OpKind.InterpolateText:
      // `ir.InterpolateTextOp`s use a variable slot for each dynamic expression.
      return op.interpolation.expressions.length;
    case ir.OpKind.I18nExpression:
    case ir.OpKind.Conditional:
    case ir.OpKind.DeferWhen:
    case ir.OpKind.StoreLet:
      return 1;
    case ir.OpKind.RepeaterCreate:
      // Repeaters may require an extra variable binding slot, if they have an empty view, for the
      // empty block tracking.
      // TODO: It's a bit odd to have a create mode instruction consume variable slots. Maybe we can
      // find a way to use the Repeater update op instead.
      return op.emptyView ? 1 : 0;
    default:
      throw new Error(`Unhandled op: ${ir.OpKind[op.kind]}`);
  }
}

export function varsUsedByIrExpression(expr: ir.Expression & ir.ConsumesVarsTrait): number {
  switch (expr.kind) {
    case ir.ExpressionKind.PureFunctionExpr:
      return 1 + expr.args.length;
    case ir.ExpressionKind.PipeBinding:
      return 1 + expr.args.length;
    case ir.ExpressionKind.PipeBindingVariadic:
      return 1 + expr.numArgs;
    case ir.ExpressionKind.StoreLet:
      return 1;
    default:
      throw new Error(
        `AssertionError: unhandled ConsumesVarsTrait expression ${expr.constructor.name}`,
      );
  }
}

function isSingletonInterpolation(expr: ir.Interpolation): boolean {
  if (expr.expressions.length !== 1 || expr.strings.length !== 2) {
    return false;
  }
  if (expr.strings[0] !== '' || expr.strings[1] !== '') {
    return false;
  }
  return true;
}
