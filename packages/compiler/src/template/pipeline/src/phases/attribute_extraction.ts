/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as ir from '../../ir';
import {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Find all extractable attribute and binding ops, and create ExtractedAttributeOps for them.
 * In cases where no instruction needs to be generated for the attribute or binding, it is removed.
 */
export function phaseAttributeExtraction(cpl: ComponentCompilationJob): void {
  for (const [_, view] of cpl.views) {
    const elements = getElementsByXrefId(view);
    for (const op of view.ops()) {
      switch (op.kind) {
        case ir.OpKind.Attribute:
          extractAttributeOp(view, op, elements);
          break;
        case ir.OpKind.Property:
          if (!op.isAnimationTrigger) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(
                    op.target, op.isTemplate ? ir.BindingKind.Template : ir.BindingKind.Property,
                    op.name, null),
                lookupElement(elements, op.target));
          }
          break;
        case ir.OpKind.StyleProp:
        case ir.OpKind.ClassProp:
          // The old compiler treated empty style bindings as regular bindings for the purpose of
          // directive matching. That behavior is incorrect, but we emulate it in compatibility
          // mode.
          if (view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
              op.expression instanceof ir.EmptyExpr) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, op.name, null),
                lookupElement(elements, op.target));
          }
          break;
        case ir.OpKind.Listener:
          if (!op.isAnimationListener) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, op.name, null),
                lookupElement(elements, op.target));
          }
          break;
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

/**
 * Extracts an attribute binding.
 */
function extractAttributeOp(
    view: ViewCompilationUnit, op: ir.AttributeOp,
    elements: Map<ir.XrefId, ir.ElementOrContainerOps>) {
  if (op.expression instanceof ir.Interpolation) {
    return;
  }
  const ownerOp = lookupElement(elements, op.target);

  let extractable = op.expression.isConstant();
  if (view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
    // TemplateDefinitionBuilder only extracted attributes that were string literals.
    extractable = ir.isStringLiteral(op.expression);
    if (op.name === 'style' || op.name === 'class') {
      // For style and class attributes, TemplateDefinitionBuilder only extracted them if they were
      // text attributes. For example, `[attr.class]="'my-class'"` was not extracted despite being a
      // string literal, because it is not a text attribute.
      extractable &&= op.isTextAttribute;
    }
  }

  if (extractable) {
    ir.OpList.insertBefore<ir.CreateOp>(
        ir.createExtractedAttributeOp(
            op.target, op.isTemplate ? ir.BindingKind.Template : ir.BindingKind.Attribute, op.name,
            op.expression),
        ownerOp);
    ir.OpList.remove<ir.UpdateOp>(op);
  }
}
