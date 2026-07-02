/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * Locates all of the elements defined in a creation block and outputs an op
 * that will expose their definition location in the DOM.
 */
export function attachSourceLocations(job: ComponentCompilationJob): void {
  if (!job.enableDebugLocations || job.relativeTemplatePath === null) {
    return;
  }

  for (const unit of job.units) {
    const locations: ir.ElementSourceLocation[] = [];

    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ElementStart || op.kind === ir.OpKind.Element) {
        const start = op.startSourceSpan.start;
        locations.push({
          targetSlot: op.handle,
          offset: start.offset,
          line: start.line,
          column: start.col,
        });
      }
    }

    if (locations.length > 0) {
      unit.create.push(ir.createSourceLocationOp(job.relativeTemplatePath, locations));
    }
  }
}
