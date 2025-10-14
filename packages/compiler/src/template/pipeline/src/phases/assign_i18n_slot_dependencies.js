/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Updates i18n expression ops to target the last slot in their owning i18n block, and moves them
 * after the last update instruction that depends on that slot.
 */
export function assignI18nSlotDependencies(job) {
  for (const unit of job.units) {
    // The first update op.
    let updateOp = unit.update.head;
    // I18n expressions currently being moved during the iteration.
    let i18nExpressionsInProgress = [];
    // Non-null  while we are iterating through an i18nStart/i18nEnd pair
    let state = null;
    for (const createOp of unit.create) {
      if (createOp.kind === ir.OpKind.I18nStart) {
        state = {
          blockXref: createOp.xref,
          lastSlotConsumer: createOp.xref,
        };
      } else if (createOp.kind === ir.OpKind.I18nEnd) {
        for (const op of i18nExpressionsInProgress) {
          op.target = state.lastSlotConsumer;
          ir.OpList.insertBefore(op, updateOp);
        }
        i18nExpressionsInProgress.length = 0;
        state = null;
      }
      if (ir.hasConsumesSlotTrait(createOp)) {
        if (state !== null) {
          state.lastSlotConsumer = createOp.xref;
        }
        while (true) {
          if (updateOp.next === null) {
            break;
          }
          if (
            state !== null &&
            updateOp.kind === ir.OpKind.I18nExpression &&
            updateOp.usage === ir.I18nExpressionFor.I18nText &&
            updateOp.i18nOwner === state.blockXref
          ) {
            const opToRemove = updateOp;
            updateOp = updateOp.next;
            ir.OpList.remove(opToRemove);
            i18nExpressionsInProgress.push(opToRemove);
            continue;
          }
          let hasDifferentTarget = false;
          if (ir.hasDependsOnSlotContextTrait(updateOp) && updateOp.target !== createOp.xref) {
            hasDifferentTarget = true;
          } else if (
            // Some expressions may consume slots as well (e.g. `storeLet`).
            updateOp.kind === ir.OpKind.Statement ||
            updateOp.kind === ir.OpKind.Variable
          ) {
            ir.visitExpressionsInOp(updateOp, (expr) => {
              if (
                !hasDifferentTarget &&
                ir.hasDependsOnSlotContextTrait(expr) &&
                expr.target !== createOp.xref
              ) {
                hasDifferentTarget = true;
              }
            });
          }
          if (hasDifferentTarget) {
            break;
          }
          updateOp = updateOp.next;
        }
      }
    }
  }
}
//# sourceMappingURL=assign_i18n_slot_dependencies.js.map
