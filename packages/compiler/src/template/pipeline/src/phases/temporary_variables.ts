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
        defs.set(xref, `tmp_op${opCount}_${count++}`);
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