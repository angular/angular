/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GenericKeyFn, SharedConstantDefinition} from '../../../../constant_pool';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

export function extractPureFunctions(job: CompilationJob): void {
  for (const view of job.units) {
    for (const op of view.ops()) {
      ir.visitExpressionsInOp(op, (expr) => {
        if (!(expr instanceof ir.PureFunctionExpr) || expr.body === null) {
          return;
        }

        const constantDef = new PureFunctionConstant(expr.args.length);
        expr.fn = job.pool.getSharedConstant(constantDef, expr.body);
        expr.body = null;
      });
    }
  }
}

class PureFunctionConstant extends GenericKeyFn implements SharedConstantDefinition {
  constructor(private numArgs: number) {
    super();
  }

  override keyOf(expr: o.Expression): string {
    if (expr instanceof ir.PureFunctionParameterExpr) {
      return `param(${expr.index})`;
    } else {
      return super.keyOf(expr);
    }
  }

  // TODO: Use the new pool method `getSharedFunctionReference`
  toSharedConstantDeclaration(declName: string, keyExpr: o.Expression): o.Statement {
    const fnParams: o.FnParam[] = [];
    for (let idx = 0; idx < this.numArgs; idx++) {
      fnParams.push(new o.FnParam('a' + idx));
    }

    // We will never visit `ir.PureFunctionParameterExpr`s that don't belong to us, because this
    // transform runs inside another visitor which will visit nested pure functions before this one.
    const returnExpr = ir.transformExpressionsInExpression(
      keyExpr,
      (expr) => {
        if (!(expr instanceof ir.PureFunctionParameterExpr)) {
          return expr;
        }

        return o.variable('a' + expr.index);
      },
      ir.VisitorContextFlag.None,
    );

    return new o.DeclareVarStmt(
      declName,
      new o.ArrowFunctionExpr(fnParams, returnExpr),
      undefined,
      o.StmtModifier.Final,
    );
  }
}
