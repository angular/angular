/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import {Identifiers as R3} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import {ComponentCompilation, ViewCompilation} from '../compilation';

/**
 * Find all RegisterAttribute ops, and collect them into the ElementAttribute structures.
 */
export function phaseAttributeExtraction(cpl: ComponentCompilation, compatibility: boolean): void {
  for (const [_, view] of cpl.views) {
    populateElementAttributes(view, compatibility);
  }
}

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
        ownerOp = elements.get(op.target);
        if (ownerOp === undefined) {
          throw new Error('All attributes should have an element-like target.');
        }
        ir.assertIsElementAttributes(ownerOp.attributes);

        let extractable = compatibility ?
            (op.value instanceof o.LiteralExpr && typeof op.value.value === 'string') :
            (op.value.isConstant());

        if (extractable) {
          // literal string attribute
          ownerOp.attributes.add(op.attributeKind, op.name, op.value);
          ir.OpList.remove(op as ir.UpdateOp);
        }
        break;
      case ir.OpKind.Property:
      case ir.OpKind.InterpolateProperty:
      case ir.OpKind.Listener:
        ownerOp = elements.get(op.target);
        if (ownerOp === undefined) {
          throw new Error('All attributes should have an element-like target.');
        }
        ir.assertIsElementAttributes(ownerOp.attributes);

        const kind =
            op.kind !== ir.OpKind.Listener ? op.bindingKind : ir.ElementAttributeKind.Binding;
        ownerOp.attributes.add(kind, op.name, null);
        break;
    }
  }
}
