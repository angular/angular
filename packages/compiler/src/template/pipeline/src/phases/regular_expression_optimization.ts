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

/** Optimizes regular expressions used in expressions. */
export function optimizeRegularExpressions(job: CompilationJob): void {
  for (const view of job.units) {
    for (const op of view.ops()) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          if (
            expr instanceof o.RegularExpressionLiteralExpr &&
            // We can't optimize global regexes, because they're stateful.
            (expr.flags === null || !expr.flags.includes('g'))
          ) {
            return job.pool.getSharedConstant(new RegularExpressionConstant(), expr);
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

class RegularExpressionConstant extends GenericKeyFn implements SharedConstantDefinition {
  toSharedConstantDeclaration(declName: string, keyExpr: o.Expression): o.Statement {
    return new o.DeclareVarStmt(declName, keyExpr, undefined, o.StmtModifier.Final);
  }
}
