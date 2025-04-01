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
 * It's not allowed to access a `@let` declaration before it has been defined. This is enforced
 * already via template type checking, however it can trip some of the assertions in the pipeline.
 * E.g. the naming phase can fail because we resolved the variable here, but the variable doesn't
 * exist anymore because the optimization phase removed it since it's invalid. To avoid surfacing
 * confusing errors to users in the case where template type checking isn't running (e.g. in JIT
 * mode) this phase detects illegal forward references and replaces them with `undefined`.
 * Eventually users will see the proper error from the template type checker.
 */
export function removeIllegalLetReferences(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (
        op.kind !== ir.OpKind.Variable ||
        op.variable.kind !== ir.SemanticVariableKind.Identifier ||
        !(op.initializer instanceof ir.StoreLetExpr)
      ) {
        continue;
      }

      const name = op.variable.identifier;
      let current: ir.UpdateOp | null = op;
      while (current && current.kind !== ir.OpKind.ListEnd) {
        ir.transformExpressionsInOp(
          current,
          (expr) =>
            expr instanceof ir.LexicalReadExpr && expr.name === name ? o.literal(undefined) : expr,
          ir.VisitorContextFlag.None,
        );
        current = current.prev;
      }
    }
  }
}
