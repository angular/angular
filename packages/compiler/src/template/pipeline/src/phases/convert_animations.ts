/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import * as o from '../../../../output/output_ast';
import {CompilationJob, CompilationJobKind} from '../compilation';

/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(
  elements: Map<ir.XrefId, ir.ElementOrContainerOps>,
  xref: ir.XrefId,
): ir.ElementOrContainerOps {
  const el = elements.get(xref);
  if (el === undefined) {
    throw new Error('All attributes should have an element-like target.');
  }
  return el;
}

export function convertAnimations(job: CompilationJob): void {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
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
      if (op.kind === ir.OpKind.AnimationBinding) {
        const createAnimationOp = getAnimationOp(op);
        if (job.kind === CompilationJobKind.Host) {
          unit.create.push(createAnimationOp);
        } else {
          ir.OpList.insertAfter<ir.CreateOp>(createAnimationOp, lookupElement(elements, op.target));
        }
        ir.OpList.remove<ir.UpdateOp>(op);
      }
    }
  }
}

function getAnimationOp(op: ir.AnimationBindingOp): ir.AnimationOp | ir.AnimationStringOp {
  if (op.animationBindingKind === ir.AnimationBindingKind.STRING) {
    // this is a simple string case
    return ir.createAnimationStringOp(
      op.name,
      op.target,
      op.name === 'animate.enter' ? ir.AnimationKind.ENTER : ir.AnimationKind.LEAVE,
      op.expression,
      op.securityContext,
      op.sourceSpan,
    );
  } else {
    const expression = op.expression as ir.Expression;
    return ir.createAnimationOp(
      op.name,
      op.target,
      op.name === 'animate.enter' ? ir.AnimationKind.ENTER : ir.AnimationKind.LEAVE,
      [ir.createStatementOp(new o.ReturnStatement(expression, expression.sourceSpan))],
      op.securityContext,
      op.sourceSpan,
    );
  }
}
