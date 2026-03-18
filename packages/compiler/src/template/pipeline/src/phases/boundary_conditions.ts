/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * Resolves conditions for boundary operations, generating an expression that
 * determines which branch to render based on the boundary state.
 */
export function generateBoundaryConditions(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.Boundary) {
        const boundaryXref = op.target;

        // We generate an expression like: `bnd_0.error === null ? primarySlot : errorSlot`

        const boundaryStateExpr = new ir.BoundaryStateExpr(boundaryXref);
        const errorProp = new o.ReadPropExpr(boundaryStateExpr, 'error');
        const condition = new o.BinaryOperatorExpr(
          o.BinaryOperator.Identical,
          errorProp,
          o.NULL_EXPR,
        );

        const primaryBranch = op.conditions.find((c) => c.target === op.primaryTarget);
        const errorBranch = op.conditions.find((c) => c.target !== op.primaryTarget);

        if (!primaryBranch || !errorBranch) {
          throw new Error(`Boundary must have both primary and error branches`);
        }

        op.processed = new o.ConditionalExpr(
          condition,
          new ir.SlotLiteralExpr(primaryBranch.targetSlot),
          new ir.SlotLiteralExpr(errorBranch.targetSlot),
        );
      }
    }
  }
}
