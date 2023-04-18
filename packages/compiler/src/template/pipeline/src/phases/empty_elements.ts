/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

const REPLACEMENTS = new Map<ir.OpKind, [ir.OpKind, ir.OpKind]>([
  [ir.OpKind.ElementEnd, [ir.OpKind.ElementStart, ir.OpKind.Element]],
  [ir.OpKind.ContainerEnd, [ir.OpKind.ContainerStart, ir.OpKind.Container]],
]);

/**
 * Replace sequences of mergable elements (e.g. `ElementStart` and `ElementEnd`) with a consolidated
 * element (e.g. `Element`).
 */
export function phaseEmptyElements(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      const opReplacements = REPLACEMENTS.get(op.kind);
      if (opReplacements === undefined) {
        continue;
      }
      const [startKind, mergedKind] = opReplacements;
      if (op.prev !== null && op.prev.kind === startKind) {
        // Transmute the start instruction to the merged version. This is safe as they're designed
        // to be identical apart from the `kind`.
        (op.prev as ir.Op<ir.CreateOp>).kind = mergedKind;

        // Remove the end instruction.
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }
}
