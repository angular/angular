/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(elements, xref) {
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
export function disableBindings(job) {
  const elements = new Map();
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
        ir.OpList.insertAfter(ir.createDisableBindingsOp(op.xref), op);
      }
      if (
        (op.kind === ir.OpKind.ElementEnd || op.kind === ir.OpKind.ContainerEnd) &&
        lookupElement(elements, op.xref).nonBindable
      ) {
        ir.OpList.insertBefore(ir.createEnableBindingsOp(op.xref), op);
      }
    }
  }
}
//# sourceMappingURL=nonbindable.js.map
