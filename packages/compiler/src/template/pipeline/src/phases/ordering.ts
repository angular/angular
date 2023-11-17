/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

function test(instanceTest: (op: ir.UpdateOp) => boolean, interpolation?: boolean):
    (op: ir.UpdateOp) => boolean {
  return (op: ir.UpdateOp) =>
             (instanceTest(op) &&
              (interpolation === undefined ?
                   true :
                   interpolation === (op as any).expression instanceof ir.Interpolation));
}

interface Rule<T extends ir.Op> {
  test: (op: T) => boolean;
  transform?: (ops: Array<T>) => Array<T>;
}

/**
 * Defines the groups based on `OpKind` that ops will be divided into, for the various create
 * op kinds. Ops will be collected into groups, then optionally transformed, before recombining
 * the groups in the order defined here.
 */
const CREATE_ORDERING: Array<Rule<ir.CreateOp>> = [
  {test: op => op instanceof ir.ListenerOp && op.hostListener && op.isAnimationListener},
  {test: op => op instanceof ir.ListenerOp && !(op.hostListener && op.isAnimationListener)},
];

/**
 * Defines the groups based on `OpKind` that ops will be divided into, for the various update
 * op kinds.
 */
const UPDATE_ORDERING: Array<Rule<ir.UpdateOp>> = [
  {test: test(op => op instanceof ir.HostPropertyOp, true)},
  {test: test(op => op instanceof ir.HostPropertyOp, false)},
  {test: test(op => op instanceof ir.StyleMapOp), transform: keepLast},
  {test: test(op => op instanceof ir.ClassMapOp), transform: keepLast},
  {test: test(op => op instanceof ir.StylePropOp)},
  {test: test(op => op instanceof ir.ClassPropOp)},
  {test: test(op => op instanceof ir.PropertyOp, true)},
  {test: test(op => op instanceof ir.AttributeOp, true)},
  {test: test(op => op instanceof ir.PropertyOp, false)},
  {test: test(op => op instanceof ir.AttributeOp, false)},
];

/**
 * The set of all op kinds we handle in the reordering phase.
 */
function handled(op: ir.Op) {
  return op instanceof ir.ListenerOp || op instanceof ir.StyleMapOp ||
      op instanceof ir.ClassMapOp || op instanceof ir.StylePropOp || op instanceof ir.ClassPropOp ||
      op instanceof ir.PropertyOp || op instanceof ir.HostPropertyOp ||
      op instanceof ir.AttributeOp;
}

/**
 * Many type of operations have ordering constraints that must be respected. For example, a
 * `ClassMap` instruction must be ordered after a `StyleMap` instruction, in order to have
 * predictable semantics that match TemplateDefinitionBuilder and don't break applications.
 */
export function orderOps(job: CompilationJob) {
  for (const unit of job.units) {
    // First, we pull out ops that need to be ordered. Then, when we encounter an op that shouldn't
    // be reordered, put the ones we've pulled so far back in the correct order. Finally, if we
    // still have ops pulled at the end, put them back in the correct order.

    // Create mode:
    orderWithin(unit.create, CREATE_ORDERING);


    // Update mode:
    orderWithin(unit.update, UPDATE_ORDERING);
  }
}

/**
 * Order all the ops within the specified group.
 */
function orderWithin(opList: ir.OpList<ir.Op>, ordering: Array<Rule<ir.Op>>) {
  let opsToOrder: Array<ir.Op> = [];
  // Only reorder ops that target the same xref; do not mix ops that target different xrefs.
  let firstTargetInGroup: ir.XrefId|null = null;
  for (const op of opList) {
    const currentTarget = ir.hasDependsOnSlotContextTrait(op) ? op.target : null;
    if (!handled(op) ||
        (currentTarget !== firstTargetInGroup &&
         (firstTargetInGroup !== null && currentTarget !== null))) {
      ir.OpList.insertBefore(reorder(opsToOrder, ordering), op);
      opsToOrder = [];
      firstTargetInGroup = null;
    }
    if (handled(op)) {
      opsToOrder.push(op);
      ir.OpList.remove(op);
      firstTargetInGroup = currentTarget ?? firstTargetInGroup;
    }
  }
  opList.push(reorder(opsToOrder, ordering));
}

/**
 * Reorders the given list of ops according to the ordering defined by `ORDERING`.
 */
function reorder<T extends ir.Op>(ops: Array<T>, ordering: Array<Rule<T>>): Array<T> {
  // Break the ops list into groups based on OpKind.
  const groups = Array.from(ordering, () => new Array<T>());
  for (const op of ops) {
    const groupIndex = ordering.findIndex(o => o.test(op));
    groups[groupIndex].push(op);
  }
  // Reassemble the groups into a single list, in the correct order.
  return groups.flatMap((group, i) => {
    const transform = ordering[i].transform;
    return transform ? transform(group) : group;
  });
}

/**
 * Keeps only the last op in a list of ops.
 */
function keepLast<T>(ops: Array<T>) {
  return ops.slice(ops.length - 1);
}
