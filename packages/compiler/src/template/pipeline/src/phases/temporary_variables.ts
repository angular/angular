/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Find all assignments and usages of temporary variables, which are linked to each other with cross
 * references. Generate names for each cross-reference, and add a `DeclareVarStmt` to initialize
 * them at the beginning of the update block.
 *
 * TODO: Sometimes, it will be possible to reuse names across different subexpressions. For example,
 * in the double keyed read `a?.[f()]?.[f()]`, the two function calls have non-overlapping scopes.
 * Implement an algorithm for reuse.
 */
export function phaseTemporaryVariables(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    let opCount = 0;
    let generatedStatements: Array<ir.StatementOp<ir.UpdateOp>> = [];
    for (const op of view.ops()) {
      let count = 0;
      let xrefs = new Set<ir.XrefId>();
      let defs = new Map<ir.XrefId, string>();

      ir.visitExpressionsInOp(op, expr => {
        if (expr instanceof ir.ReadTemporaryExpr || expr instanceof ir.AssignTemporaryExpr) {
          xrefs.add(expr.xref);
        }
      });

      for (const xref of xrefs) {
        // TODO: Exactly replicate the naming scheme used by `TemplateDefinitionBuilder`. It seems
        // to rely on an expression index instead of an op index.
        defs.set(xref, `tmp_${opCount}_${count++}`);
      }

      ir.visitExpressionsInOp(op, expr => {
        if (expr instanceof ir.ReadTemporaryExpr || expr instanceof ir.AssignTemporaryExpr) {
          const name = defs.get(expr.xref);
          if (name === undefined) {
            throw new Error('Found xref with unassigned name');
          }
          expr.name = name;
        }
      });

      generatedStatements.push(
          ...Array.from(defs.values())
              .map(name => ir.createStatementOp<ir.UpdateOp>(new o.DeclareVarStmt(name))));
      opCount++;
    }
    view.update.prepend(generatedStatements);
  }
}
