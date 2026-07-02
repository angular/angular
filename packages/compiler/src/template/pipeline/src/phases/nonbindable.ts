/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(
  elements: Map<ir.XrefId, ir.ElementOrContainerOps>,
  xref: ir.XrefId,
): ir.ElementOrContainerOps {
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
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
  for (const view of job.units) {
    for (const op of view.create) {
      if (!ir.isElementOrContainerOp(op)) {
        continue;
      }
      elements.set(op.xref, op);
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (
        (op.kind === ir.OpKind.ElementStart || op.kind === ir.OpKind.ContainerStart) &&
        op.nonBindable
      ) {
        ir.OpList.insertAfter<ir.CreateOp>(ir.createDisableBindingsOp(op.xref), op);
      }
      if (
        (op.kind === ir.OpKind.ElementEnd || op.kind === ir.OpKind.ContainerEnd) &&
        lookupElement(elements, op.xref).nonBindable
      ) {
        ir.OpList.insertBefore<ir.CreateOp>(ir.createEnableBindingsOp(op.xref), op);
      }
    }
  }
}
