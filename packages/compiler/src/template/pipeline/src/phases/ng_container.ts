/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

const CONTAINER_TAG = 'ng-container';

/**
 * Replace an `Element` or `ElementStart` whose tag is `ng-container` with a specific op.
 */
export function phaseNgContainer(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    const updatedElementXrefs = new Set<ir.XrefId>();
    for (const op of view.create) {
      if (op.kind === ir.OpKind.ElementStart && op.tag === CONTAINER_TAG) {
        // Transmute the `ElementStart` instruction to `ContainerStart`.
        (op as ir.Op<ir.CreateOp>).kind = ir.OpKind.ContainerStart;
        updatedElementXrefs.add(op.xref);
      }

      if (op.kind === ir.OpKind.ElementEnd && updatedElementXrefs.has(op.xref)) {
        // This `ElementEnd` is associated with an `ElementStart` we already transmuted.
        (op as ir.Op<ir.CreateOp>).kind = ir.OpKind.ContainerEnd;
      }
    }
  }
}
