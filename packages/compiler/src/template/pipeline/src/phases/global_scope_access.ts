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

/**
 * Find any access to `globalThis` and replace them with `globalThis` to allow global scope access
 */
export function accessGlobalScope(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(op, replaceGlobalThis, ir.VisitorContextFlag.None);
    }
  }
}

function replaceGlobalThis(expr: o.Expression): o.Expression {
  if (expr instanceof ir.LexicalReadExpr && expr.name === 'globalThis') {
    return new o.ReadVarExpr('globalThis');
  }
  return expr;
}
