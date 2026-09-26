/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CUSTOM_CONTROL_CONSTRAINT_INPUTS} from '../../../../render3/signal_forms_constraints';
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
  const explicitConstraintsByTarget = new Map<ir.XrefId, Set<string>>();
  for (const op of view.update) {
    if (
      op.kind === ir.OpKind.Property ||
      op.kind === ir.OpKind.TwoWayProperty ||
      (op.kind === ir.OpKind.Attribute && op.isTextAttribute)
    ) {
      if (CUSTOM_CONTROL_CONSTRAINT_INPUTS.has(op.name)) {
        let bindings = explicitConstraintsByTarget.get(op.target);
        if (bindings === undefined) {
          bindings = new Set();
          explicitConstraintsByTarget.set(op.target, bindings);
        }
        bindings.add(op.name);
      }
    }
  }

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
      addControlInstruction(view, op, [...(explicitConstraintsByTarget.get(op.target) ?? [])]);
    }
  }
}

const CONTROL_OP_CREATE_KINDS = new Set([
  ir.OpKind.Container,
  ir.OpKind.ContainerStart,
  ir.OpKind.Element,
  ir.OpKind.ElementStart,
]);

function isRelevantCreateOp(createOp: ir.CreateOp): createOp is ir.CreateOp & {xref: ir.XrefId} {
  return CONTROL_OP_CREATE_KINDS.has(createOp.kind);
}

function findCreateInstruction(view: ViewCompilationUnit, target: ir.XrefId): ir.CreateOp | null {
  for (const createOp of view.create) {
    if (isRelevantCreateOp(createOp) && createOp.xref === target) {
      return createOp;
    }
  }

  return null;
}

function addControlInstruction(
  view: ViewCompilationUnit,
  propertyOp: ir.PropertyOp | ir.TwoWayPropertyOp | ir.AttributeOp,
  explicitConstraintBindings: readonly string[],
): void {
  const targetCreateOp = findCreateInstruction(view, propertyOp.target);
  if (targetCreateOp === null) {
    // If we didn't find a relevant create instruction, it's possible this property
    // was applied to an element that doesn't support control instructions (like a
    // structural directive or block). We can safely ignore it.
    return;
  }

  const controlCreateOp = ir.createControlCreateOp(
    propertyOp.sourceSpan,
    propertyOp.name === 'formField' ? explicitConstraintBindings : [],
  );
  ir.OpList.insertAfter<ir.CreateOp>(controlCreateOp, targetCreateOp);
  ir.OpList.insertAfter<ir.UpdateOp>(
    ir.createControlOp(propertyOp.target, propertyOp.sourceSpan),
    propertyOp,
  );
}
