/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';


/**
 * Adds apply operations after i18n expressions.
 */
export function phaseApplyI18nExpressions(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      // Only add apply after expressions that are not followed by more expressions.
      if (op.kind === ir.OpKind.I18nExpression && needsApplication(op)) {
        // TODO: what should be the source span for the apply op?
        ir.OpList.insertAfter<ir.UpdateOp>(ir.createI18nApplyOp(op.target, null!), op);
      }
    }
  }
}

/**
 * Checks whether the given expression op needs to be followed with an apply op.
 */
function needsApplication(op: ir.I18nExpressionOp) {
  // If the next op is not another expression, we need to apply.
  if (op.next?.kind !== ir.OpKind.I18nExpression) {
    return true;
  }
  // If the next op is an expression targeting a different i18n block, we need to apply.
  if (op.next.target !== op.target) {
    return true;
  }
  return false;
}
