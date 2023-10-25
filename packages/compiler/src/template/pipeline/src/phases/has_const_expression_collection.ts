/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

export function phaseConstExpressionCollection(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(op, expr => {
        if (!(expr instanceof ir.ConstCollectedExpr)) {
          return expr;
        }
        return o.literal(job.addConst(expr.expr));
      }, ir.VisitorContextFlag.None);
    }
  }
}
