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
 * Replace sequences of `ElementStart` followed by `ElementEnd` with a condensed `Element`
 * instruction.
 */
export function phaseEmptyElements(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind === ir.OpKind.ElementEnd && op.prev !== null &&
          op.prev.kind === ir.OpKind.ElementStart) {
        // Transmute the `ElementStart` instruction to `Element`. This is safe as they're designed
        // to be identical apart from the `kind`.
        (op.prev as unknown as ir.ElementOp).kind = ir.OpKind.Element;

        // Remove the `ElementEnd` instruction.
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }
}
