/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

const CONTAINER_TAG = 'ng-container';

/**
 * Replace an `Element` or `ElementStart` whose tag is `ng-container` with a specific op.
 */
export function generateNgContainerOps(job: CompilationJob): void {
  for (const unit of job.units) {
    const updatedElementXrefs = new Set<ir.XrefId>();
    for (const op of unit.create) {
      if (op instanceof ir.ElementStartOp && op.tag === CONTAINER_TAG) {
        ir.OpList.replace<ir.CreateOp>(
            op,
            new ir.ContainerStartOp(
                op.xref, op.handle, op.attributes, op.localRefs, op.nonBindable, op.sourceSpan));
        updatedElementXrefs.add(op.xref);
      }

      if (op instanceof ir.ElementEndOp && updatedElementXrefs.has(op.xref)) {
        // This `ElementEnd` is associated with an `ElementStart` we already transmuted.
        ir.OpList.replace<ir.CreateOp>(op, new ir.ContainerEndOp(op.xref, op.sourceSpan!));
      }
    }
  }
}
