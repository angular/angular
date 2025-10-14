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
import {CompilationJobKind, TemplateCompilationMode} from '../compilation';
import {isAriaAttribute} from '../util/attributes';
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
export function specializeBindings(job) {
  const elements = new Map();
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
            ir.OpList.remove(op);
            const target = lookupElement(elements, op.target);
            target.nonBindable = true;
          } else if (op.name.startsWith('animate.')) {
            ir.OpList.replace(
              op,
              ir.createAnimationBindingOp(
                op.name,
                op.target,
                op.name === 'animate.enter'
                  ? 'enter' /* ir.AnimationKind.ENTER */
                  : 'leave' /* ir.AnimationKind.LEAVE */,
                op.expression,
                op.securityContext,
                op.sourceSpan,
                0 /* ir.AnimationBindingKind.STRING */,
              ),
            );
          } else {
            const [namespace, name] = splitNsName(op.name);
            ir.OpList.replace(
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
        case ir.BindingKind.Animation:
          ir.OpList.replace(
            op,
            ir.createAnimationBindingOp(
              op.name,
              op.target,
              op.name === 'animate.enter'
                ? 'enter' /* ir.AnimationKind.ENTER */
                : 'leave' /* ir.AnimationKind.LEAVE */,
              op.expression,
              op.securityContext,
              op.sourceSpan,
              1 /* ir.AnimationBindingKind.VALUE */,
            ),
          );
          break;
        case ir.BindingKind.Property:
        case ir.BindingKind.LegacyAnimation:
          // Convert a property binding targeting an ARIA attribute (e.g. [aria-label]) into an
          // attribute binding when we know it can't also target an input. Note that a `Host` job is
          // always `DomOnly`, so this condition must be checked first.
          if (job.mode === TemplateCompilationMode.DomOnly && isAriaAttribute(op.name)) {
            ir.OpList.replace(
              op,
              ir.createAttributeOp(
                op.target,
                /* namespace= */ null,
                op.name,
                op.expression,
                op.securityContext,
                /* isTextAttribute= */ false,
                op.isStructuralTemplateAttribute,
                op.templateKind,
                op.i18nMessage,
                op.sourceSpan,
              ),
            );
          } else if (job.kind === CompilationJobKind.Host) {
            ir.OpList.replace(
              op,
              ir.createDomPropertyOp(
                op.name,
                op.expression,
                op.bindingKind,
                op.i18nContext,
                op.securityContext,
                op.sourceSpan,
              ),
            );
          } else {
            ir.OpList.replace(
              op,
              ir.createPropertyOp(
                op.target,
                op.name,
                op.expression,
                op.bindingKind,
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
          ir.OpList.replace(
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
//# sourceMappingURL=binding_specialization.js.map
