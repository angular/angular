/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJobKind, type CompilationJob} from '../compilation';

function kindTest(kind: ir.OpKind): (op: ir.UpdateOp) => boolean {
  return (op: ir.UpdateOp) => op.kind === kind;
}

function kindWithInterpolationTest(
  kind: ir.OpKind.Attribute | ir.OpKind.Property | ir.OpKind.DomProperty,
  interpolation: boolean,
): (op: ir.UpdateOp) => boolean {
  return (op: ir.UpdateOp) => {
    return op.kind === kind && interpolation === op.expression instanceof ir.Interpolation;
  };
}

function basicListenerKindTest(op: ir.CreateOp): boolean {
  return (
    (op.kind === ir.OpKind.Listener && !(op.hostListener && op.isAnimationListener)) ||
    op.kind === ir.OpKind.TwoWayListener
  );
}

function nonInterpolationPropertyKindTest(op: ir.UpdateOp): boolean {
  return (
    (op.kind === ir.OpKind.Property || op.kind === ir.OpKind.TwoWayProperty) &&
    !(op.expression instanceof ir.Interpolation)
  );
}

interface Rule<T extends ir.CreateOp | ir.UpdateOp> {
  test: (op: T) => boolean;
  transform?: (ops: Array<T>) => Array<T>;
}

/**
 * Defines the groups based on `OpKind` that ops will be divided into, for the various create
 * op kinds. Ops will be collected into groups, then optionally transformed, before recombining
 * the groups in the order defined here.
 */
const CREATE_ORDERING: Array<Rule<ir.CreateOp>> = [
  {test: (op) => op.kind === ir.OpKind.Listener && op.hostListener && op.isAnimationListener},
  {test: basicListenerKindTest},
];

/**
 * Defines the groups based on `OpKind` that ops will be divided into, for the various update
 * op kinds.
 */
const UPDATE_ORDERING: Array<Rule<ir.UpdateOp>> = [
  {test: kindTest(ir.OpKind.StyleMap), transform: keepLast},
  {test: kindTest(ir.OpKind.ClassMap), transform: keepLast},
  {test: kindTest(ir.OpKind.StyleProp)},
  {test: kindTest(ir.OpKind.ClassProp)},
  {test: kindWithInterpolationTest(ir.OpKind.Attribute, true)},
  {test: kindWithInterpolationTest(ir.OpKind.Property, true)},
  {test: nonInterpolationPropertyKindTest},
  {test: kindWithInterpolationTest(ir.OpKind.Attribute, false)},
];

/**
 * Host bindings have their own update ordering.
 */
const UPDATE_HOST_ORDERING: Array<Rule<ir.UpdateOp>> = [
  {test: kindWithInterpolationTest(ir.OpKind.DomProperty, true)},
  {test: kindWithInterpolationTest(ir.OpKind.DomProperty, false)},
  {test: kindTest(ir.OpKind.Attribute)},
  {test: kindTest(ir.OpKind.StyleMap), transform: keepLast},
  {test: kindTest(ir.OpKind.ClassMap), transform: keepLast},
  {test: kindTest(ir.OpKind.StyleProp)},
  {test: kindTest(ir.OpKind.ClassProp)},
];

/**
 * The set of all op kinds we handle in the reordering phase.
 */
const handledOpKinds = new Set([
  ir.OpKind.Listener,
  ir.OpKind.TwoWayListener,
  ir.OpKind.StyleMap,
  ir.OpKind.ClassMap,
  ir.OpKind.StyleProp,
  ir.OpKind.ClassProp,
  ir.OpKind.Property,
  ir.OpKind.TwoWayProperty,
  ir.OpKind.DomProperty,
  ir.OpKind.Attribute,
]);

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
    orderWithin(unit.create, CREATE_ORDERING as Array<Rule<ir.CreateOp | ir.UpdateOp>>);

    // Update mode:
    const ordering =
      unit.job.kind === CompilationJobKind.Host ? UPDATE_HOST_ORDERING : UPDATE_ORDERING;
    orderWithin(unit.update, ordering as Array<Rule<ir.CreateOp | ir.UpdateOp>>);
  }
}

/**
 * Order all the ops within the specified group.
 */
function orderWithin(
  opList: ir.OpList<ir.CreateOp | ir.UpdateOp>,
  ordering: Array<Rule<ir.CreateOp | ir.UpdateOp>>,
) {
  let opsToOrder: Array<ir.CreateOp | ir.UpdateOp> = [];
  // Only reorder ops that target the same xref; do not mix ops that target different xrefs.
  let firstTargetInGroup: ir.XrefId | null = null;
  for (const op of opList) {
    const currentTarget = ir.hasDependsOnSlotContextTrait(op) ? op.target : null;
    if (
      !handledOpKinds.has(op.kind) ||
      (currentTarget !== firstTargetInGroup &&
        firstTargetInGroup !== null &&
        currentTarget !== null)
    ) {
      ir.OpList.insertBefore(reorder(opsToOrder, ordering), op);
      opsToOrder = [];
      firstTargetInGroup = null;
    }
    if (handledOpKinds.has(op.kind)) {
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
function reorder<T extends ir.CreateOp | ir.UpdateOp>(
  ops: Array<T>,
  ordering: Array<Rule<T>>,
): Array<T> {
  // Break the ops list into groups based on OpKind.
  const groups = Array.from(ordering, () => new Array<T>());
  for (const op of ops) {
    const groupIndex = ordering.findIndex((o) => o.test(op));
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
