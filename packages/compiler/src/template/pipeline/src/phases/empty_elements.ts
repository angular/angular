/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Replace sequences of mergable instructions (e.g. `ElementStart` and `ElementEnd`) with a
 * consolidated instruction (e.g. `Element`).
 */
export function collapseEmptyInstructions(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create.reversed()) {
      if (ir.hasCollapsableStartTrait(op)) {
        for (let curr = op.next; curr !== null; curr = curr.next) {
          if (ir.hasCollapsableEndTrait(curr) && curr.xref === op.xref) {
            ir.OpList.remove(curr);
            ir.OpList.replace(op, op.collapse());
          }
          if (!(curr instanceof ir.PipeOp)) {
            // Pipes are ignored, since their position doesn't matter.
            // TODO: We can probably remove this check once compatibility mode is disabled, since
            // pipes will be appended to the create block.
            // If the start / end pair contains a non-ignored op, then we can't collapse them.
            break;
          }
        }
      }
    }
  }
}
