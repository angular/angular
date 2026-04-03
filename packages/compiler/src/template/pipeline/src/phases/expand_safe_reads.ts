/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

export function expandSafeReads(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(op, (e) => safeTransform(e), ir.VisitorContextFlag.None);
      ir.transformExpressionsInOp(op, ternaryTransform, ir.VisitorContextFlag.None);
    }
  }
}

function isSafeAccessExpression(
  e: o.Expression,
): e is ir.SafePropertyReadExpr | ir.SafeKeyedReadExpr | ir.SafeInvokeFunctionExpr {
  return (
    e instanceof ir.SafePropertyReadExpr ||
    e instanceof ir.SafeKeyedReadExpr ||
    e instanceof ir.SafeInvokeFunctionExpr
  );
}

function isUnsafeAccessExpression(
  e: o.Expression,
): e is o.ReadPropExpr | o.ReadKeyExpr | o.InvokeFunctionExpr {
  return (
    e instanceof o.ReadPropExpr || e instanceof o.ReadKeyExpr || e instanceof o.InvokeFunctionExpr
  );
}

function isAccessExpression(
  e: o.Expression,
): e is
  | o.ReadPropExpr
  | ir.SafePropertyReadExpr
  | o.ReadKeyExpr
  | ir.SafeKeyedReadExpr
  | o.InvokeFunctionExpr
  | ir.SafeInvokeFunctionExpr {
  return isSafeAccessExpression(e) || isUnsafeAccessExpression(e);
}

function deepestSafeTernary(e: o.Expression): ir.SafeTernaryExpr | null {
  if (isAccessExpression(e) && e.receiver instanceof ir.SafeTernaryExpr) {
    let st = e.receiver;
    while (st.expr instanceof ir.SafeTernaryExpr) {
      st = st.expr;
    }
    return st;
  }
  return null;
}

function safeTransform(e: o.Expression): o.Expression {
  if (!isAccessExpression(e)) {
    return e;
  }

  const dst = deepestSafeTernary(e);

  let out: o.Expression = e;

  if (dst) {
    if (e instanceof o.InvokeFunctionExpr) {
      dst.expr = dst.expr.callFn(e.args);
      out = e.receiver;
    } else if (e instanceof o.ReadPropExpr) {
      dst.expr = dst.expr.prop(e.name);
      out = e.receiver;
    } else if (e instanceof o.ReadKeyExpr) {
      dst.expr = dst.expr.key(e.index);
      out = e.receiver;
    } else if (e instanceof ir.SafeInvokeFunctionExpr) {
      dst.expr = dst.expr.callFn(e.args, null, false, undefined, true);
      out = e.receiver;
    } else if (e instanceof ir.SafePropertyReadExpr) {
      dst.expr = dst.expr.prop(e.name, null, true);
      out = e.receiver;
    } else if (e instanceof ir.SafeKeyedReadExpr) {
      dst.expr = dst.expr.key(e.index, null, null, true);
      out = e.receiver;
    }
  } else {
    if (e instanceof ir.SafeInvokeFunctionExpr) {
      out = new ir.SafeTernaryExpr(
        o.NULL_EXPR,
        e.receiver.callFn(e.args, null, false, undefined, true),
      );
    } else if (e instanceof ir.SafePropertyReadExpr) {
      out = new ir.SafeTernaryExpr(o.NULL_EXPR, e.receiver.prop(e.name, null, true));
    } else if (e instanceof ir.SafeKeyedReadExpr) {
      out = new ir.SafeTernaryExpr(o.NULL_EXPR, e.receiver.key(e.index, null, null, true));
    }
  }

  return out;
}

function ternaryTransform(e: o.Expression): o.Expression {
  if (e instanceof o.BinaryOperatorExpr && e.operator === o.BinaryOperator.NullishCoalesce) {
    if (
      e.lhs instanceof o.ParenthesizedExpr &&
      e.lhs.expr instanceof o.BinaryOperatorExpr &&
      e.lhs.expr.operator === o.BinaryOperator.NullishCoalesce &&
      e.lhs.expr.rhs === o.NULL_EXPR
    ) {
      e.lhs = e.lhs.expr.lhs;
    }
  }
  if (!(e instanceof ir.SafeTernaryExpr)) {
    return e;
  }
  return new o.ParenthesizedExpr(
    new o.BinaryOperatorExpr(o.BinaryOperator.NullishCoalesce, e.expr, o.NULL_EXPR),
  );
}
