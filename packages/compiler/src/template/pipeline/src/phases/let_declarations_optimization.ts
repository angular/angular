/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Transforms the generated code for let declarations based on their usage. Depending on how a
 * `@let` declaration is used, its the expressions can take the following forms:
 * 1. Declarations that aren't used anywhere can be dropped completely.
 * 2. Declarations used *only* in the declaration view can be inlined, e.g. `storeLet(foo + bar)`
 *    becomes `const name = foo + bar`.
 * 3. Declarations used *only* in child embedded view or event listeners can be preserved as
 *    bare `storeLet` calls, without the need for additional variables.
 * 4. Declarations used *both* in the embedded views/listeners *and* in the declaration view need
 *    to be expanded to a variable with a `storeLet` initializer. E.g. `storeLet(foo + bar)`
 *    becomes `const name = storeLet(foo + bar)`.
 *
 * Note: there are opportunities to save more bytes and slots by removing the corresponding
 * `declareLet` op whenever a `storeLet` is removed. We don't do it, because:
 * 1. Removing the  `declareLet` will also remove the TNode which may break DI for pipes.
 * 2. We could decide not to remove `declareLet` if its expression uses pipes or if it is first
 *    in the instruction set, however that adds more mental overhead and could lead to subtle
 *    bugs in the future.
 */
export function optimizeLetDeclarations(job: CompilationJob): void {
  const localVarUsages = new Map<ir.XrefId, number>();
  const letUsedExternally = new Set<ir.XrefId>();

  // Since `@let` declarations can be referenced in child views, both in
  // the creation block (via listeners) and in the update block, we have
  // to look through all the ops to find the references.
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (
        op.kind === ir.OpKind.DeclareLet ||
        (op.kind === ir.OpKind.Variable && op.initializer instanceof ir.StoreLetExpr)
      ) {
        localVarUsages.set(op.xref, 0);
      }

      ir.visitExpressionsInOp(op, (expr) => {
        if (expr instanceof ir.ContextLetReferenceExpr) {
          letUsedExternally.add(expr.target);
        } else if (expr instanceof ir.ReadVariableExpr && localVarUsages.has(expr.xref)) {
          localVarUsages.set(expr.xref, localVarUsages.get(expr.xref)! + 1);
        }
      });
    }
  }

  // Iterate the update the instructions in reverse since references
  // happen after the definition so they should be removed first.
  for (const unit of job.units) {
    for (const op of unit.update.reversed()) {
      if (op.kind !== ir.OpKind.Variable || !(op.initializer instanceof ir.StoreLetExpr)) {
        continue;
      }

      if (op.variable.kind !== ir.SemanticVariableKind.Identifier) {
        throw new Error('Assertion error: expected storeLet to be inside an identifier variable');
      }

      const {target, value, sourceSpan} = op.initializer;
      const isUsedLocally = localVarUsages.has(op.xref) && localVarUsages.get(op.xref)! > 0;
      const isUsedExternally = letUsedExternally.has(target);

      if (isUsedLocally && !isUsedExternally) {
        // Only used locally, the `storeLet` call isn't necessary.
        op.initializer = value;
      } else if (!isUsedLocally && isUsedExternally) {
        // Only used externally, replace the variable with a `storeLet` call.
        ir.OpList.replace<ir.UpdateOp>(
          op,
          ir.createStoreLetOp(target, op.variable.identifier, value, sourceSpan),
        );
      } else if (!isUsedLocally && !isUsedExternally) {
        // @let isn't used anywhere, we can drop it completely. Decrease the variable
        // usage count so that we can remove any variables it might've depended on.
        ir.visitExpressionsInOp(op, (expr) => {
          if (expr instanceof ir.ReadVariableExpr && localVarUsages.has(expr.xref)) {
            localVarUsages.set(expr.xref, localVarUsages.get(expr.xref)! - 1);
          }
        });
        ir.OpList.remove<ir.UpdateOp>(op);
      }
    }
  }
}
