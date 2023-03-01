/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Generate `ir.AdvanceOp`s in between `ir.UpdateOp`s that ensure the runtime's implicit slot
 * context will be advanced correctly.
 */
export function phaseGenerateAdvance(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    // First build a map of all of the declarations in the view that have assigned slots.
    const slotMap = new Map<ir.XrefId, number>();
    for (const op of view.create) {
      if (!ir.hasConsumesSlotTrait(op)) {
        continue;
      } else if (op.slot === null) {
        throw new Error(
            `AssertionError: expected slots to have been allocated before generating advance() calls`);
      }

      slotMap.set(op.xref, op.slot);
    }

    // Next, step through the update operations and generate `ir.AdvanceOp`s as required to ensure
    // the runtime's implicit slot counter will be set to the correct slot before executing each
    // update operation which depends on it.
    //
    // To do that, we track what the runtime's slot counter will be through the update operations.
    let slotContext = 0;
    for (const op of view.update) {
      if (!ir.hasDependsOnSlotContextTrait(op)) {
        // `op` doesn't depend on the slot counter, so it can be skipped.
        continue;
      } else if (!slotMap.has(op.target)) {
        // We expect ops that _do_ depend on the slot counter to point at declarations that exist in
        // the `slotMap`.
        throw new Error(`AssertionError: reference to unknown slot for var ${op.target}`);
      }

      const slot = slotMap.get(op.target)!;

      // Does the slot counter need to be adjusted?
      if (slotContext !== slot) {
        // If so, generate an `ir.AdvanceOp` to advance the counter.
        const delta = slot - slotContext;
        if (delta < 0) {
          throw new Error(`AssertionError: slot counter should never need to move backwards`);
        }

        ir.OpList.insertBefore<ir.UpdateOp>(ir.createAdvanceOp(delta), op);
        slotContext = slot;
      }
    }
  }
}
