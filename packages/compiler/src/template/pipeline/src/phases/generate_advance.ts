/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Generate `ir.AdvanceOp`s in between `ir.UpdateOp`s that ensure the runtime's implicit slot
 * context will be advanced correctly.
 */
export function generateAdvance(job: CompilationJob): void {
  for (const unit of job.units) {
    // First build a map of all of the declarations in the view that have assigned slots.
    const slotMap = new Map<ir.XrefId, number>();
    for (const op of unit.create) {
      if (!ir.hasConsumesSlotTrait(op)) {
        continue;
      } else if (op.handle.slot === null) {
        throw new Error(
          `AssertionError: expected slots to have been allocated before generating advance() calls`,
        );
      }

      slotMap.set(op.xref, op.handle.slot);
    }

    // Next, step through the update operations and generate `ir.AdvanceOp`s as required to ensure
    // the runtime's implicit slot counter will be set to the correct slot before executing each
    // update operation which depends on it.
    //
    // To do that, we track what the runtime's slot counter will be through the update operations.
    let slotContext = 0;
    for (const op of unit.update) {
      let consumer: ir.DependsOnSlotContextOpTrait | null = null;

      if (ir.hasDependsOnSlotContextTrait(op)) {
        consumer = op;
      } else {
        ir.visitExpressionsInOp(op, (expr) => {
          if (consumer === null && ir.hasDependsOnSlotContextTrait(expr)) {
            consumer = expr;
          }
        });
      }

      if (consumer === null) {
        continue;
      }

      if (!slotMap.has(consumer.target)) {
        // We expect ops that _do_ depend on the slot counter to point at declarations that exist in
        // the `slotMap`.
        throw new Error(`AssertionError: reference to unknown slot for target ${consumer.target}`);
      }

      const slot = slotMap.get(consumer.target)!;

      // Does the slot counter need to be adjusted?
      if (slotContext !== slot) {
        // If so, generate an `ir.AdvanceOp` to advance the counter.
        const delta = slot - slotContext;
        if (delta < 0) {
          throw new Error(`AssertionError: slot counter should never need to move backwards`);
        }

        ir.OpList.insertBefore<ir.UpdateOp>(ir.createAdvanceOp(delta, consumer.sourceSpan), op);
        slotContext = slot;
      }
    }
  }
}
