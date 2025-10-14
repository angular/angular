/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
import * as o from '../../../../output/output_ast';
import {CompilationJobKind} from '../compilation';
/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(elements, xref) {
  const el = elements.get(xref);
  if (el === undefined) {
    throw new Error('All attributes should have an element-like target.');
  }
  return el;
}
export function convertAnimations(job) {
  const elements = new Map();
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
          ir.OpList.insertAfter(createAnimationOp, lookupElement(elements, op.target));
        }
        ir.OpList.remove(op);
      }
    }
  }
}
function getAnimationOp(op) {
  if (op.animationBindingKind === 0 /* ir.AnimationBindingKind.STRING */) {
    // this is a simple string case
    return ir.createAnimationStringOp(
      op.name,
      op.target,
      op.name === 'animate.enter'
        ? 'enter' /* ir.AnimationKind.ENTER */
        : 'leave' /* ir.AnimationKind.LEAVE */,
      op.expression,
      op.securityContext,
      op.sourceSpan,
    );
  } else {
    const expression = op.expression;
    return ir.createAnimationOp(
      op.name,
      op.target,
      op.name === 'animate.enter'
        ? 'enter' /* ir.AnimationKind.ENTER */
        : 'leave' /* ir.AnimationKind.LEAVE */,
      [ir.createStatementOp(new o.ReturnStatement(expression, expression.sourceSpan))],
      op.securityContext,
      op.sourceSpan,
    );
  }
}
//# sourceMappingURL=convert_animations.js.map
