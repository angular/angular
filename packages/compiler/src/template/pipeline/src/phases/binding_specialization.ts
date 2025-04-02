/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {splitNsName} from '../../../../ml_parser/tags';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob, CompilationJobKind} from '../compilation';

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

export function specializeBindings(job: CompilationJob): void {
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
            const [namespace, name] = splitNsName(op.name);
            ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createAttributeOp(
                op.target,
                namespace,
                name,
                op.expression,
                op.securityContext,
                op.isTextAttribute,
                op.isStructuralTemplateAttribute,
                op.templateKind,
                op.i18nMessage,
                op.sourceSpan,
              ),
            );
          }
          break;
        case ir.BindingKind.Property:
        case ir.BindingKind.Animation:
          if (job.kind === CompilationJobKind.Host) {
            ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createDomPropertyOp(
                op.name,
                op.expression,
                op.bindingKind === ir.BindingKind.Animation,
                op.i18nContext,
                op.securityContext,
                op.sourceSpan,
              ),
            );
          } else {
            ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createPropertyOp(
                op.target,
                op.name,
                op.expression,
                op.bindingKind === ir.BindingKind.Animation,
                op.securityContext,
                op.isStructuralTemplateAttribute,
                op.templateKind,
                op.i18nContext,
                op.i18nMessage,
                op.sourceSpan,
              ),
            );
          }

          break;
        case ir.BindingKind.TwoWayProperty:
          if (!(op.expression instanceof o.Expression)) {
            // We shouldn't be able to hit this code path since interpolations in two-way bindings
            // result in a parser error. We assert here so that downstream we can assume that
            // the value is always an expression.
            throw new Error(
              `Expected value of two-way property binding "${op.name}" to be an expression`,
            );
          }

          ir.OpList.replace<ir.UpdateOp>(
            op,
            ir.createTwoWayPropertyOp(
              op.target,
              op.name,
              op.expression,
              op.securityContext,
              op.isStructuralTemplateAttribute,
              op.templateKind,
              op.i18nContext,
              op.i18nMessage,
              op.sourceSpan,
            ),
          );
          break;
        case ir.BindingKind.I18n:
        case ir.BindingKind.ClassName:
        case ir.BindingKind.StyleProperty:
          throw new Error(`Unhandled binding of kind ${ir.BindingKind[op.bindingKind]}`);
      }
    }
  }
}
