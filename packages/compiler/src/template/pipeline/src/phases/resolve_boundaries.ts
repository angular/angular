/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob, CompilationUnit} from '../compilation';

/**
 * Resolves `BoundaryStateExpr` to `ReadVariableExpr` by mapping the boundary `XrefId`
 * to the `XrefId` of the `VariableOp` that retrieves the boundary state.
 */
export function resolveBoundaries(job: CompilationJob): void {
  for (const unit of job.units) {
    processUnit(unit);
  }
}

function processUnit(unit: CompilationUnit): void {
  // Map from boundary create op xref to variable op xref.
  const boundaryToVariableMap = new Map<ir.XrefId, ir.XrefId>();

  // First pass: find all VariableOps that hold boundary state and build the map.
  for (const op of unit.ops()) {
    if (
      op.kind === ir.OpKind.Variable &&
      op.variable.kind === ir.SemanticVariableKind.BoundaryState
    ) {
      const variable = op.variable as ir.BoundaryStateVariable;
      boundaryToVariableMap.set(variable.boundaryXref, op.xref);
    }
  }

  // Second pass: resolve BoundaryStateExpr to ReadVariableExpr.
  for (const op of unit.ops()) {
    ir.transformExpressionsInOp(
      op,
      (expr) => {
        if (expr instanceof ir.BoundaryStateExpr) {
          const variableXref = boundaryToVariableMap.get(expr.xref);
          if (variableXref === undefined) {
            throw new Error(`Could not find variable for boundary ${expr.xref}`);
          }
          return new ir.ReadVariableExpr(variableXref);
        }
        return expr;
      },
      ir.VisitorContextFlag.None,
    );
  }
}
