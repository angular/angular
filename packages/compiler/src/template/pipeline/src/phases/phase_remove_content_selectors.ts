/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Attributes of `ng-content` named 'select' are specifically removed, because they control which
 * content matches as a property of the `projection`, and are not a plain attribute.
 */
export function phaseRemoveContentSelectors(job: CompilationJob): void {
  for (const unit of job.units) {
    const elements = getElementsByXrefId(unit);
    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.Binding:
          const target = lookupElement(elements, op.target);
          if (op.name.toLowerCase() === 'select' && target.kind === ir.OpKind.Projection) {
            ir.OpList.remove<ir.UpdateOp>(op);
          }
          continue;
      }
    }
  }
}

/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(
    elements: Map<ir.XrefId, ir.ElementOrContainerOps>, xref: ir.XrefId): ir.ElementOrContainerOps {
  const el = elements.get(xref);
  if (el === undefined) {
    throw new Error('All attributes should have an element-like target.');
  }
  return el;
}
