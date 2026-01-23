/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob, CompilationUnit} from '../compilation';

/**
 * This phase generates pipe creation instructions. We do this based on the pipe bindings found in
 * the update block, in the order we see them.
 *
 * When not in compatibility mode, we can simply group all these creation instructions together, to
 * maximize chaining opportunities.
 */
export function createPipes(job: CompilationJob): void {
  for (const unit of job.units) {
    processPipeBindingsInView(unit);
  }
}

function processPipeBindingsInView(unit: CompilationUnit): void {
  for (const updateOp of unit.update) {
    ir.visitExpressionsInOp(updateOp, (expr, flags) => {
      if (!ir.isIrExpression(expr)) {
        return;
      }

      if (expr.kind !== ir.ExpressionKind.PipeBinding) {
        return;
      }

      if (flags & ir.VisitorContextFlag.InChildOperation) {
        throw new Error(`AssertionError: pipe bindings should not appear in child expressions`);
      }

      if (unit.job.compatibility) {
        // TODO: We can delete this cast and check once compatibility mode is removed.
        const slotHandle = (updateOp as any).target;
        if (slotHandle == undefined) {
          throw new Error(`AssertionError: expected slot handle to be assigned for pipe creation`);
        }
        addPipeToCreationBlock(unit, (updateOp as any).target, expr);
      } else {
        // When not in compatibility mode, we just add the pipe to the end of the create block. This
        // is not only simpler and faster, but allows more chaining opportunities for other
        // instructions.
        unit.create.push(ir.createPipeOp(expr.target, expr.targetSlot, expr.name));
      }
    });
  }
}

function addPipeToCreationBlock(
  unit: CompilationUnit,
  afterTargetXref: ir.XrefId,
  binding: ir.PipeBindingExpr,
): void {
  // Find the appropriate point to insert the Pipe creation operation.
  // We're looking for `afterTargetXref` (and also want to insert after any other pipe operations
  // which might be beyond it).
  for (let op = unit.create.head.next!; op.kind !== ir.OpKind.ListEnd; op = op.next!) {
    if (!ir.hasConsumesSlotTrait<ir.CreateOp>(op)) {
      continue;
    }

    if (op.xref !== afterTargetXref) {
      continue;
    }

    // We've found a tentative insertion point; however, we also want to skip past any _other_ pipe
    // operations present.
    while (op.next!.kind === ir.OpKind.Pipe) {
      op = op.next!;
    }

    const pipe = ir.createPipeOp(binding.target, binding.targetSlot, binding.name) as ir.CreateOp;
    ir.OpList.insertBefore(pipe, op.next!);

    // This completes adding the pipe to the creation block.
    return;
  }

  // At this point, we've failed to add the pipe to the creation block.
  throw new Error(`AssertionError: unable to find insertion point for pipe ${binding.name}`);
}
