/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

export function phaseTrackVariables(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.RepeaterCreate) {
        continue;
      }

      op.track = ir.transformExpressionsInExpression(op.track, expr => {
        if (expr instanceof ir.LexicalReadExpr) {
          if (expr.name === op.varNames.$index) {
            return o.variable('$index');
          } else if (expr.name === op.varNames.$implicit) {
            return o.variable('$item');
          }

          // TODO: handle prohibited context variables (emit as globals?)
        }
        return expr;
      }, ir.VisitorContextFlag.None);
    }
  }
}
