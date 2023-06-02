/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

function kindTest(kind: ir.OpKind): (op: ir.UpdateOp) => boolean {
  return (op: ir.UpdateOp) => op.kind === kind;
}

interface Rule<T extends ir.CreateOp|ir.UpdateOp> {
  test: (op: T) => boolean;
  transform?: (ops: Array<T>) => Array<T>;
}

/**
 * Defines the groups based on `OpKind` that ops will be divided into, for the various create
 * binding kinds. Ops will be collected into groups, then optionally transformed, before recombining
 * the groups in the order defined here.
 */
const CREATE_ORDERING: Array<Rule<ir.CreateOp>> = [
  {test: op => op.kind === ir.OpKind.Listener && op.hostListener && op.isAnimationListener},
  {test: op => op.kind === ir.OpKind.Listener && !(op.hostListener && op.isAnimationListener)},

  // TODO(signals): Think about ordering for instructions in the create block!
  // Right now, not relevant as we only have a single property create instruction.
];

/**
 * As above, but for update ops.
 */
const UPDATE_ORDERING: Array<Rule<ir.UpdateOp>> = [
  {test: op => op.kind === ir.OpKind.HostProperty && op.expression instanceof ir.Interpolation},
  {test: op => op.kind === ir.OpKind.HostProperty && !(op.expression instanceof ir.Interpolation)},
  {test: kindTest(ir.OpKind.StyleMap), transform: keepLast},
  {test: kindTest(ir.OpKind.ClassMap), transform: keepLast},
  {test: kindTest(ir.OpKind.StyleProp)},
  {test: kindTest(ir.OpKind.ClassProp)},
  {test: op => op.kind === ir.OpKind.Property && op.expression instanceof ir.Interpolation},
  {test: op => op.kind === ir.OpKind.Property && !(op.expression instanceof ir.Interpolation)},
  {test: kindTest(ir.OpKind.Attribute)},
];

/**
 * The set of all op kinds we handle in the reordering phase.
 */
const handledOpKinds = new Set([
  ir.OpKind.Listener,
  ir.OpKind.StyleMap,
  ir.OpKind.ClassMap,
  ir.OpKind.StyleProp,
  ir.OpKind.ClassProp,
  ir.OpKind.Property,
  ir.OpKind.HostProperty,
  ir.OpKind.Attribute,
]);

export function phaseOrdering(job: CompilationJob) {
  for (const unit of job.units) {
    // First, we pull out ops that need to be ordered. Then, when we encounter an op that shouldn't
    // be reordered, put the ones we've pulled so far back in the correct order. Finally, if we
    // still have ops pulled at the end, put them back in the correct order.

    // Create mode:
    let opsToOrder = [];
    for (const op of unit.create) {
      if (handledOpKinds.has(op.kind)) {
        opsToOrder.push(op);
        ir.OpList.remove(op);
      } else {
        ir.OpList.insertBefore(reorder(opsToOrder, CREATE_ORDERING), op);
        opsToOrder = [];
      }
    }
    unit.create.push(reorder(opsToOrder, CREATE_ORDERING));


    // Update mode:
    opsToOrder = [];
    for (const op of unit.update) {
      if (handledOpKinds.has(op.kind)) {
        opsToOrder.push(op);
        ir.OpList.remove(op);
      } else {
        ir.OpList.insertBefore(reorder(opsToOrder, UPDATE_ORDERING), op);
        opsToOrder = [];
      }
    }
    unit.update.push(reorder(opsToOrder, UPDATE_ORDERING));
  }
}

/**
 * Reorders the given list of ops according to the ordering defined by `ORDERING`.
 */
function reorder<T extends ir.CreateOp|ir.UpdateOp>(
    ops: Array<T>, ordering: Array<Rule<T>>): Array<T> {
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
