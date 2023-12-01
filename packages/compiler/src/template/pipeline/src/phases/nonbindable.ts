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
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(
    elements: Map<ir.XrefId, ir.ElementOrContainerOp>, xref: ir.XrefId): ir.ElementOrContainerOp {
  const el = elements.get(xref);
  if (el === undefined) {
    throw new Error('All attributes should have an element-like target.');
  }
  return el;
}

/**
 * When a container is marked with `ngNonBindable`, the non-bindable characteristic also applies to
 * all descendants of that container. Therefore, we must emit `disableBindings` and `enableBindings`
 * instructions for every such container.
 */
export function disableBindings(job: CompilationJob): void {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOp>();
  for (const view of job.units) {
    for (const op of view.create) {
      if (!(op instanceof ir.ElementOrContainerOp)) {
        continue;
      }
      elements.set(op.xref, op);
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      if ((op instanceof ir.ElementStartOp || op instanceof ir.ContainerStartOp) &&
          op.nonBindable) {
        ir.OpList.insertAfter<ir.CreateOp>(new ir.DisableBindingsOp(op.xref), op);
      }
      if ((op instanceof ir.ElementEndOp || op instanceof ir.ContainerEndOp) &&
          lookupElement(elements, op.xref).nonBindable) {
        ir.OpList.insertBefore<ir.CreateOp>(new ir.EnableBindingsOp(op.xref), op);
      }
    }
  }
}
