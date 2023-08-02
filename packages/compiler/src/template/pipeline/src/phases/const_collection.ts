/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ElementAttributes} from '../../ir/src/element';
import {ComponentCompilationJob} from '../compilation';

/**
 * Converts the semantic attributes of element-like operations (elements, templates) into constant
 * array expressions, and lifts them into the overall component `consts`.
 */
export function phaseConstCollection(cpl: ComponentCompilationJob): void {
  // Collect all extracted attributes.
  const elementAttributes = new Map<ir.XrefId, ElementAttributes>();
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute) {
        const attributes = elementAttributes.get(op.target) || new ElementAttributes();
        elementAttributes.set(op.target, attributes);
        attributes.add(op.bindingKind, op.name, op.expression);
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }

  // Serialize the extracted attributes into the const array.
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind === ir.OpKind.Element || op.kind === ir.OpKind.ElementStart ||
          op.kind === ir.OpKind.Template) {
        const attributes = elementAttributes.get(op.xref);
        if (attributes !== undefined) {
          const attrArray = serializeAttributes(attributes);
          if (attrArray.entries.length > 0) {
            op.attributes = cpl.addConst(attrArray);
          }
        }
      }
    }
  }
}

function serializeAttributes({attributes, bindings, classes, i18n, projectAs, styles, template}:
                                 ElementAttributes): o.LiteralArrayExpr {
  const attrArray = [...attributes];

  if (projectAs !== null) {
    attrArray.push(o.literal(core.AttributeMarker.ProjectAs), o.literal(projectAs));
  }
  if (classes.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Classes), ...classes);
  }
  if (styles.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Styles), ...styles);
  }
  if (bindings.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Bindings), ...bindings);
  }
  if (template.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.Template), ...template);
  }
  if (i18n.length > 0) {
    attrArray.push(o.literal(core.AttributeMarker.I18n), ...i18n);
  }
  return o.literalArr(attrArray);
}
