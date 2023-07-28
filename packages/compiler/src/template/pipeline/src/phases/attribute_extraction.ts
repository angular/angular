/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import {parse as parseStyle} from '../../../../render3/view/style_parser';
import * as ir from '../../ir';
import {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Find all attribute and binding ops, and collect them into the ElementAttribute structures.
 * In cases where no instruction needs to be generated for the attribute or binding, it is removed.
 */
export function phaseAttributeExtraction(cpl: ComponentCompilationJob): void {
  for (const [_, view] of cpl.views) {
    populateElementAttributes(view);
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
 * Populates the ElementAttributes map for the given view, and removes ops for any bindings that do
 * not need further processing.
 */
function populateElementAttributes(view: ViewCompilationUnit) {
  const elements = getElementsByXrefId(view);

  for (const op of view.ops()) {
    let ownerOp: ReturnType<typeof lookupElement>;
    switch (op.kind) {
      case ir.OpKind.Attribute:
        extractAttributeOp(view, op, elements);
        break;
      case ir.OpKind.Property:
        if (op.isAnimationTrigger) {
          continue;  // Don't extract animation properties.
        }

        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        ownerOp.attributes.add(
            op.isTemplate ? ir.BindingKind.Template : ir.BindingKind.Property, op.name, null);
        break;
      case ir.OpKind.StyleProp:
      case ir.OpKind.ClassProp:
        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        // Empty StyleProperty and ClassName expressions are treated differently depending on
        // compatibility mode.
        if (view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
            op.expression instanceof ir.EmptyExpr) {
          // The old compiler treated empty style bindings as regular bindings for the purpose of
          // directive matching. That behavior is incorrect, but we emulate it in compatibility
          // mode.
          ownerOp.attributes.add(ir.BindingKind.Property, op.name, null);
        }
        break;
      case ir.OpKind.Listener:
        if (op.isAnimationListener) {
          continue;  // Don't extract animation listeners.
        }
        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        ownerOp.attributes.add(ir.BindingKind.Property, op.name, null);
        break;
    }
  }
}

function isStringLiteral(expr: o.Expression): expr is o.LiteralExpr&{value: string} {
  return expr instanceof o.LiteralExpr && typeof expr.value === 'string';
}

function extractAttributeOp(
    view: ViewCompilationUnit, op: ir.AttributeOp,
    elements: Map<ir.XrefId, ir.ElementOrContainerOps>) {
  if (op.expression instanceof ir.Interpolation) {
    return;
  }
  const ownerOp = lookupElement(elements, op.target);
  ir.assertIsElementAttributes(ownerOp.attributes);

  if (op.name === 'style' && isStringLiteral(op.expression)) {
    // TemplateDefinitionBuilder did not extract style attributes that had a security context.
    if (view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
        op.securityContext !== SecurityContext.NONE) {
      return;
    }

    // Extract style attributes.
    const parsedStyles = parseStyle(op.expression.value);
    for (let i = 0; i < parsedStyles.length - 1; i += 2) {
      ownerOp.attributes.add(
          ir.BindingKind.StyleProperty, parsedStyles[i], o.literal(parsedStyles[i + 1]));
    }
    ir.OpList.remove(op as ir.UpdateOp);
  } else {
    // The old compiler only extracted string constants, so we emulate that behavior in
    // compaitiblity mode, otherwise we optimize more aggressively.
    let extractable = view.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder ?
        (op.expression instanceof o.LiteralExpr && typeof op.expression.value === 'string') :
        op.expression.isConstant();

    // We don't need to generate instructions for attributes that can be extracted as consts.
    if (extractable) {
      ownerOp.attributes.add(
          op.isTemplate ? ir.BindingKind.Template : ir.BindingKind.Attribute, op.name,
          op.expression);
      ir.OpList.remove(op as ir.UpdateOp);
    }
  }
}
