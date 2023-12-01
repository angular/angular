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
 * Updates i18n expression ops to depend on the last slot in their owning i18n block.
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
          i18nLastSlotConsumers.set(currentI18nOp!.xref, lastSlotConsumer!);
          currentI18nOp = null;
          break;
      }
    }

    // Assign i18n expressions to target the last slot in their owning block. Also move the ops
    // below any other ops that depend on that same slot context to mimic the behavior of
    // TemplateDefinitionBuilder.
    // TODO(mmalerba): We may want to simplify the ordering logic once compatibility with
    // TemplateDefinitionBuilder is no longer required. Though we likely still want *some* type of
    // ordering to maximize opportunities for chaining.
    let moveToTarget: ir.XrefId|null = null;
    let opsToMove: ir.UpdateOp[] = [];
    let previousTarget: ir.XrefId|null = null;
    let currentTarget: ir.XrefId|null = null;
    for (const op of unit.update) {
      currentTarget = ir.hasDependsOnSlotContextTrait(op) ? op.target : null;

      // Re-target i18n expression ops.
      if (op.kind === ir.OpKind.I18nExpression) {
        op.target = i18nLastSlotConsumers.get(op.target)!;
        moveToTarget = op.target;
      }

      // Pull out i18n expression and apply ops to be moved.
      if (op.kind === ir.OpKind.I18nExpression || op.kind === ir.OpKind.I18nApply) {
        opsToMove.push(op);
        ir.OpList.remove<ir.UpdateOp>(op);
        currentTarget = moveToTarget;
      }

      // Add back any ops that were previously pulled once we pass the point where they should be
      // inserted.
      if (moveToTarget !== null && previousTarget === moveToTarget &&
          currentTarget !== previousTarget) {
        ir.OpList.insertBefore(opsToMove, op);
        opsToMove = [];
      }

      // Update the previous target for the next pass through
      previousTarget = currentTarget;
    }

    // If there are any mvoed ops that haven't been put back yet, put them back at the end.
    if (opsToMove) {
      unit.update.push(opsToMove);
    }
  }
}
