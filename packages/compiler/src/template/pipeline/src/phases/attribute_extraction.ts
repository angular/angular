/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilation, ViewCompilation} from '../compilation';

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
 * Find all attribute and binding ops, and collect them into the ElementAttribute structures.
 * In cases where no instruction needs to be generated for the attribute or binding, it is removed.
 */
export function phaseAttributeExtraction(cpl: ComponentCompilation, compatibility: boolean): void {
  for (const [_, view] of cpl.views) {
    populateElementAttributes(view, compatibility);
  }
}

/**
 * Populates the ElementAttributes map for the given view, and removes ops for any bindings that do
 * not need further processing.
 */
function populateElementAttributes(view: ViewCompilation, compatibility: boolean) {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
  for (const op of view.create) {
    if (!ir.isElementOrContainerOp(op)) {
      continue;
    }
    elements.set(op.xref, op);
  }

  for (const op of view.ops()) {
    let ownerOp: ir.ElementOrContainerOps|undefined;
    switch (op.kind) {
      case ir.OpKind.Attribute:
        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        let extractable = compatibility ?
            (op.value instanceof o.LiteralExpr && typeof op.value.value === 'string') :
            (op.value.isConstant());

        // We don't need to generate instructions for attributes that can be extracted as consts.
        if (extractable) {
          ownerOp.attributes.add(op.attributeKind, op.name, op.value);
          ir.OpList.remove(op as ir.UpdateOp);
        }
        break;

      case ir.OpKind.Property:
      case ir.OpKind.InterpolateProperty:
        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        ownerOp.attributes.add(op.bindingKind, op.name, null);
        break;

      case ir.OpKind.Listener:
        ownerOp = lookupElement(elements, op.target);
        ir.assertIsElementAttributes(ownerOp.attributes);

        ownerOp.attributes.add(ir.ElementAttributeKind.Binding, op.name, null);

        // We don't need to generate instructions for listeners on templates.
        if (ownerOp.kind === ir.OpKind.Template) {
          ir.OpList.remove(op as ir.CreateOp);
        }
        break;
    }
  }
}
