/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {ComponentCompilationJob} from '../compilation';

/**
 * Lifts local reference declarations on element-like structures within each view into an entry in
 * the `consts` array for the whole component.
 */
export function liftLocalRefs(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.ElementStart:
        case ir.OpKind.ConditionalCreate:
        case ir.OpKind.ConditionalBranchCreate:
        case ir.OpKind.Template:
          if (!Array.isArray(op.localRefs)) {
            throw new Error(`AssertionError: expected localRefs to be an array still`);
          }
          op.numSlotsUsed += op.localRefs.length;

          if (op.localRefs.length > 0) {
            const localRefs = serializeLocalRefs(op.localRefs);
            op.localRefs = job.addConst(localRefs);
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
