/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Defines the groups based on `OpKind` that ops will be divided into. Ops will be collected into
 * groups, then optionally transformed, before recombining the groups in the order defined here.
 */
const ORDERING: {
  kinds: Set<ir.OpKind>,
  transform?: (ops: Array<ir.UpdateOp|ir.CreateOp>) => Array<ir.UpdateOp|ir.CreateOp>
}[] =
    [
      {kinds: new Set([ir.OpKind.StyleMap, ir.OpKind.InterpolateStyleMap]), transform: keepLast},
      {kinds: new Set([ir.OpKind.ClassMap, ir.OpKind.InterpolateClassMap]), transform: keepLast},
      {kinds: new Set([ir.OpKind.StyleProp, ir.OpKind.InterpolateStyleProp])},
      {kinds: new Set([ir.OpKind.ClassProp])},
      {kinds: new Set([ir.OpKind.InterpolateProperty])},
      {kinds: new Set([ir.OpKind.Property])},
      {kinds: new Set([ir.OpKind.Attribute, ir.OpKind.InterpolateAttribute])},
    ];

/**
 * The set of all op kinds we handle in the reordering phase.
 */
const handledOpKinds = new Set(ORDERING.flatMap(group => [...group.kinds]));

/**
 * Reorders property and attribute ops according to the following ordering:
 * 1. styleMap & styleMapInterpolate (drops all but the last op in the group)
 * 2. classMap & classMapInterpolate (drops all but the last op in the group)
 * 3. styleProp & stylePropInterpolate (ordering preserved within group)
 * 4. classProp (ordering preserved within group)
 * 5. propertyInterpolate (ordering preserved within group)
 * 6. property (ordering preserved within group)
 * 7. attribute & attributeInterpolate (ordering preserve within group)
 */
export function phasePropertyOrdering(cpl: ComponentCompilation) {
  for (const [_, view] of cpl.views) {
    let opsToOrder = [];
    for (const op of view.update) {
      if (handledOpKinds.has(op.kind)) {
        // Pull out ops that need o be ordered.
        opsToOrder.push(op);
        ir.OpList.remove(op);
      } else {
        // When we encounter an op that shouldn't be reordered, put the ones we've pulled so far
        // back in the correct order.
        for (const orderedOp of reorder(opsToOrder)) {
          ir.OpList.insertBefore(orderedOp, op);
        }
        opsToOrder = [];
      }
    }
    // If we still have ops pulled at the end, put them back in the correct order.
    for (const orderedOp of reorder(opsToOrder)) {
      view.update.push(orderedOp as ir.UpdateOp);
    }
  }
}

/**
 * Reorders the given list of ops according to the ordering defined by `ORDERING`.
 */
function reorder(ops: Array<ir.UpdateOp|ir.CreateOp>): Array<ir.UpdateOp|ir.CreateOp> {
  // Break the ops list into groups based on OpKind.
  const groups = Array.from(ORDERING, () => new Array<ir.UpdateOp|ir.CreateOp>());
  for (const op of ops) {
    const groupIndex = ORDERING.findIndex(o => o.kinds.has(op.kind));
    groups[groupIndex].push(op);
  }
  // Reassemble the groups into a single list, in the correct order.
  return groups.flatMap((group, i) => {
    const transform = ORDERING[i].transform;
    return transform ? transform(group) : group;
  });
}

/**
 * Keeps only the last op in a list of ops.
 */
function keepLast(ops: Array<ir.UpdateOp|ir.CreateOp>) {
  return ops.slice(ops.length - 1);
}
