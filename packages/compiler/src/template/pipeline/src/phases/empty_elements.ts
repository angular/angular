/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

const REPLACEMENTS = new Map<ir.OpKind, [ir.OpKind, ir.OpKind]>([
  [ir.OpKind.ElementEnd, [ir.OpKind.ElementStart, ir.OpKind.Element]],
  [ir.OpKind.ContainerEnd, [ir.OpKind.ContainerStart, ir.OpKind.Container]],
  [ir.OpKind.I18nEnd, [ir.OpKind.I18nStart, ir.OpKind.I18n]],
]);

/**
 * Op kinds that should not prevent merging of start/end ops.
 */
const IGNORED_OP_KINDS = new Set([ir.OpKind.Pipe]);

/**
 * Replace sequences of mergable instructions (e.g. `ElementStart` and `ElementEnd`) with a
 * consolidated instruction (e.g. `Element`).
 */
export function collapseEmptyInstructions(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      // Find end ops that may be able to be merged.
      const opReplacements = REPLACEMENTS.get(op.kind);
      if (opReplacements === undefined) {
        continue;
      }
      const [startKind, mergedKind] = opReplacements;

      // Locate the previous (non-ignored) op.
      let prevOp: ir.CreateOp | null = op.prev;
      while (prevOp !== null && IGNORED_OP_KINDS.has(prevOp.kind)) {
        prevOp = prevOp.prev;
      }

      // If the previous op is the corresponding start op, we can megre.
      if (prevOp !== null && prevOp.kind === startKind) {
        // Transmute the start instruction to the merged version. This is safe as they're designed
        // to be identical apart from the `kind`.
        (prevOp as ir.Op<ir.CreateOp>).kind = mergedKind;

        // Remove the end instruction.
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }
}
