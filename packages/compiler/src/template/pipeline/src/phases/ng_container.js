/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
const CONTAINER_TAG = 'ng-container';
/**
 * Replace an `Element` or `ElementStart` whose tag is `ng-container` with a specific op.
 */
export function generateNgContainerOps(job) {
  for (const unit of job.units) {
    const updatedElementXrefs = new Set();
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ElementStart && op.tag === CONTAINER_TAG) {
        // Transmute the `ElementStart` instruction to `ContainerStart`.
        op.kind = ir.OpKind.ContainerStart;
        updatedElementXrefs.add(op.xref);
      }
      if (op.kind === ir.OpKind.ElementEnd && updatedElementXrefs.has(op.xref)) {
        // This `ElementEnd` is associated with an `ElementStart` we already transmuted.
        op.kind = ir.OpKind.ContainerEnd;
      }
    }
  }
}
//# sourceMappingURL=ng_container.js.map
