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

/**
 * Looks for the HasConst trait, indicating that an op or expression has some data which
 * should be collected into the constant array. Capable of collecting either a single literal value,
 * or an array literal.
 */
export function phaseConstTraitCollection(job: ComponentCompilationJob): void {
  const collectGlobalConsts = (e: o.Expression): o.Expression => {
    if (e instanceof ir.ExpressionBase && ir.hasConstTrait(e as ir.Expression)) {
      // TODO: Figure out how to make this type narrowing work.
      const ea = e as unknown as ir.ExpressionBase & ir.HasConstTrait;
      if (ea.constValue !== null) {
        ea.constIndex = job.addConst(ea.constValue as unknown as o.Expression);
      }
    }
    return e;
  };

  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (ir.hasConstTrait(op) && op.constValue !== null) {
        op.constIndex = job.addConst(op.makeExpression(op.constValue));
      }
      ir.transformExpressionsInOp(op, collectGlobalConsts, ir.VisitorContextFlag.None);
    }
  }
}
