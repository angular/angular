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
 * Updates i18n expression ops to target the last slot in their owning i18n block, and moves them
 * after the last update instruction that depends on that slot.
 */
export function assignI18nSlotDependencies(job: CompilationJob) {
  const i18nLastSlotConsumers = new Map<ir.XrefId, ir.XrefId>();
  let lastSlotConsumer: ir.XrefId|null = null;
  let currentI18nOp: ir.I18nStartOp|null = null;

  for (const unit of job.units) {
    // Record the last consumed slot before each i18n end instruction.
    for (const op of unit.create) {
      if (ir.hasConsumesSlotTrait(op)) {
        lastSlotConsumer = op.xref;
      }

      switch (op.kind) {
        case ir.OpKind.I18nStart:
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          if (currentI18nOp === null) {
            throw new Error(
                'AssertionError: Expected an active I18n block while calculating last slot consumers');
          }
          if (lastSlotConsumer === null) {
            throw new Error(
                'AssertionError: Expected a last slot consumer while calculating last slot consumers');
          }
          i18nLastSlotConsumers.set(currentI18nOp.xref, lastSlotConsumer);
          currentI18nOp = null;
          break;
      }
    }

    // Expresions that are currently being moved.
    let opsToMove: ir.I18nExpressionOp[] = [];
    // Previously we found the last slot-consuming create mode op in the i18n block. That op will be
    // the new target for any moved i18n expresion inside the i18n block, and that op's slot is
    // stored here.
    let moveAfterTarget: ir.XrefId|null = null;
    // This is the last target in the create IR that we saw during iteration. Eventally, it will be
    // equal to moveAfterTarget. But wait! We need to find the *last* such op whose target is equal
    // to `moveAfterTarget`.
    let previousTarget: ir.XrefId|null = null;
    for (const op of unit.update) {
      if (ir.hasDependsOnSlotContextTrait(op)) {
        // We've found an op that depends on another slot other than the one that we want to move
        // the expressions to, after previously having seen the one we want to move to.
        if (moveAfterTarget !== null && previousTarget === moveAfterTarget &&
            op.target !== previousTarget) {
          ir.OpList.insertBefore<ir.UpdateOp>(opsToMove, op);
          moveAfterTarget = null;
          opsToMove = [];
        }
        previousTarget = op.target;
      }

      if (op.kind === ir.OpKind.I18nExpression && op.usage === ir.I18nExpressionFor.I18nText) {
        // This is an I18nExpressionOps that is used for text (not attributes).
        ir.OpList.remove<ir.UpdateOp>(op);
        opsToMove.push(op);
        const target = i18nLastSlotConsumers.get(op.i18nOwner);
        if (target === undefined) {
          throw new Error(
              'AssertionError: Expected to find a last slot consumer for an I18nExpressionOp');
        }
        op.target = target;
        moveAfterTarget = op.target;
      }
    }

    if (moveAfterTarget !== null) {
      unit.update.push(opsToMove);
    }
  }
}
