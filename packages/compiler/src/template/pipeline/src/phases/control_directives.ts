/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

const ELIGIBLE_CONTROL_PROPERTIES = new Map<string, Set<ir.OpKind>>([
  ['formField', new Set([ir.OpKind.Property])],
  ['formControl', new Set([ir.OpKind.Property])],
  ['formControlName', new Set([ir.OpKind.Property, ir.OpKind.Attribute])],
  ['ngModel', new Set([ir.OpKind.Attribute, ir.OpKind.Property, ir.OpKind.TwoWayProperty])],
]);

export function specializeControlProperties(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    processView(unit);
  }
}

function processView(view: ViewCompilationUnit): void {
  for (const op of view.update) {
    // Handle Property ops, TwoWayProperty ops (for [(ngModel)]), and Attribute ops (for static formControlName="name")
    if (
      op.kind !== ir.OpKind.Property &&
      op.kind !== ir.OpKind.TwoWayProperty &&
      op.kind !== ir.OpKind.Attribute
    ) {
      continue;
    }

    const eligibleOps = ELIGIBLE_CONTROL_PROPERTIES.get(op.name);
    if (eligibleOps !== undefined && eligibleOps.has(op.kind)) {
      addControlInstruction(view, op);
    }
  }
}

const CONTROL_OP_CREATE_KINDS = new Set([
  ir.OpKind.Container,
  ir.OpKind.ContainerStart,
  ir.OpKind.ContainerEnd,
  ir.OpKind.Element,
  ir.OpKind.ElementStart,
  ir.OpKind.ElementEnd,
  ir.OpKind.Template,
]);

function isRelevantCreateOp(createOp: ir.CreateOp): createOp is ir.CreateOp & {xref: ir.XrefId} {
  return CONTROL_OP_CREATE_KINDS.has(createOp.kind);
}

function findCreateInstruction(view: ViewCompilationUnit, target: ir.XrefId): ir.CreateOp | null {
  let lastFoundOp: ir.CreateOp | null = null;
  for (const createOp of view.create) {
    if (!isRelevantCreateOp(createOp) || createOp.xref !== target) {
      continue;
    }

    lastFoundOp = createOp;
  }

  return lastFoundOp;
}

function addControlInstruction(
  view: ViewCompilationUnit,
  propertyOp: ir.PropertyOp | ir.TwoWayPropertyOp | ir.AttributeOp,
): void {
  const targetCreateOp = findCreateInstruction(view, propertyOp.target);
  if (targetCreateOp === null) {
    // If we didn't find a relevant create instruction, it's possible this property
    // was applied to an element that doesn't support control instructions (like a
    // structural directive or block). We can safely ignore it.
    return;
  }

  const controlCreateOp = ir.createControlCreateOp(propertyOp.sourceSpan);
  ir.OpList.insertAfter<ir.CreateOp>(controlCreateOp, targetCreateOp);
  ir.OpList.insertAfter<ir.UpdateOp>(
    ir.createControlOp(propertyOp.target, propertyOp.sourceSpan),
    propertyOp,
  );
}
