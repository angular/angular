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
  for (const [_, view] of cpl.views) {
    for (const op of view.ops()) {
      ir.transformExpressionsInOp(op, safeTransform, ir.VisitorContextFlag.None);
      ir.transformExpressionsInOp(op, ternaryTransform, ir.VisitorContextFlag.None);
    }
  }
}

function isSafeAccessExpression(e: o.Expression): e is ir.SafePropertyReadExpr|
    ir.SafeKeyedReadExpr {
  return e instanceof ir.SafePropertyReadExpr || e instanceof ir.SafeKeyedReadExpr;
}

function isUnsafeAccessExpression(e: o.Expression): e is o.ReadPropExpr|o.ReadKeyExpr {
  return e instanceof o.ReadPropExpr || e instanceof o.ReadKeyExpr;
}

function isAccessExpression(e: o.Expression): e is o.ReadPropExpr|ir.SafePropertyReadExpr|
    o.ReadKeyExpr|ir.SafeKeyedReadExpr {
  return isSafeAccessExpression(e) || isUnsafeAccessExpression(e);
}

function deepestSafeTernary(e: o.Expression): ir.SafeTernaryExpr|null {
  if (isAccessExpression(e) && e.receiver instanceof ir.SafeTernaryExpr) {
    let st = e.receiver;
    while (st.expr instanceof ir.SafeTernaryExpr) {
      st = st.expr;
    }
    return st;
  }
  return null;
}

// TODO: When strict compatibility with TemplateDefinitionBuilder is not required, we can use `&&`
// instead.
function safeTransform(e: o.Expression): o.Expression {
  if (e instanceof ir.SafeInvokeFunctionExpr) {
    // TODO: Implement safe function calls in a subsequent commit.
    return new o.InvokeFunctionExpr(e.receiver, e.args);
  }

  if (!isAccessExpression(e)) {
    return e;
  }

  const dst = deepestSafeTernary(e);

  if (dst) {
    if (e instanceof o.ReadPropExpr) {
      dst.expr = dst.expr.prop(e.name);
      return e.receiver;
    }
    if (e instanceof o.ReadKeyExpr) {
      dst.expr = dst.expr.key(e.index);
      return e.receiver;
    }
    if (e instanceof ir.SafePropertyReadExpr) {
      dst.expr = new ir.SafeTernaryExpr(dst.expr.clone(), dst.expr.prop(e.name));
      return e.receiver;
    }
    if (e instanceof ir.SafeKeyedReadExpr) {
      dst.expr = new ir.SafeTernaryExpr(dst.expr.clone(), dst.expr.key(e.index));
      return e.receiver;
    }
  } else {
    if (e instanceof ir.SafePropertyReadExpr) {
      return new ir.SafeTernaryExpr(e.receiver.clone(), e.receiver.prop(e.name));
    }
    if (e instanceof ir.SafeKeyedReadExpr) {
      return new ir.SafeTernaryExpr(e.receiver.clone(), e.receiver.key(e.index));
    }
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
