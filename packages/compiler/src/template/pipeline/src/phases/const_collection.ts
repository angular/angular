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
import {ComponentCompilation} from '../compilation';

/**
 * Converts the semantic attributes of element-like operations (elements, templates) into constant
 * array expressions, and lifts them into the overall component `consts`.
 */
export function phaseConstCollection(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind !== ir.OpKind.ElementStart && op.kind !== ir.OpKind.Element &&
          op.kind !== ir.OpKind.Template) {
        continue;
      } else if (!(op.attributes instanceof ElementAttributes)) {
        continue;
      }

      const attrArray = serializeAttributes(op.attributes);
      if (attrArray.entries.length > 0) {
        op.attributes = cpl.addConst(attrArray);
      } else {
        op.attributes = null;
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
