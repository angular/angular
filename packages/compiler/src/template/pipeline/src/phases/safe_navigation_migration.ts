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
 * Find any function calls to `$safeNavigationMigration`, and remove them, while marking the argument
 * so that it uses the legacy null-returning safe navigation semantics.
 */
export function removeSafeNavigationMigration(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(
        op,
        (e) => convertSafeNavigationMigrationCall(e),
        ir.VisitorContextFlag.None,
      );
    }
  }
}

function convertSafeNavigationMigrationCall(e: o.Expression): o.Expression {
  if (
    e instanceof o.InvokeFunctionExpr &&
    e.fn instanceof ir.LexicalReadExpr &&
    e.fn.name === '$safeNavigationMigration'
  ) {
    if (e.args.length !== 1) {
      throw new Error(
        'The $safeNavigationMigration builtin function expects exactly one argument.',
      );
    }
    return new ir.SafeNavigationMigrationExpr(e.args[0]);
  }
  return e;
}
