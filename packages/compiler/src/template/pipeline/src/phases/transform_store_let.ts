/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Transforms the generated code for `StoreLetOp` based on its usage. Depending on how a `@let`
 * declaration is used, its the expressions can take the following forms:
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
export function transformStoreLetCalls(job: CompilationJob): void {
  const localVarUsages = new Map<ir.XrefId, number>();
  const letUsedExternally = new Set<ir.XrefId>();

  // Since `@let` declarations can be referenced in child views, both in
  // the creation block (via listeners) and in the update block, we have
  // to look through all the ops to find the references.
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (op.kind === ir.OpKind.StoreLet) {
        localVarUsages.set(op.target, 0);
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

  for (const unit of job.units) {
    // Iterate the update the instructions in reverse since references
    // happen after the definition so they should be removed first.
    for (const op of unit.update.reversed()) {
      if (op.kind !== ir.OpKind.StoreLet) {
        continue;
      }

      const isUsedLocally = localVarUsages.has(op.target) && localVarUsages.get(op.target)! > 0;
      const isUsedExternally = letUsedExternally.has(op.target);

      // @let is only used outside of the declaration view. Leave it as is.
      if (!isUsedLocally && isUsedExternally) {
        continue;
      }

      if (!isUsedLocally && !isUsedExternally) {
        // @let isn't used anywhere, we can drop it completely. Decrease the variable
        // usage count so that we can remove any variables it might've depended on.
        ir.visitExpressionsInOp(op, (expr) => {
          if (expr instanceof ir.ReadVariableExpr && localVarUsages.has(expr.xref)) {
            localVarUsages.set(expr.xref, localVarUsages.get(expr.xref)! - 1);
          }
        });
        ir.OpList.remove<ir.UpdateOp>(op);
      } else if (isUsedLocally && isUsedExternally) {
        // @let is used both in the declaration view and in a child view. Flip a flag on it
        // that indicates that it should produce a variable during reification. Note that
        // we don't transform it into a variable here, because we need the `advance` calls to
        // be generated first and normally variable ops don't need `advance` calls.
        op.isUsedAcrossViewBoundaries = true;
      } else if (isUsedLocally && !isUsedExternally) {
        // @let is used only in the current view. It can be replaced with an inline variable.
        const replacement = ir.createVariableOp<ir.UpdateOp>(
          op.target,
          {
            kind: ir.SemanticVariableKind.Identifier,
            name: null,
            identifier: op.declaredName,
          },
          op.value,
          ir.VariableFlags.None,
        );
        ir.OpList.replace<ir.UpdateOp>(op, replacement);
      }
    }
  }
}
