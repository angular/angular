/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob, HostBindingCompilationJob} from '../compilation';

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

export function phaseBindingSpecialization(job: CompilationJob): void {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (!ir.isElementOrContainerOp(op)) {
        continue;
      }
      elements.set(op.xref, op);
    }
  }

  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (op.kind !== ir.OpKind.Binding) {
        continue;
      }

      switch (op.bindingKind) {
        case ir.BindingKind.Attribute:
          if (op.name === 'ngNonBindable') {
            ir.OpList.remove<ir.UpdateOp>(op);
            const target = lookupElement(elements, op.target);
            target.nonBindable = true;
          } else {
            ir.OpList.replace<ir.UpdateOp>(
                op,
                ir.createAttributeOp(
                    op.target, op.name, op.expression, op.securityContext, op.isTextAttribute,
                    op.isTemplate, op.sourceSpan));
          }
          break;
        case ir.BindingKind.Property:
        case ir.BindingKind.Animation:
          if (job instanceof HostBindingCompilationJob) {
            // TODO: host property animations
            ir.OpList.replace<ir.UpdateOp>(
                op, ir.createHostPropertyOp(op.name, op.expression, op.sourceSpan));
          } else {
            ir.OpList.replace<ir.UpdateOp>(
                op,
                ir.createPropertyOp(
                    op.target, op.name, op.expression, op.bindingKind === ir.BindingKind.Animation,
                    op.securityContext, op.isTemplate, op.sourceSpan));
          }

          break;
        case ir.BindingKind.I18n:
        case ir.BindingKind.ClassName:
        case ir.BindingKind.StyleProperty:
          throw new Error(`Unhandled binding of kind ${ir.BindingKind[op.bindingKind]}`);
      }
    }
  }
}
