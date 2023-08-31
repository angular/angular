/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob, ComponentCompilationJob} from '../compilation';

/**
 * Find all assignments and usages of temporary variables, which are linked to each other with cross
 * references. Generate names for each cross-reference, and add a `DeclareVarStmt` to initialize
 * them at the beginning of the update block.
 *
 * TODO: Sometimes, it will be possible to reuse names across different subexpressions. For example,
 * in the double keyed read `a?.[f()]?.[f()]`, the two function calls have non-overlapping scopes.
 * Implement an algorithm for reuse.
 */
export function phaseTemporaryVariables(cpl: CompilationJob): void {
  for (const unit of cpl.units) {
    let opCount = 0;
    let generatedStatements: Array<ir.StatementOp<ir.UpdateOp>> = [];
    for (const op of unit.ops()) {
      // Identify the final time each temp var is read.
      const finalReads = new Map<ir.XrefId, ir.ReadTemporaryExpr>();
      ir.visitExpressionsInOp(op, expr => {
        if (expr instanceof ir.ReadTemporaryExpr) {
          finalReads.set(expr.xref, expr);
        }
      });

      // Name the temp vars, accounting for the fact that a name can be reused after it has been
      // read for the final time.
      let count = 0;
      const assigned = new Set<ir.XrefId>();
      const released = new Set<ir.XrefId>();
      const defs = new Map<ir.XrefId, string>();
      ir.visitExpressionsInOp(op, expr => {
        if (expr instanceof ir.AssignTemporaryExpr) {
          if (!assigned.has(expr.xref)) {
            assigned.add(expr.xref);
            // TODO: Exactly replicate the naming scheme used by `TemplateDefinitionBuilder`.
            // It seems to rely on an expression index instead of an op index.
            defs.set(expr.xref, `tmp_${opCount}_${count++}`);
          }
          assignName(defs, expr);
        } else if (expr instanceof ir.ReadTemporaryExpr) {
          if (finalReads.get(expr.xref) === expr) {
            released.add(expr.xref);
            count--;
          }
          assignName(defs, expr);
        }
      });

      // Add declarations for the temp vars.
      generatedStatements.push(
          ...Array.from(new Set(defs.values()))
              .map(name => ir.createStatementOp<ir.UpdateOp>(new o.DeclareVarStmt(name))));
      opCount++;
    }
    unit.update.prepend(generatedStatements);
  }
}

/**
 * Assigns a name to the temporary variable in the given temporary variable expression.
 */
function assignName(
    names: Map<ir.XrefId, string>, expr: ir.AssignTemporaryExpr|ir.ReadTemporaryExpr) {
  const name = names.get(expr.xref);
  if (name === undefined) {
    throw new Error(`Found xref with unassigned name: ${expr.xref}`);
  }
  expr.name = name;
}
