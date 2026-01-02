/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentCompilationJob, HostBindingCompilationJob} from '../compilation';
import * as ir from '../../ir';
import * as o from '../../../../output/output_ast';

/**
 * Replaces inline definitions of callbacks in templates either with a call to store them (if they
 * reference the context) or an op to extract them into the constant pool.
 */
export function storeTemplateCallbacks(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    const storedCallbacks = new Map<o.ArrowFunctionExpr, o.Expression>();

    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr, flags) => {
          // We only care about top-level arrow functions. We can't optimize nested arrow functions
          // (e.g. one arrow function returning another), because it involves inserting more ops.
          if (
            !(expr instanceof o.ArrowFunctionExpr) ||
            flags & ir.VisitorContextFlag.InChildOperation
          ) {
            return expr;
          }

          // Consolidate identical functions.
          for (const [storedFn, referenceExpr] of storedCallbacks.entries()) {
            if (storedFn.isEquivalent(expr)) {
              return referenceExpr.clone();
            }
          }

          const params = expr.params.map((p) => p.name);
          const callbackOps: ir.UpdateOp[] = Array.isArray(expr.body)
            ? expr.body.map((stmt) => ir.createStatementOp(stmt))
            : [ir.createStatementOp(new o.ReturnStatement(expr.body, expr.sourceSpan))];

          const callbackName = job.pool.uniqueName('_callbackFn');
          let callbackOp: ir.StoreCallbackOp | ir.ExtractCallbackOp;
          let referenceExpr: o.Expression;

          // If a callback has context references, we need to capture a reference to the context
          // and we need to store the callback. Otherwise we can mark it to be extracted.
          if (hasContextReferences(expr)) {
            callbackOp = ir.createStoreCallbackOp(
              job.allocateXrefId(),
              params,
              callbackOps,
              callbackName,
            );
            referenceExpr = new ir.LexicalReadExpr(callbackName);
          } else {
            callbackOp = ir.createExtractCallbackOp(params, callbackOps, callbackName);
            referenceExpr = o.variable(callbackName);
          }

          storedCallbacks.set(expr, referenceExpr);
          unit.create.push(callbackOp);
          return referenceExpr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

/**
 * Replaces inline definitions of callbacks in host bindings either with an op to extract them into
 * the constant pool, if they don't have context references.
 */
export function storeHostBindingCallbacks(job: HostBindingCompilationJob): void {
  // Note: this phase serves the same purpose as `storeTemplateCallbacks` above, but we can't
  // use the latter for host bindings, because storage requires a slot and slots aren't available
  // in host bindings. An alternative is to store them in vars like we do for pure functions, but
  // due to #66263 we can't store them reliably.
  for (const unit of job.units) {
    const storedCallbacks = new Map<o.ArrowFunctionExpr, string>();

    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr, flags) => {
          if (
            !(expr instanceof o.ArrowFunctionExpr) ||
            flags & ir.VisitorContextFlag.InChildOperation
          ) {
            return expr;
          }

          for (const [storedFn, referenceVarName] of storedCallbacks.entries()) {
            if (storedFn.isEquivalent(expr)) {
              return o.variable(referenceVarName);
            }
          }

          // We can't extract the callback if it has references to the context.
          if (hasContextReferences(expr)) {
            return expr;
          }

          const params = expr.params.map((p) => p.name);
          const callbackOps: ir.UpdateOp[] = Array.isArray(expr.body)
            ? expr.body.map((stmt) => ir.createStatementOp(stmt))
            : [ir.createStatementOp(new o.ReturnStatement(expr.body, expr.sourceSpan))];

          const callbackName = job.pool.uniqueName('_callbackFn');
          const defineOp = ir.createExtractCallbackOp(params, callbackOps, callbackName);
          storedCallbacks.set(expr, callbackName);
          unit.create.push(defineOp);
          return o.variable(callbackName);
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

function hasContextReferences(root: o.Expression): boolean {
  let result = false;

  ir.transformExpressionsInExpression(
    root,
    (expr) => {
      if (expr instanceof ir.LexicalReadExpr || expr instanceof ir.ContextExpr) {
        result = true;
      }
      return expr;
    },
    ir.VisitorContextFlag.None,
  );

  return result;
}
