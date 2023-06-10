/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Finds all unresolved safe read expressions, and converts them into the appropriate output AST
 * reads, guarded by null checks.
 */
export function phaseExpandSafeReads(cpl: ComponentCompilation): void {
  const safeTransformWithCpl: ir.ExpressionTransform = e => safeTransform(e);

  for (const [_, view] of cpl.views) {
    for (const op of view.ops()) {
      if ((op as any)?.expressions) debugger;

      ir.transformExpressionsInOp(op, safeTransformWithCpl, ir.VisitorContextFlag.None);
      ir.transformExpressionsInOp(op, ternaryTransform, ir.VisitorContextFlag.None);
    }
  }
}

function needsTemporaryInSafeAccess(e: o.Expression): boolean {
  if (e instanceof o.UnaryOperatorExpr) {
    return needsTemporaryInSafeAccess(e.expr);
  } else if (e instanceof o.BinaryOperatorExpr) {
    return needsTemporaryInSafeAccess(e.lhs) || needsTemporaryInSafeAccess(e.rhs);
  } else if (e instanceof o.ConditionalExpr) {
    if (e.falseCase && needsTemporaryInSafeAccess(e.falseCase)) return true;
    return needsTemporaryInSafeAccess(e.condition) || needsTemporaryInSafeAccess(e.trueCase);
  } else if (e instanceof o.NotExpr) {
    return needsTemporaryInSafeAccess(e.condition);
  } else if (e instanceof ir.AssignTemporaryExpr) {
    return needsTemporaryInSafeAccess(e.expr);
  } else if (e instanceof o.InvokeFunctionExpr) {
    return true;
  } else if (e instanceof ir.SafeInvokeFunctionExpr) {
    return true;
  } else if (e instanceof o.LiteralArrayExpr) {
    return true;
  } else if (e instanceof o.LiteralMapExpr) {
    return true;
  } else if (e instanceof ir.PipeBindingExpr) {
    // TODO: Is this the right way to detect a pipe in the expression?
    return true;
  }
  return false;
}

function isAccessExpression(e: o.Expression): e is o.ReadPropExpr|ir.SafePropertyReadExpr|
    o.ReadKeyExpr|ir.SafeKeyedReadExpr|o.InvokeFunctionExpr|ir.SafeInvokeFunctionExpr {
  return e instanceof o.ReadPropExpr || e instanceof ir.SafePropertyReadExpr ||
      e instanceof o.ReadKeyExpr || e instanceof ir.SafeKeyedReadExpr ||
      e instanceof o.InvokeFunctionExpr || e instanceof ir.SafeInvokeFunctionExpr;
}

// TODO: When strict compatibility with TemplateDefinitionBuilder is not required, we can use `&&`
// instead.
function safeTransform(e: o.Expression): o.Expression {
  if (!isAccessExpression(e)) {
    return e;
  }
  if (e instanceof o.ReadPropExpr && e.receiver instanceof ir.SafeTernaryExpr) {
    let st = e.receiver;
    while (st.expr instanceof ir.SafeTernaryExpr) {
      st = st.expr;
    }
    st.expr = new o.ReadPropExpr(st.expr, e.name);
    return e.receiver;
  }
  if (e instanceof o.ReadKeyExpr && e.receiver instanceof ir.SafeTernaryExpr) {
    let st = e.receiver;
    while (st.expr instanceof ir.SafeTernaryExpr) {
      st = st.expr;
    }
    st.expr = new o.ReadKeyExpr(st.expr, e.index);
    return e.receiver;
  }

  if (e instanceof ir.SafeKeyedReadExpr || e instanceof ir.SafePropertyReadExpr) {
    if (e.receiver instanceof ir.SafeTernaryExpr) {
      let st = e.receiver;
      while (st.expr instanceof ir.SafeTernaryExpr) {
        st = st.expr;
      }
      let newExpr: o.Expression;
      if (e instanceof ir.SafePropertyReadExpr) {
        newExpr = new o.ReadPropExpr(st.expr, e.name);
      } else {
        newExpr = new o.ReadKeyExpr(st.expr, e.index);
      }
      st.expr = new ir.SafeTernaryExpr(st.expr.clone(), newExpr);
      return e.receiver;
    } else {
      let newExpr: o.Expression;
      if (e instanceof ir.SafePropertyReadExpr) {
        newExpr = new o.ReadPropExpr(e.receiver, e.name);
      } else {
        newExpr = new o.ReadKeyExpr(e.receiver, e.index);
      }
      return new ir.SafeTernaryExpr(e.receiver.clone(), newExpr);
    }
  }

  if (e instanceof ir.SafeInvokeFunctionExpr) {
    // TODO: Implement safe function calls in a subsequent commit.
    return new o.InvokeFunctionExpr(e.receiver, e.args);
  }
  return e;
}

function ternaryTransform(e: o.Expression): o.Expression {
  if (!(e instanceof ir.SafeTernaryExpr)) {
    return e;
  }
  return new o.ConditionalExpr(
      new o.BinaryOperatorExpr(o.BinaryOperator.Equals, e.guard, o.NULL_EXPR),
      o.NULL_EXPR,
      e.expr,
  );
}