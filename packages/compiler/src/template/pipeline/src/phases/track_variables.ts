/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

/**
 * Inside the `track` expression on a `for` repeater, the `$index` and `$item` variables are
 * ambiently available. In this phase, we find those variable usages, and replace them with the
 * appropriate output read.
 */
export function generateTrackVariables(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.RepeaterCreate) {
        continue;
      }

      op.track = ir.transformExpressionsInExpression(
        op.track,
        (expr) => {
          if (expr instanceof ir.LexicalReadExpr) {
            if (op.varNames.$index.has(expr.name)) {
              return o.variable('$index');
            } else if (expr.name === op.varNames.$implicit) {
              return o.variable('$item');
            }

            // TODO: handle prohibited context variables (emit as globals?)
          }
          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
