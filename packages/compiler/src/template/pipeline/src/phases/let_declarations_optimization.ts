/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Optimizes any remaining `@let` declarations after variable optimization. Depending on how a
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
      if (isStoreLetVariable(op)) {
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
      // Both of these represent a bare `storeLet` call. It can be a `Statement` if
      // the variable optimizer removed a variable with a `storeLet` initializer.
      if (
        (op.kind === ir.OpKind.StoreLet && !letUsedExternally.has(op.target)) ||
        (op.kind === ir.OpKind.Statement &&
          op.statement instanceof o.ExpressionStatement &&
          op.statement.expr instanceof ir.StoreLetExpr &&
          !letUsedExternally.has(op.statement.expr.target))
      ) {
        removeStoreLetOp(op, localVarUsages);
      } else if (isStoreLetVariable(op)) {
        const {target, value, sourceSpan} = op.initializer;
        const isUsedLocally = localVarUsages.has(op.xref) && localVarUsages.get(op.xref)! > 0;
        const isUsedExternally = letUsedExternally.has(target);

        if (isUsedLocally && !isUsedExternally) {
          // Drop the `storeLet` call when only used in the same view.
          (op as ir.VariableOp<ir.UpdateOp>).initializer = value;
        } else if (!isUsedLocally && isUsedExternally) {
          // Replace the variable with a `storeLet` when only used in other views.
          ir.OpList.replace<ir.UpdateOp>(
            op,
            ir.createStoreLetOp(target, op.variable.identifier, value, sourceSpan),
          );
        } else if (!isUsedLocally && !isUsedExternally) {
          // Drop the variable completely when not used. Most of these should've been picked up
          // by the variable optimizer, but there may be some left when optimizing a chain of
          // `@let` declarations.
          removeStoreLetOp(op, localVarUsages);
        }
      }
    }
  }
}

/** Checks if an op is a variable initialized to a `storeLet`. */
function isStoreLetVariable(op: ir.CreateOp | ir.UpdateOp): op is ir.VariableOp<ir.UpdateOp> & {
  variable: ir.IdentifierVariable;
  initializer: ir.StoreLetExpr;
} {
  return (
    op.kind === ir.OpKind.Variable &&
    op.variable.kind == ir.SemanticVariableKind.Identifier &&
    op.initializer instanceof ir.StoreLetExpr
  );
}

/** Removes an op that contains a `storeLet` call. */
function removeStoreLetOp(op: ir.UpdateOp, localVarUsages: Map<ir.XrefId, number>): void {
  ir.visitExpressionsInOp(op, (expr) => {
    if (expr instanceof ir.ReadVariableExpr && localVarUsages.has(expr.xref)) {
      localVarUsages.set(expr.xref, localVarUsages.get(expr.xref)! - 1);
    }
  });
  ir.OpList.remove<ir.UpdateOp>(op);
}
