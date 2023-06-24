/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {ComponentCompilation} from '../compilation';

/**
 * Lifts local reference declarations on element-like structures within each view into an entry in
 * the `consts` array for the whole component.
 */
export function phaseLocalRefs(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    for (const op of view.create) {
      switch (op.kind) {
        case ir.OpKind.ElementStart:
        case ir.OpKind.Element:
        case ir.OpKind.Template:
          if (!Array.isArray(op.localRefs)) {
            throw new Error(`AssertionError: expected localRefs to be an array still`);
          }
          op.numSlotsUsed += op.localRefs.length;

          if (op.localRefs.length > 0) {
            const localRefs = serializeLocalRefs(op.localRefs);
            op.localRefs = cpl.addConst(localRefs);
          } else {
            op.localRefs = null;
          }
          break;
      }
    }
  }
}

function serializeLocalRefs(refs: ir.LocalRef[]): o.Expression {
  const constRefs: o.Expression[] = [];
  for (const ref of refs) {
    constRefs.push(o.literal(ref.name), o.literal(ref.target));
  }
  return o.literalArr(constRefs);
}
