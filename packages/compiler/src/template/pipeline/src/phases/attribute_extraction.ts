/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as ir from '../../ir';
import {type CompilationJob, type CompilationUnit, CompilationJobKind} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Find all extractable attribute and binding ops, and create ExtractedAttributeOps for them.
 * In cases where no instruction needs to be generated for the attribute or binding, it is removed.
 */
export function phaseAttributeExtraction(job: CompilationJob): void {
  for (const unit of job.units) {
    const elements = getElementsByXrefId(unit);
    for (const op of unit.ops()) {
      switch (op.kind) {
        case ir.OpKind.Attribute:
          extractAttributeOp(unit, op, elements);
          break;
        case ir.OpKind.Property:
        case ir.OpKind.PropertyCreate:
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
          if (unit.job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
              op.expression instanceof ir.EmptyExpr) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, op.name, null),
                lookupElement(elements, op.target));
          }
          break;
        case ir.OpKind.Listener:
          if (!op.isAnimationListener) {
            const extractedAttributeOp =
                ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, op.name, null);
            if (job.kind === CompilationJobKind.Host) {
              // This attribute will apply to the enclosing host binding compilation unit, so order
              // doesn't matter.
              unit.create.push(extractedAttributeOp);
            } else {
              ir.OpList.insertBefore<ir.CreateOp>(
                  extractedAttributeOp, lookupElement(elements, op.target));
            }
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
    unit: CompilationUnit, op: ir.AttributeOp, elements: Map<ir.XrefId, ir.ElementOrContainerOps>) {
  if (op.expression instanceof ir.Interpolation) {
    return;
  }

  let extractable = op.expression.isConstant();
  if (unit.job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
    // TemplateDefinitionBuilder only extracted attributes that were string literals.
    extractable = ir.isStringLiteral(op.expression);
    if (op.name === 'style' || op.name === 'class') {
      // For style and class attributes, TemplateDefinitionBuilder only extracted them if they were
      // text attributes. For example, `[attr.class]="'my-class'"` was not extracted despite being a
      // string literal, because it is not a text attribute.
      extractable &&= op.isTextAttribute;
    }
    if (unit.job.kind === CompilationJobKind.Host) {
      // TemplateDefinitionBuilder also does not seem to extract string literals if they are part of
      // a host attribute.
      extractable &&= op.isTextAttribute;
    }
  }

  if (extractable) {
    const extractedAttributeOp = ir.createExtractedAttributeOp(
        op.target, op.isTemplate ? ir.BindingKind.Template : ir.BindingKind.Attribute, op.name,
        op.expression);
    if (unit.job.kind === CompilationJobKind.Host) {
      // This attribute will apply to the enclosing host binding compilation unit, so order doesn't
      // matter.
      unit.create.push(extractedAttributeOp);
    } else {
      const ownerOp = lookupElement(elements, op.target);
      ir.OpList.insertBefore<ir.CreateOp>(extractedAttributeOp, ownerOp);
    }
    ir.OpList.remove<ir.UpdateOp>(op);
  }
}
