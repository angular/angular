/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';

import type {ComponentCompilationJob} from '../compilation';

/**
 * Replaces the `storeLet` ops with variables that can be
 * used to reference the value within the same view.
 */
export function generateLocalLetReferences(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind !== ir.OpKind.StoreLet) {
        continue;
      }

      const variable: ir.IdentifierVariable = {
        kind: ir.SemanticVariableKind.Identifier,
        name: null,
        identifier: op.declaredName,
        local: true,
      };

      ir.OpList.replace<ir.UpdateOp>(
        op,
        ir.createVariableOp<ir.UpdateOp>(
          job.allocateXrefId(),
          variable,
          new ir.StoreLetExpr(op.target, op.value, op.sourceSpan),
          ir.VariableFlags.None,
        ),
      );
    }
  }
}
