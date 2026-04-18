/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Reduces the number of temporary variable declarations emitted into compiled
 * view functions by reusing slot names across instructions whose live ranges do
 * not overlap.
 *
 * `generateTemporaryVariables` assigns a unique name per temporary per
 * instruction (e.g. `tmp_0_0`, `tmp_1_0`). This phase performs linear-scan
 * register allocation across the entire block, compacting those names to the
 * minimum set (e.g. `tmp_0`, `tmp_1`). Fewer declarations = smaller bundles.
 */
export function optimizeTemporaries(job: CompilationJob): void {
  for (const unit of job.units) {
    optimizeBlock(unit.create);
    optimizeBlock(unit.update);
    for (const fn of unit.functions) {
      optimizeBlock(fn.ops);
    }
  }
}

function optimizeBlock(ops: ir.OpList<ir.CreateOp | ir.UpdateOp>): void {
  // Pass 1: record the live range [startPos, endPos] of every temporary in
  // this block. Position is a monotonically increasing counter over the
  // left-to-right, top-to-bottom expression visit order — matching JS
  // evaluation order.
  const startPos = new Map<ir.XrefId, number>();
  const endPos = new Map<ir.XrefId, number>();
  const oldNames = new Set<string>();
  let pos = 0;

  for (const op of ops) {
    if (op.kind === ir.OpKind.Statement) {
      continue;
    }
    ir.visitExpressionsInOp(op, (expr, flags) => {
      if (flags & ir.VisitorContextFlag.InChildOperation) {
        return;
      }
      if (expr instanceof ir.AssignTemporaryExpr) {
        if (!startPos.has(expr.xref)) {
          startPos.set(expr.xref, pos);
          oldNames.add(expr.name!);
        }
        pos++;
      } else if (expr instanceof ir.ReadTemporaryExpr) {
        endPos.set(expr.xref, pos);
        pos++;
      }
    });

    // Recurse into nested op blocks — they are independent scopes and must be
    // optimized separately (same pattern as generateTemporaryVariables).
    if (
      op.kind === ir.OpKind.Listener ||
      op.kind === ir.OpKind.Animation ||
      op.kind === ir.OpKind.AnimationListener ||
      op.kind === ir.OpKind.TwoWayListener
    ) {
      optimizeBlock(op.handlerOps);
    } else if (op.kind === ir.OpKind.RepeaterCreate && op.trackByOps !== null) {
      optimizeBlock(op.trackByOps);
    }
  }

  if (startPos.size === 0) {
    return; // No temporaries in this block — nothing to do.
  }

  // Pass 2: greedy linear-scan slot allocation (Poletto–Sarkar, 1999).
  // Sort temporaries by their start position, then assign the lowest available
  // slot, releasing slots whose intervals ended before the current one starts.
  const xrefs = [...startPos.keys()].sort((a, b) => startPos.get(a)! - startPos.get(b)!);
  const freeSlots: number[] = []; // Kept sorted ascending; shift() returns lowest.
  let nextSlot = 0;
  const slotByXref = new Map<ir.XrefId, number>();
  const active: Array<{xref: ir.XrefId; end: number}> = [];

  for (const xref of xrefs) {
    const start = startPos.get(xref)!;
    // A temporary may be assigned but never read (e.g. a switch with a single
    // case, where the test is assigned for side-effects but never referenced
    // again). Treat those as live for a single point so they still get a slot
    // and are correctly renamed/declared in the output.
    const end = endPos.get(xref) ?? start;

    // Release slots for intervals that finished before this one starts.
    // active is kept sorted ascending by end, so we can stop at the first non-expired entry.
    while (active.length > 0 && active[0].end < start) {
      const {xref: expiredXref} = active.shift()!;
      const freed = slotByXref.get(expiredXref)!;
      const insertAt = freeSlots.findIndex((s) => s > freed);
      if (insertAt === -1) {
        freeSlots.push(freed);
      } else {
        freeSlots.splice(insertAt, 0, freed);
      }
    }

    const slot = freeSlots.length > 0 ? freeSlots.shift()! : nextSlot++;
    slotByXref.set(xref, slot);

    // Insert into active keeping it sorted by end position (ascending).
    const insertActiveAt = active.findIndex((a) => a.end > end);
    if (insertActiveAt === -1) {
      active.push({xref, end});
    } else {
      active.splice(insertActiveAt, 0, {xref, end});
    }
  }

  // Pass 3: rename expressions and replace DeclareVarStmt nodes.
  const newNameByXref = new Map<ir.XrefId, string>();
  for (const [xref, slot] of slotByXref) {
    newNameByXref.set(xref, `tmp_${slot}`);
  }

  // 3a: Rename every AssignTemporaryExpr and ReadTemporaryExpr in the block.
  for (const op of ops) {
    ir.visitExpressionsInOp(op, (expr, flags) => {
      if (flags & ir.VisitorContextFlag.InChildOperation) {
        return;
      }
      if (
        (expr instanceof ir.AssignTemporaryExpr || expr instanceof ir.ReadTemporaryExpr) &&
        newNameByXref.has(expr.xref)
      ) {
        expr.name = newNameByXref.get(expr.xref)!;
      }
    });
  }

  // 3b: Remove old per-instruction DeclareVarStmt nodes for temporaries.
  const toRemove: Array<ir.CreateOp | ir.UpdateOp> = [];
  for (const op of ops) {
    if (
      op.kind === ir.OpKind.Statement &&
      (op as ir.StatementOp<ir.UpdateOp>).statement instanceof o.DeclareVarStmt &&
      oldNames.has(((op as ir.StatementOp<ir.UpdateOp>).statement as o.DeclareVarStmt).name)
    ) {
      toRemove.push(op);
    }
  }
  for (const op of toRemove) {
    ir.OpList.remove(op);
  }

  // 3c: Prepend the minimal set of declarations in ascending slot order.
  const newDecls = [...new Set(newNameByXref.values())]
    .sort((a, b) => parseInt(a.slice(4), 10) - parseInt(b.slice(4), 10))
    .map((name) =>
      ir.createStatementOp<ir.CreateOp | ir.UpdateOp>(new o.DeclareVarStmt(name)),
    ) as Array<ir.CreateOp | ir.UpdateOp>;
  ops.prepend(newDecls);
}
